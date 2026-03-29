<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla distribuidores
        Schema::create('distribuidores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_comercial');
            $table->string('razon_social')->nullable();
            $table->string('email_contacto')->nullable();
            $table->string('telefono', 50)->nullable();
            $table->text('direccion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 2. Actualizar users: cambiar enum role y agregar distribuidor_id
        // Primero expandir ENUM para incluir todos los valores (viejos + nuevos)
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','super_admin','distribuidor','cliente') DEFAULT 'cliente'");

        // Convertir admin existente a super_admin
        DB::table('users')->where('role', 'admin')->update(['role' => 'super_admin']);

        // Ahora quitar 'admin' del ENUM
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','distribuidor','cliente') DEFAULT 'cliente'");

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('distribuidor_id')->nullable()->after('role')->constrained('distribuidores')->nullOnDelete();
        });

        // 3. Agregar distribuidor_id a clientes
        Schema::table('clientes', function (Blueprint $table) {
            $table->foreignId('distribuidor_id')->nullable()->after('id')->constrained('distribuidores')->cascadeOnDelete();
        });

        // 4. Agregar distribuidor_id a productos
        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('distribuidor_id')->nullable()->after('id')->constrained('distribuidores')->cascadeOnDelete();
        });

        // 5. Agregar distribuidor_id a zonas_logisticas
        Schema::table('zonas_logisticas', function (Blueprint $table) {
            $table->foreignId('distribuidor_id')->nullable()->after('id')->constrained('distribuidores')->cascadeOnDelete();
        });

        // 6. Agregar distribuidor_id a pedidos
        Schema::table('pedidos', function (Blueprint $table) {
            $table->foreignId('distribuidor_id')->nullable()->after('cliente_id')->constrained('distribuidores')->nullOnDelete();
        });
    }

    public function down(): void
    {
        // Revertir distribuidor_id de todas las tablas
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['distribuidor_id']);
            $table->dropColumn('distribuidor_id');
        });

        Schema::table('zonas_logisticas', function (Blueprint $table) {
            $table->dropForeign(['distribuidor_id']);
            $table->dropColumn('distribuidor_id');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['distribuidor_id']);
            $table->dropColumn('distribuidor_id');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['distribuidor_id']);
            $table->dropColumn('distribuidor_id');
        });

        // Revertir super_admin → admin
        DB::table('users')->where('role', 'super_admin')->update(['role' => 'admin']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['distribuidor_id']);
            $table->dropColumn('distribuidor_id');
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','cliente') DEFAULT 'cliente'");

        Schema::dropIfExists('distribuidores');
    }
};
