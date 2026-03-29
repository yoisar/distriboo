<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // pedidos.cliente_id → RESTRICT (no eliminar cliente con pedidos)
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['cliente_id']);
            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('restrict');
        });

        // pedido_detalles.producto_id → RESTRICT (no eliminar producto referenciado en pedidos)
        Schema::table('pedido_detalles', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->foreign('producto_id')->references('id')->on('productos')->onDelete('restrict');
        });

        // clientes.provincia_id → RESTRICT (no eliminar provincia con clientes)
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['provincia_id']);
            $table->foreign('provincia_id')->references('id')->on('provincias')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['cliente_id']);
            $table->foreign('cliente_id')->references('id')->on('clientes');
        });

        Schema::table('pedido_detalles', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->foreign('producto_id')->references('id')->on('productos');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['provincia_id']);
            $table->foreign('provincia_id')->references('id')->on('provincias');
        });
    }
};
