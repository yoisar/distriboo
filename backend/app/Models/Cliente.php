<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'distribuidor_id',
        'razon_social',
        'email',
        'telefono',
        'provincia_id',
        'direccion',
        'cuit',
        'activo',
    ];

    protected $casts = [
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

    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /** Usuarios (con rol cliente) asociados a este cliente via pivot. */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'cliente_user')->withTimestamps();
    }
}
