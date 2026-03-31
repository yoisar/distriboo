<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Suscripcion extends Model
{
    protected $table = 'suscripciones';

    protected $fillable = [
        'distribuidor_id',
        'plan_id',
        'revendedor_id',
        'plazo_meses',
        'descuento_porcentaje',
        'precio_final_mensual',
        'setup_pagado',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    protected $casts = [
        'descuento_porcentaje' => 'decimal:2',
        'precio_final_mensual' => 'decimal:2',
        'setup_pagado' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function distribuidor(): BelongsTo
    {
        return $this->belongsTo(Distribuidor::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function revendedor(): BelongsTo
    {
        return $this->belongsTo(Revendedor::class);
    }

    public function comisiones(): HasMany
    {
        return $this->hasMany(Comision::class);
    }
}
