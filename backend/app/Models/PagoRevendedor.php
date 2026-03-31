<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagoRevendedor extends Model
{
    protected $table = 'pagos_revendedores';

    protected $fillable = [
        'revendedor_id',
        'monto_total',
        'periodo',
        'fecha_pago',
        'comprobante',
        'observaciones',
    ];

    protected $casts = [
        'monto_total' => 'decimal:2',
        'fecha_pago' => 'date',
    ];

    public function revendedor(): BelongsTo
    {
        return $this->belongsTo(Revendedor::class);
    }
}
