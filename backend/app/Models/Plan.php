<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $table = 'planes';

    protected $fillable = [
        'nombre',
        'slug',
        'precio_mensual',
        'setup_inicial',
        'caracteristicas',
        'max_productos',
        'max_clientes',
        'multi_vendedor',
        'integraciones',
        'reportes',
        'orden',
        'activo',
    ];

    protected $casts = [
        'precio_mensual' => 'decimal:2',
        'setup_inicial' => 'decimal:2',
        'caracteristicas' => 'array',
        'multi_vendedor' => 'boolean',
        'integraciones' => 'boolean',
        'reportes' => 'boolean',
        'activo' => 'boolean',
    ];

    public function suscripciones(): HasMany
    {
        return $this->hasMany(Suscripcion::class);
    }
}
