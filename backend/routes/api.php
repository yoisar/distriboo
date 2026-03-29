<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClienteController;
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

    // ── Productos (lectura para todos) ──
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::get('/productos/{producto}', [ProductoController::class, 'show']);

    // ── Pedidos ──
    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::post('/pedidos', [PedidoController::class, 'store']);
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show']);
    Route::put('/pedidos/{pedido}', [PedidoController::class, 'update']);
    Route::get('/pedidos/{pedido}/pdf', [PedidoController::class, 'pdf']);
    Route::put('/pedidos/{pedido}/cancelar', [PedidoController::class, 'cancelar']);

    // ── Admin only ──
    Route::middleware(\App\Http\Middleware\EnsureIsAdmin::class)->group(function () {
        // Productos CRUD
        Route::post('/productos', [ProductoController::class, 'store']);
        Route::put('/productos/{producto}', [ProductoController::class, 'update']);
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

        // Clientes CRUD
        Route::apiResource('clientes', ClienteController::class);

        // Zonas logísticas CRUD
        Route::apiResource('zonas-logisticas', ZonaLogisticaController::class)
            ->parameters(['zonas-logisticas' => 'zonasLogistica']);

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
        });
    });
});
