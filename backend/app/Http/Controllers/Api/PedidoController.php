<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePedidoRequest;
use App\Http\Requests\UpdateEstadoPedidoRequest;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\ZonaLogistica;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\PedidoConfirmadoMail;
use App\Mail\PedidoEstadoMail;
use App\Services\MotorPreciosService;
use Barryvdh\DomPDF\Facade\Pdf;

class PedidoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pedido::with(['cliente.provincia', 'detalles.producto']);

        $user = $request->user();

        // Filtrar por rol
        if ($user->role === 'cliente') {
            // Soporte multi-distribuidor: obtener todos los cliente_ids del usuario
            $clienteIds = $user->clientes()->pluck('clientes.id')->toArray();
            // Fallback: campo legado cliente_id en users
            if ($user->cliente_id && !in_array($user->cliente_id, $clienteIds)) {
                $clienteIds[] = $user->cliente_id;
            }
            if (!empty($clienteIds)) {
                $query->whereIn('cliente_id', $clienteIds);
            } else {
                $query->whereRaw('1 = 0'); // sin cliente asociado: no mostrar nada
            }
        } elseif ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        }
        // super_admin ve todo

        if ($request->has('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(20)
        );
    }

    public function store(StorePedidoRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $clienteId = $request->input('cliente_id');

            // Obtener zona logística del cliente
            $cliente = \App\Models\Cliente::with('provincia')->findOrFail($clienteId);
            $distribuidorId = $cliente->distribuidor_id;
            $zona = $cliente->provincia_id
                ? ZonaLogistica::where('provincia_id', $cliente->provincia_id)
                    ->where('distribuidor_id', $distribuidorId)
                    ->where('activo', true)
                    ->first()
                : null;

            $motorPrecios = new MotorPreciosService();
            $subtotal = 0.0;
            $totalBultos = 0;
            $detalles = [];

            foreach ($request->input('items') as $item) {
                $producto = Producto::findOrFail($item['producto_id']);

                if ($producto->stock < $item['cantidad']) {
                    return response()->json([
                        'message' => "Stock insuficiente para {$producto->nombre}. Disponible: {$producto->stock}",
                    ], 422);
                }

                // Usar motor de precios para resolver precio personalizado
                $precioInfo = $motorPrecios->resolverPrecio($producto, $cliente);
                $precioUnitario = $precioInfo['precio_final'];
                $subtotalItem = $precioUnitario * (int) $item['cantidad'];
                $subtotal += $subtotalItem;
                $totalBultos += $item['cantidad'];

                $detalles[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $precioUnitario,
                    'subtotal' => $subtotalItem,
                ];
            }

            // Calcular logística
            $costoLogistico = 0.0;
            $tiempoEntrega = 1;

            if ($zona) {
                $costoLogistico = (float) $zona->costo_base + ($totalBultos * (float) $zona->costo_por_bulto);
                $tiempoEntrega = $zona->tiempo_entrega_dias;

                // Validar pedido mínimo usando el total (subtotal + logística)
                $pedidoMinimo = (float) $zona->pedido_minimo;
                $totalConLogistica = $subtotal + $costoLogistico;
                if ($pedidoMinimo > 0 && $totalConLogistica < $pedidoMinimo) {
                    return response()->json([
                        'message' => "El pedido mínimo para {$cliente->provincia->nombre} es \$" . number_format($pedidoMinimo, 2, '.', '') . ". Tu pedido es \$" . number_format($totalConLogistica, 2, '.', ''),
                    ], 422);
                }
            }

            $total = $subtotal + $costoLogistico;
            $fechaEstimada = Carbon::now()->addDays($tiempoEntrega);

            $pedido = Pedido::create([
                'cliente_id' => $clienteId,
                'distribuidor_id' => $distribuidorId,
                'subtotal' => $subtotal,
                'costo_logistico' => $costoLogistico,
                'total' => $total,
                'estado' => 'pendiente',
                'fecha_estimada_entrega' => $fechaEstimada,
                'observaciones' => $request->input('observaciones'),
            ]);

            foreach ($detalles as $detalle) {
                $pedido->detalles()->create($detalle);
            }

            $pedido->load(['cliente.provincia', 'detalles.producto']);

            if ($pedido->cliente->email) {
                Mail::to($pedido->cliente->email)->send(new PedidoConfirmadoMail($pedido));
            }

            return response()->json($pedido, 201);
        });
    }

    public function show(Pedido $pedido, Request $request): JsonResponse
    {
        $user = $request->user();

        // Cliente solo puede ver sus propios pedidos
        if ($user->role === 'cliente') {
            $clienteIds = $user->clientes()->pluck('clientes.id')->toArray();
            if ($user->cliente_id && !in_array($user->cliente_id, $clienteIds)) {
                $clienteIds[] = $user->cliente_id;
            }
            if (!in_array($pedido->cliente_id, $clienteIds)) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
        }

        // Distribuidor solo puede ver pedidos de su distribuidora
        if ($user->role === 'distribuidor' && $pedido->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json(
            $pedido->load(['cliente.provincia', 'detalles.producto'])
        );
    }

    public function update(Request $request, Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo se pueden editar pedidos en estado pendiente',
            ], 422);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'observaciones' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $pedido) {
            $cliente = $pedido->cliente->load('provincia');
            $zona = $cliente->provincia_id
                ? ZonaLogistica::where('provincia_id', $cliente->provincia_id)
                    ->where('distribuidor_id', $pedido->distribuidor_id)
                    ->where('activo', true)
                    ->first()
                : null;

            $subtotal = 0.0;
            $totalBultos = 0;
            $nuevosDetalles = [];

            foreach ($request->input('items') as $item) {
                $producto = Producto::findOrFail($item['producto_id']);

                if ($producto->stock < $item['cantidad']) {
                    return response()->json([
                        'message' => "Stock insuficiente para {$producto->nombre}. Disponible: {$producto->stock}",
                    ], 422);
                }

                $precioUnitario = (float) $producto->precio;
                $subtotalItem = $precioUnitario * (int) $item['cantidad'];
                $subtotal += $subtotalItem;
                $totalBultos += $item['cantidad'];

                $nuevosDetalles[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $precioUnitario,
                    'subtotal' => $subtotalItem,
                ];
            }

            $costoLogistico = 0.0;
            $tiempoEntrega = 1;

            if ($zona) {
                $costoLogistico = (float) $zona->costo_base + ($totalBultos * (float) $zona->costo_por_bulto);
                $tiempoEntrega = $zona->tiempo_entrega_dias;

                $pedidoMinimo = (float) $zona->pedido_minimo;
                $totalConLogistica = $subtotal + $costoLogistico;
                if ($pedidoMinimo > 0 && $totalConLogistica < $pedidoMinimo) {
                    return response()->json([
                        'message' => "El pedido mínimo para {$cliente->provincia->nombre} es \$" . number_format($pedidoMinimo, 2, '.', '') . ". Tu pedido es \$" . number_format($totalConLogistica, 2, '.', ''),
                    ], 422);
                }
            }

            $total = $subtotal + $costoLogistico;
            $fechaEstimada = Carbon::now()->addDays($tiempoEntrega);

            // Eliminar detalles anteriores y crear nuevos
            $pedido->detalles()->delete();

            foreach ($nuevosDetalles as $detalle) {
                $pedido->detalles()->create($detalle);
            }

            $pedido->update([
                'subtotal' => $subtotal,
                'costo_logistico' => $costoLogistico,
                'total' => $total,
                'fecha_estimada_entrega' => $fechaEstimada,
                'observaciones' => $request->input('observaciones'),
            ]);

            return response()->json(
                $pedido->load(['cliente.provincia', 'detalles.producto'])
            );
        });
    }

    public function updateEstado(UpdateEstadoPedidoRequest $request, Pedido $pedido): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $pedido->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $nuevoEstado = $request->validated()['estado'];
        $estadoActual = $pedido->estado;

        return DB::transaction(function () use ($pedido, $nuevoEstado, $estadoActual) {
            // Al confirmar, descontar stock
            if ($nuevoEstado === 'confirmado' && $estadoActual === 'pendiente') {
                foreach ($pedido->detalles as $detalle) {
                    $producto = $detalle->producto;
                    if ($producto->stock < $detalle->cantidad) {
                        throw new \Exception("Stock insuficiente para {$producto->nombre}");
                    }
                    $producto->decrement('stock', $detalle->cantidad);
                }
            }

            // Al cancelar un pedido confirmado, devolver stock
            if ($nuevoEstado === 'cancelado' && in_array($estadoActual, ['confirmado', 'en_proceso'])) {
                foreach ($pedido->detalles as $detalle) {
                    $detalle->producto->increment('stock', $detalle->cantidad);
                }
            }

            $pedido->update(['estado' => $nuevoEstado]);

            $pedido->load(['cliente.provincia', 'detalles.producto']);

            if ($pedido->cliente->email) {
                Mail::to($pedido->cliente->email)->send(new PedidoEstadoMail($pedido, $estadoActual));
            }

            return response()->json($pedido);
        });
    }

    public function pdf(Pedido $pedido, Request $request)
    {
        $user = $request->user();

        if ($user->role === 'cliente' && $user->cliente_id !== $pedido->cliente_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->role === 'distribuidor' && $pedido->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $pedido->load(['cliente.provincia', 'detalles.producto']);

        $pdf = Pdf::loadView('pdf.pedido', compact('pedido'));

        return $pdf->download("pedido-{$pedido->id}.pdf");
    }

    public function cancelar(Pedido $pedido, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'cliente' && $user->cliente_id !== $pedido->cliente_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->role === 'distribuidor' && $pedido->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($pedido->estado !== 'pendiente') {
            return response()->json(['message' => 'Solo se pueden cancelar pedidos pendientes'], 422);
        }

        $pedido->update(['estado' => 'cancelado']);

        return response()->json($pedido->load(['cliente.provincia', 'detalles.producto']));
    }

    /**
     * Reordenar: crea un nuevo pedido basándose en uno anterior.
     * Respeta precios actuales y stock actual.
     */
    public function reordenar(Pedido $pedido, Request $request): JsonResponse
    {
        $user = $request->user();

        // Verificar acceso
        if ($user->role === 'cliente') {
            $clienteIds = $user->clientes()->pluck('clientes.id')->toArray();
            if ($user->cliente_id && !in_array($user->cliente_id, $clienteIds)) {
                $clienteIds[] = $user->cliente_id;
            }
            if (!in_array($pedido->cliente_id, $clienteIds)) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
        }

        $pedido->load('detalles');

        // Construir items del nuevo pedido con cantidades del pedido anterior
        $items = $pedido->detalles->map(function ($detalle) {
            return [
                'producto_id' => $detalle->producto_id,
                'cantidad' => $detalle->cantidad,
            ];
        })->toArray();

        // Reutilizar la lógica de store creando un request interno
        $storeRequest = new StorePedidoRequest();
        $storeRequest->merge([
            'cliente_id' => $pedido->cliente_id,
            'items' => $items,
            'observaciones' => 'Recompra del pedido #' . $pedido->id,
        ]);
        $storeRequest->setUserResolver(function () use ($request) {
            return $request->user();
        });

        return $this->store($storeRequest);
    }
}
