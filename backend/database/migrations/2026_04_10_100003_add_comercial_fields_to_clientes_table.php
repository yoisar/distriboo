<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->enum('segmento', [
                'minorista',
                'mayorista',
                'autoservicio',
                'supermercado',
                'estrategico',
            ])->default('mayorista')->after('activo');
            $table->foreignId('lista_precio_id')
                ->nullable()
                ->after('segmento')
                ->constrained('listas_precios')
                ->nullOnDelete();
            $table->string('condicion_pago')->nullable()->after('lista_precio_id');
            $table->decimal('limite_credito', 12, 2)->nullable()->after('condicion_pago');
            $table->text('observaciones')->nullable()->after('limite_credito');
            $table->decimal('descuento_porcentaje', 5, 2)->default(0)->after('observaciones');
            $table->decimal('descuento_fijo', 12, 2)->default(0)->after('descuento_porcentaje');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['lista_precio_id']);
            $table->dropColumn([
                'segmento',
                'lista_precio_id',
                'condicion_pago',
                'limite_credito',
                'observaciones',
                'descuento_porcentaje',
                'descuento_fijo',
            ]);
        });
    }
};
