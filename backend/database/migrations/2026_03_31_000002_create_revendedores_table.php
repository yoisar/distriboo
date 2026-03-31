<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revendedores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('codigo_referido')->unique(); // código que comparten con prospects
            $table->decimal('porcentaje_base', 5, 2)->default(20.00);
            $table->string('cbu')->nullable();
            $table->string('cvu')->nullable();
            $table->string('alias_bancario')->nullable();
            $table->string('banco')->nullable();
            $table->string('titular_cuenta')->nullable();
            $table->string('cuit', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Agregar 'revendedor' al enum de roles en users
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','distribuidor','cliente','revendedor') DEFAULT 'cliente'");
    }

    public function down(): void
    {
        Schema::dropIfExists('revendedores');

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','distribuidor','cliente') DEFAULT 'cliente'");
    }
};
