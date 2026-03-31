<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos_revendedores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('revendedor_id')->constrained('revendedores')->cascadeOnDelete();
            $table->decimal('monto_total', 12, 2);
            $table->string('periodo'); // "2026-03", "2026-04", etc.
            $table->date('fecha_pago');
            $table->string('comprobante')->nullable(); // path al archivo
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos_revendedores');
    }
};
