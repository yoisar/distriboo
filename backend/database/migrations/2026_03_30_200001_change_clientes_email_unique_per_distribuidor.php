<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Permite que el mismo email exista en la tabla clientes para distintos
 * distribuidores. Esto habilita que un cliente mayorista pueda comprar a
 * varios distribuidores sin generar conflictos de unicidad.
 *
 * Antes: unique(email)
 * Ahora: unique(email, distribuidor_id)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            // Eliminar el índice único global de email
            $table->dropUnique(['email']);
            // Agregar índice único compuesto: mismo email solo una vez por distribuidor
            $table->unique(['email', 'distribuidor_id'], 'clientes_email_distribuidor_unique');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropUnique('clientes_email_distribuidor_unique');
            $table->unique('email');
        });
    }
};
