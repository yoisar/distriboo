<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comisiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('revendedor_id')->constrained('revendedores')->cascadeOnDelete();
            $table->foreignId('suscripcion_id')->constrained('suscripciones')->cascadeOnDelete();
            $table->enum('tipo', ['mensual', 'setup']); // mensual recurrente o cargo de setup
            $table->decimal('monto_base', 12, 2); // monto sobre el que se calcula
            $table->decimal('porcentaje_aplicado', 5, 2); // 20, 25 o 30
            $table->decimal('monto_comision', 12, 2); // monto final de la comisión
            $table->integer('mes'); // 1-12
            $table->integer('anio'); // 2026, etc.
            $table->enum('estado', ['pendiente', 'pagada'])->default('pendiente');
            $table->date('fecha_pago')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['revendedor_id', 'mes', 'anio']);
            $table->index(['estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comisiones');
    }
};
