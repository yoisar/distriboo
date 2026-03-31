<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distribuidor_id')->constrained('distribuidores')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('planes');
            $table->foreignId('revendedor_id')->nullable()->constrained('revendedores')->nullOnDelete();
            $table->integer('plazo_meses'); // 3, 6, 12
            $table->decimal('descuento_porcentaje', 5, 2)->default(0); // 10, 20, 30
            $table->decimal('precio_final_mensual', 12, 2); // precio post descuento
            $table->decimal('setup_pagado', 12, 2)->default(0);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', ['activa', 'cancelada', 'vencida', 'pendiente'])->default('pendiente');
            $table->timestamps();
        });

        // Agregar revendedor_id a distribuidores
        Schema::table('distribuidores', function (Blueprint $table) {
            $table->foreignId('revendedor_id')->nullable()->after('activo')->constrained('revendedores')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('distribuidores', function (Blueprint $table) {
            $table->dropForeign(['revendedor_id']);
            $table->dropColumn('revendedor_id');
        });

        Schema::dropIfExists('suscripciones');
    }
};
