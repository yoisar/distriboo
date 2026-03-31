<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionComision extends Model
{
    protected $table = 'configuracion_comisiones';

    protected $fillable = [
        'clave',
        'valor',
        'descripcion',
    ];

    /**
     * Obtener valor de configuración por clave
     */
    public static function getValor(string $clave, string $default = ''): string
    {
        return static::where('clave', $clave)->value('valor') ?? $default;
    }

    /**
     * Obtener todas las configuraciones como array clave => valor
     */
    public static function getConfigArray(): array
    {
        return static::pluck('valor', 'clave')->toArray();
    }
}
