<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ListaPrecio extends Model
{
    use HasFactory;

    protected $table = 'listas_precios';

    protected $fillable = [
        'distribuidor_id',
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function distribuidor(): BelongsTo
    {
        return $this->belongsTo(Distribuidor::class);
    }

    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'lista_precio_productos')
            ->withPivot('precio')
            ->withTimestamps();
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class, 'lista_precio_id');
    }

    public function preciosProductos(): HasMany
    {
        return $this->hasMany(ListaPrecioProducto::class);
    }
}
