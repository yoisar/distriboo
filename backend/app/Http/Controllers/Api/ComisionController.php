<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comision;
use App\Models\PagoRevendedor;
use App\Models\Revendedor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComisionController extends Controller
{
    /**
     * Listar comisiones (Super Admin ve todas, Revendedor ve las suyas)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);

        $query = Comision::with(['revendedor.user:id,name,email', 'suscripcion.plan', 'suscripcion.distribuidor:id,nombre_comercial']);

        // Filtrar por revendedor si es revendedor
        if ($user->role === 'revendedor') {
            $revendedor = Revendedor::where('user_id', $user->id)->firstOrFail();
            $query->where('revendedor_id', $revendedor->id);
        }

        // Filtros opcionales
        if ($request->filled('revendedor_id')) {
            $query->where('revendedor_id', $request->revendedor_id);
        }
        if ($request->filled('mes')) {
            $query->where('mes', $request->mes);
        }
        if ($request->filled('anio')) {
            $query->where('anio', $request->anio);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $comisiones = $query->orderByDesc('anio')->orderByDesc('mes')->paginate($perPage);

        return response()->json($comisiones);
    }

    /**
     * Marcar comisiones como pagadas (Super Admin)
     */
    public function marcarPagadas(Request $request): JsonResponse
    {
        $data = $request->validate([
            'comision_ids' => 'required|array|min:1',
            'comision_ids.*' => 'exists:comisiones,id',
            'fecha_pago' => 'required|date',
            'observaciones' => 'nullable|string',
        ]);

        Comision::whereIn('id', $data['comision_ids'])
            ->where('estado', 'pendiente')
            ->update([
                'estado' => 'pagada',
                'fecha_pago' => $data['fecha_pago'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

        return response()->json(['message' => 'Comisiones marcadas como pagadas']);
    }

    /**
     * Resumen de comisiones para el dashboard del revendedor
     */
    public function resumenRevendedor(Request $request): JsonResponse
    {
        $user = $request->user();
        $revendedor = Revendedor::where('user_id', $user->id)->firstOrFail();

        $comisionesAcumuladas = Comision::where('revendedor_id', $revendedor->id)
            ->where('estado', 'pagada')
            ->sum('monto_comision');

        $comisionesPendientes = Comision::where('revendedor_id', $revendedor->id)
            ->where('estado', 'pendiente')
            ->sum('monto_comision');

        $clientesActivos = $revendedor->clientesActivos();
        $porcentajeVigente = $revendedor->porcentajeVigente();

        return response()->json([
            'clientes_activos' => $clientesActivos,
            'comisiones_acumuladas' => $comisionesAcumuladas,
            'comisiones_pendientes' => $comisionesPendientes,
            'porcentaje_vigente' => $porcentajeVigente,
        ]);
    }

    /**
     * Clientes del revendedor (distribuidores referidos)
     */
    public function misClientes(Request $request): JsonResponse
    {
        $user = $request->user();
        $revendedor = Revendedor::where('user_id', $user->id)->firstOrFail();

        $clientes = $revendedor->suscripciones()
            ->with(['distribuidor:id,nombre_comercial,email_contacto', 'plan:id,nombre,precio_mensual'])
            ->get()
            ->map(function ($suscripcion) {
                return [
                    'distribuidor' => $suscripcion->distribuidor->nombre_comercial ?? 'N/A',
                    'email' => $suscripcion->distribuidor->email_contacto ?? '',
                    'plan' => $suscripcion->plan->nombre ?? 'N/A',
                    'precio_mensual' => $suscripcion->precio_final_mensual,
                    'fecha_alta' => $suscripcion->fecha_inicio,
                    'estado' => $suscripcion->estado,
                ];
            });

        return response()->json($clientes);
    }

    /**
     * Liquidaciones del revendedor
     */
    public function liquidaciones(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'revendedor') {
            $revendedor = Revendedor::where('user_id', $user->id)->firstOrFail();
            $pagos = PagoRevendedor::where('revendedor_id', $revendedor->id)
                ->orderByDesc('fecha_pago')
                ->paginate(15);
        } else {
            // Super Admin ve todas
            $pagos = PagoRevendedor::with('revendedor.user:id,name')
                ->orderByDesc('fecha_pago')
                ->paginate(15);
        }

        return response()->json($pagos);
    }

    /**
     * Registrar pago a revendedor (Super Admin)
     */
    public function registrarPago(Request $request): JsonResponse
    {
        $data = $request->validate([
            'revendedor_id' => 'required|exists:revendedores,id',
            'monto_total' => 'required|numeric|min:0',
            'periodo' => 'required|string|max:7', // "2026-03"
            'fecha_pago' => 'required|date',
            'comprobante' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ]);

        $pago = PagoRevendedor::create($data);

        return response()->json($pago, 201);
    }
}
