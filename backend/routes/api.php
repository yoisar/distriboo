<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\DistribuidorController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ProvinciaController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ZonaLogisticaController;
use Illuminate\Support\Facades\Route;

// ── Auth ──
Route::post('/login', [AuthController::class, 'login']);

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
