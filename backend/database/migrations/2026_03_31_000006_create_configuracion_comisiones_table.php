<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion_comisiones', function (Blueprint $table) {
            $table->id();
            $table->string('clave')->unique(); // porcentaje_base, bonus_nivel_1, etc.
            $table->string('valor'); // el valor de la configuración
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_comisiones');
    }
};
