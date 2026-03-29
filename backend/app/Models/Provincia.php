<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Provincia extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'activo'];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function zonasLogisticas(): HasMany
    {
        return $this->hasMany(ZonaLogistica::class);
    }

    /**
     * Alias de compatibilidad para acceso directo a zona (sin multi-tenant).
     * Si hay una sola zona sin distribuidor_id, la retorna.
     */
    public function zonaLogistica(): HasOne
    {
        return $this->hasOne(ZonaLogistica::class);
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class);
    }
}
