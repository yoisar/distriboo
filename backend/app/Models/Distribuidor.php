<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Distribuidor extends Model
{
    use HasFactory;

    protected $table = 'distribuidores';

    protected $fillable = [
        'nombre_comercial',
        'razon_social',
        'email_contacto',
        'telefono',
        'direccion',
        'activo',
        'revendedor_id',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class);
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class);
    }

    public function zonasLogisticas(): HasMany
    {
        return $this->hasMany(ZonaLogistica::class);
    }

    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }

    public function revendedor(): BelongsTo
    {
        return $this->belongsTo(Revendedor::class);
    }

    public function suscripciones(): HasMany
    {
        return $this->hasMany(Suscripcion::class);
    }
}
