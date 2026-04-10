<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listas_precios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distribuidor_id')->constrained('distribuidores')->cascadeOnDelete();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['distribuidor_id', 'nombre']);
        });

        Schema::create('lista_precio_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lista_precio_id')->constrained('listas_precios')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained()->cascadeOnDelete();
            $table->decimal('precio', 12, 2);
            $table->timestamps();

            $table->unique(['lista_precio_id', 'producto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lista_precio_productos');
        Schema::dropIfExists('listas_precios');
    }
};
