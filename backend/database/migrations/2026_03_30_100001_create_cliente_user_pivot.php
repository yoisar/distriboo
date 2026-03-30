<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivot cliente_user: un mismo usuario puede estar asociado
     * a múltiples clientes (uno por distribuidor).
     * Esto permite que un comprador mayorista opere con varios distribuidores
     * desde una única cuenta.
     */
    public function up(): void
    {
        Schema::create('cliente_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unique(['cliente_id', 'user_id']);
            $table->timestamps();
        });

        // Migrar datos existentes: users.cliente_id → pivot table
        $existingRelations = DB::table('users')
            ->whereNotNull('cliente_id')
            ->where('role', 'cliente')
            ->select('id as user_id', 'cliente_id')
            ->get();

        foreach ($existingRelations as $relation) {
            DB::table('cliente_user')->insertOrIgnore([
                'cliente_id'  => $relation->cliente_id,
                'user_id'     => $relation->user_id,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_user');
    }
};
