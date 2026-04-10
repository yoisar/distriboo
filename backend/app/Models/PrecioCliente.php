<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrecioCliente extends Model
{
    protected $table = 'precios_clientes';

    protected $fillable = [
        'cliente_id',
        'producto_id',
        'precio',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
