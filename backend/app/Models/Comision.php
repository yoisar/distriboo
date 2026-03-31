<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comision extends Model
{
    protected $table = 'comisiones';

    protected $fillable = [
        'revendedor_id',
        'suscripcion_id',
        'tipo',
        'monto_base',
        'porcentaje_aplicado',
        'monto_comision',
        'mes',
        'anio',
        'estado',
        'fecha_pago',
        'observaciones',
    ];

    protected $casts = [
        'monto_base' => 'decimal:2',
        'porcentaje_aplicado' => 'decimal:2',
        'monto_comision' => 'decimal:2',
        'fecha_pago' => 'date',
    ];

    public function revendedor(): BelongsTo
    {
        return $this->belongsTo(Revendedor::class);
    }

    public function suscripcion(): BelongsTo
    {
        return $this->belongsTo(Suscripcion::class);
    }
}
