<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ComisionController;
use App\Http\Controllers\Api\ConfiguracionComisionController;
use App\Http\Controllers\Api\DistribuidorController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ProvinciaController;
use App\Http\Controllers\Api\ReporteComisionController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\RevendedorController;
use App\Http\Controllers\Api\SuscripcionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ZonaLogisticaController;
use Illuminate\Support\Facades\Route;

// ── Auth ──
Route::post('/login', [AuthController::class, 'login']);

// ── Planes (público para landing page) ──
Route::get('/planes', [PlanController::class, 'index']);
Route::get('/planes/{plan}', [PlanController::class, 'show']);

// ── Validar código de referido (público) ──
Route::get('/validar-referido/{codigo}', function (string $codigo) {
    $revendedor = \App\Models\Revendedor::where('codigo_referido', $codigo)
        ->where('activo', true)
        ->first();

    if (!$revendedor) {
        return response()->json(['valido' => false], 404);
    }

    return response()->json(['valido' => true, 'nombre' => $revendedor->user->name ?? '']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // ── Provincias (lectura para todos) ──
    Route::get('/provincias', [ProvinciaController::class, 'index']);

    // ── Dashboard stats ──
    Route::get('/dashboard/stats', [ReporteController::class, 'dashboardStats']);

    // ── Productos (lectura para todos los autenticados) ──
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::get('/productos/{producto}', [ProductoController::class, 'show']);

    // ── Zonas logísticas (lectura para todos los autenticados) ──
    Route::get('/zonas-logisticas', [ZonaLogisticaController::class, 'index']);
    Route::get('/zonas-logisticas/{zonasLogistica}', [ZonaLogisticaController::class, 'show']);

    // ── Pedidos ──
    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::post('/pedidos', [PedidoController::class, 'store']);
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show']);
    Route::put('/pedidos/{pedido}', [PedidoController::class, 'update']);
    Route::get('/pedidos/{pedido}/pdf', [PedidoController::class, 'pdf']);
    Route::put('/pedidos/{pedido}/cancelar', [PedidoController::class, 'cancelar']);

    // ── Super Admin only: gestión de distribuidores ──
    Route::middleware('role:super_admin')->group(function () {
        Route::apiResource('distribuidores', DistribuidorController::class);

        // ── Revendedores CRUD ──
        Route::apiResource('revendedores', RevendedorController::class);

        // ── Suscripciones ──
        Route::apiResource('suscripciones', SuscripcionController::class);

        // ── Planes (admin CRUD) ──
        Route::get('/admin/planes', [PlanController::class, 'indexAdmin']);
        Route::post('/admin/planes', [PlanController::class, 'store']);
        Route::put('/admin/planes/{plan}', [PlanController::class, 'update']);
        Route::delete('/admin/planes/{plan}', [PlanController::class, 'destroy']);

        // ── Comisiones (admin) ──
        Route::get('/admin/comisiones', [ComisionController::class, 'index']);
        Route::post('/admin/comisiones/marcar-pagadas', [ComisionController::class, 'marcarPagadas']);
        Route::post('/admin/comisiones/registrar-pago', [ComisionController::class, 'registrarPago']);
        Route::get('/admin/liquidaciones', [ComisionController::class, 'liquidaciones']);

        // ── Configuración de comisiones ──
        Route::get('/admin/configuracion-comisiones', [ConfiguracionComisionController::class, 'index']);
        Route::put('/admin/configuracion-comisiones', [ConfiguracionComisionController::class, 'update']);

        // ── Reportes de comisiones ──
        Route::prefix('admin/reportes')->group(function () {
            Route::get('/comisiones-por-revendedor', [ReporteComisionController::class, 'comisionesPorRevendedor']);
            Route::get('/clientes-por-plan', [ReporteComisionController::class, 'clientesPorPlan']);
            Route::get('/mrr', [ReporteComisionController::class, 'mrr']);
            Route::get('/ranking-revendedores', [ReporteComisionController::class, 'rankingRevendedores']);
        });
    });

    // ── Revendedor (solo su panel) ──
    Route::middleware('role:revendedor')->prefix('revendedor')->group(function () {
        Route::get('/dashboard', [ComisionController::class, 'resumenRevendedor']);
        Route::get('/mis-clientes', [ComisionController::class, 'misClientes']);
        Route::get('/comisiones', [ComisionController::class, 'index']);
        Route::get('/liquidaciones', [ComisionController::class, 'liquidaciones']);
        Route::get('/proyeccion', [ReporteComisionController::class, 'proyeccionRevendedor']);
        Route::get('/perfil', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $revendedor = \App\Models\Revendedor::where('user_id', $user->id)->firstOrFail();
            return response()->json($revendedor->load('user:id,name,email'));
        });
        Route::put('/perfil', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $revendedor = \App\Models\Revendedor::where('user_id', $user->id)->firstOrFail();
            $data = $request->validate([
                'cbu' => 'nullable|string|max:255',
                'cvu' => 'nullable|string|max:255',
                'alias_bancario' => 'nullable|string|max:255',
                'banco' => 'nullable|string|max:255',
                'titular_cuenta' => 'nullable|string|max:255',
                'cuit' => 'nullable|string|max:20',
            ]);
            $revendedor->update($data);
            return response()->json($revendedor->load('user:id,name,email'));
        });
    });

    // ── Admin (super_admin + distribuidor) ──
    Route::middleware(\App\Http\Middleware\EnsureIsAdmin::class)->group(function () {
        // Productos CRUD
        Route::post('/productos', [ProductoController::class, 'store']);
        Route::put('/productos/{producto}', [ProductoController::class, 'update']);
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

        // Clientes CRUD
        Route::apiResource('clientes', ClienteController::class);

        // Zonas logísticas CRUD (solo escritura; lectura disponible para todos los autenticados)
        Route::apiResource('zonas-logisticas', ZonaLogisticaController::class)
            ->parameters(['zonas-logisticas' => 'zonasLogistica'])
            ->except(['index', 'show']);

        // Estado pedidos
        Route::put('/pedidos/{pedido}/estado', [PedidoController::class, 'updateEstado']);

        // Usuarios
        Route::apiResource('users', UserController::class);

        // Reportes
        Route::prefix('reportes')->group(function () {
            Route::get('/pedidos-por-provincia', [ReporteController::class, 'pedidosPorProvincia']);
            Route::get('/productos-mas-vendidos', [ReporteController::class, 'productosMasVendidos']);
            Route::get('/clientes-top', [ReporteController::class, 'clientesTop']);
            Route::get('/stock-bajo', [ReporteController::class, 'stockBajo']);
            Route::get('/pedidos-por-mes', [ReporteController::class, 'pedidosPorMes']);
        });

        // ── Importación / Exportación CSV ──
        // Plantillas descargables
        Route::get('/importar/plantilla/productos', [ImportController::class, 'plantillaProductos']);
        Route::get('/importar/plantilla/clientes', [ImportController::class, 'plantillaClientes']);
        Route::get('/importar/plantilla/zonas', [ImportController::class, 'plantillaZonas']);

        // Importar desde CSV
        Route::post('/importar/productos', [ImportController::class, 'importarProductos']);
        Route::post('/importar/clientes', [ImportController::class, 'importarClientes']);
        Route::post('/importar/zonas', [ImportController::class, 'importarZonas']);
    });
});
