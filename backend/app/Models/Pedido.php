<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'subtotal',
        'costo_logistico',
        'total',
        'estado',
        'fecha_estimada_entrega',
        'observaciones',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'costo_logistico' => 'decimal:2',
        'total' => 'decimal:2',
        'fecha_estimada_entrega' => 'date',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(PedidoDetalle::class);
    }
}
