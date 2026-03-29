<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zonas_logisticas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provincia_id')->constrained('provincias')->onDelete('cascade');
            $table->decimal('costo_base', 10, 2)->default(0);
            $table->decimal('costo_por_bulto', 10, 2)->default(0);
            $table->decimal('pedido_minimo', 10, 2)->default(0);
            $table->integer('tiempo_entrega_dias')->default(1);
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zonas_logisticas');
    }
};
