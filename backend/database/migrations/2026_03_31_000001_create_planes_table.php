<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // BASIC, PRO, FULL
            $table->string('slug')->unique(); // basic, pro, full
            $table->decimal('precio_mensual', 12, 2);
            $table->decimal('setup_inicial', 12, 2)->default(0);
            $table->json('caracteristicas'); // JSON con features del plan
            $table->integer('max_productos')->nullable(); // null = ilimitado
            $table->integer('max_clientes')->nullable(); // null = ilimitado
            $table->boolean('multi_vendedor')->default(false);
            $table->boolean('integraciones')->default(false);
            $table->boolean('reportes')->default(false);
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planes');
    }
};
