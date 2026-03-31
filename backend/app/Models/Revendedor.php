<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Revendedor extends Model
{
    use SoftDeletes;

    protected $table = 'revendedores';

    protected $fillable = [
        'user_id',
        'codigo_referido',
        'porcentaje_base',
        'cbu',
        'cvu',
        'alias_bancario',
        'banco',
        'titular_cuenta',
        'cuit',
        'activo',
    ];

    protected $casts = [
        'porcentaje_base' => 'decimal:2',
        'activo' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function distribuidores(): HasMany
    {
        return $this->hasMany(Distribuidor::class);
    }

    public function suscripciones(): HasMany
    {
        return $this->hasMany(Suscripcion::class);
    }

    public function comisiones(): HasMany
    {
        return $this->hasMany(Comision::class);
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(PagoRevendedor::class);
    }

    /**
     * Cuenta clientes activos (distribuidores con suscripción activa referidos por este revendedor)
     */
    public function clientesActivos(): int
    {
        return $this->suscripciones()->where('estado', 'activa')->count();
    }

    /**
     * Determina el porcentaje de comisión según cantidad de clientes activos
     */
    public function porcentajeVigente(): float
    {
        $activos = $this->clientesActivos();
        $config = ConfiguracionComision::getConfigArray();

        if ($activos >= ($config['bonus_nivel_2_min_clientes'] ?? 5)) {
            return (float) ($config['bonus_nivel_2_porcentaje'] ?? 30);
        }

        if ($activos >= ($config['bonus_nivel_1_min_clientes'] ?? 3)) {
            return (float) ($config['bonus_nivel_1_porcentaje'] ?? 25);
        }

        return (float) $this->porcentaje_base;
    }
}
