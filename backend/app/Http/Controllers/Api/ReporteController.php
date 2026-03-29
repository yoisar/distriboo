<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    public function dashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['super_admin', 'distribuidor'])) {
            $pedidosQuery = Pedido::query();
            $clientesQuery = Cliente::query();
            $productosQuery = Producto::query();

            if ($user->role === 'distribuidor') {
                $pedidosQuery->where('distribuidor_id', $user->distribuidor_id);
                $clientesQuery->where('distribuidor_id', $user->distribuidor_id);
                $productosQuery->where('distribuidor_id', $user->distribuidor_id);
            }

            $totalPedidos = (clone $pedidosQuery)->count();
            $pedidosPendientes = (clone $pedidosQuery)->where('estado', 'pendiente')->count();
            $ventasMes = (clone $pedidosQuery)->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->whereNotIn('estado', ['cancelado'])
                ->sum('total');
            $totalClientes = (clone $clientesQuery)->where('activo', true)->count();
            $totalProductos = (clone $productosQuery)->where('activo', true)->count();
            $stockBajo = (clone $productosQuery)->where('stock', '<', 10)->where('activo', true)->count();

            return response()->json([
                'total_pedidos' => $totalPedidos,
                'pedidos_pendientes' => $pedidosPendientes,
                'ventas_mes' => $ventasMes,
                'total_clientes' => $totalClientes,
                'total_productos' => $totalProductos,
                'stock_bajo' => $stockBajo,
            ]);
        }

        // Cliente
        $clienteId = $user->cliente_id;
        $misPedidos = Pedido::where('cliente_id', $clienteId)->count();
        $pendientes = Pedido::where('cliente_id', $clienteId)->where('estado', 'pendiente')->count();
        $enCamino = Pedido::where('cliente_id', $clienteId)->where('estado', 'enviado')->count();
        $ultimoPedido = Pedido::where('cliente_id', $clienteId)->latest()->first();

        return response()->json([
            'mis_pedidos' => $misPedidos,
            'pendientes' => $pendientes,
            'en_camino' => $enCamino,
            'ultimo_pedido' => $ultimoPedido?->created_at?->toDateString(),
        ]);
    }

    public function pedidosPorProvincia(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Pedido::join('clientes', 'pedidos.cliente_id', '=', 'clientes.id')
            ->join('provincias', 'clientes.provincia_id', '=', 'provincias.id');

        if ($user->role === 'distribuidor') {
            $query->where('pedidos.distribuidor_id', $user->distribuidor_id);
        }

        $data = $query->select('provincias.nombre as provincia', DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(pedidos.total) as monto_total'))
            ->groupBy('provincias.nombre')
            ->orderByDesc('total_pedidos')
            ->get();

        return response()->json($data);
    }

    public function productosMasVendidos(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = PedidoDetalle::join('productos', 'pedido_detalles.producto_id', '=', 'productos.id');

        if ($user->role === 'distribuidor') {
            $query->where('productos.distribuidor_id', $user->distribuidor_id);
        }

        $data = $query->select('productos.nombre', DB::raw('SUM(pedido_detalles.cantidad) as total_vendido'), DB::raw('SUM(pedido_detalles.subtotal) as monto_total'))
            ->groupBy('productos.nombre')
            ->orderByDesc('total_vendido')
            ->limit(10)
            ->get();

        return response()->json($data);
    }

    public function clientesTop(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Pedido::join('clientes', 'pedidos.cliente_id', '=', 'clientes.id');

        if ($user->role === 'distribuidor') {
            $query->where('pedidos.distribuidor_id', $user->distribuidor_id);
        }

        $data = $query->select('clientes.razon_social', DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(pedidos.total) as monto_total'))
            ->groupBy('clientes.razon_social')
            ->orderByDesc('monto_total')
            ->limit(10)
            ->get();

        return response()->json($data);
    }

    public function stockBajo(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Producto::where('stock', '<', 10)->where('activo', true);

        if ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        }

        $data = $query->orderBy('stock')->get(['id', 'nombre', 'marca', 'stock']);

        return response()->json($data);
    }
}
