<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZonaLogistica extends Model
{
    use HasFactory;

    protected $table = 'zonas_logisticas';

    protected $fillable = [
        'distribuidor_id',
        'provincia_id',
        'costo_base',
        'costo_por_bulto',
        'pedido_minimo',
        'tiempo_entrega_dias',
        'observaciones',
        'activo',
    ];

    protected $casts = [
        'costo_base' => 'decimal:2',
        'costo_por_bulto' => 'decimal:2',
        'pedido_minimo' => 'decimal:2',
        'tiempo_entrega_dias' => 'integer',
        'activo' => 'boolean',
    ];

    public function distribuidor(): BelongsTo
    {
        return $this->belongsTo(Distribuidor::class);
    }

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }
}
