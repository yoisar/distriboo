<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'distribuidor_id',
        'cliente_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function distribuidor(): BelongsTo
    {
        return $this->belongsTo(Distribuidor::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isDistribuidor(): bool
    {
        return $this->role === 'distribuidor';
    }

    public function isCliente(): bool
    {
        return $this->role === 'cliente';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'distribuidor']);
    }

    /**
     * Obtiene el distribuidor_id efectivo del usuario.
     * Super admin: null (ve todo). Distribuidor: su propio distribuidor_id. Cliente: el de su cliente.
     */
    public function getEffectiveDistribuidorId(): ?int
    {
        if ($this->role === 'super_admin') {
            return null;
        }

        return $this->distribuidor_id;
    }
}
