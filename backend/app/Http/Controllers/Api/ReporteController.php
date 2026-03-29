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

        if ($user->role === 'admin') {
            $totalPedidos = Pedido::count();
            $pedidosPendientes = Pedido::where('estado', 'pendiente')->count();
            $ventasMes = Pedido::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->whereNotIn('estado', ['cancelado'])
                ->sum('total');
            $totalClientes = Cliente::where('activo', true)->count();
            $totalProductos = Producto::where('activo', true)->count();
            $stockBajo = Producto::where('stock', '<', 10)->where('activo', true)->count();

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

    public function pedidosPorProvincia(): JsonResponse
    {
        $data = Pedido::join('clientes', 'pedidos.cliente_id', '=', 'clientes.id')
            ->join('provincias', 'clientes.provincia_id', '=', 'provincias.id')
            ->select('provincias.nombre as provincia', DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(pedidos.total) as monto_total'))
            ->groupBy('provincias.nombre')
            ->orderByDesc('total_pedidos')
            ->get();

        return response()->json($data);
    }

    public function productosMasVendidos(): JsonResponse
    {
        $data = PedidoDetalle::join('productos', 'pedido_detalles.producto_id', '=', 'productos.id')
            ->select('productos.nombre', DB::raw('SUM(pedido_detalles.cantidad) as total_vendido'), DB::raw('SUM(pedido_detalles.subtotal) as monto_total'))
            ->groupBy('productos.nombre')
            ->orderByDesc('total_vendido')
            ->limit(10)
            ->get();

        return response()->json($data);
    }

    public function clientesTop(): JsonResponse
    {
        $data = Pedido::join('clientes', 'pedidos.cliente_id', '=', 'clientes.id')
            ->select('clientes.razon_social', DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(pedidos.total) as monto_total'))
            ->groupBy('clientes.razon_social')
            ->orderByDesc('monto_total')
            ->limit(10)
            ->get();

        return response()->json($data);
    }

    public function stockBajo(): JsonResponse
    {
        $data = Producto::where('stock', '<', 10)
            ->where('activo', true)
            ->orderBy('stock')
            ->get(['id', 'nombre', 'marca', 'stock']);

        return response()->json($data);
    }
}
