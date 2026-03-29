<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreZonaLogisticaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'distribuidor_id' => 'nullable|exists:distribuidores,id',
            'provincia_id' => 'required|exists:provincias,id',
            'costo_base' => 'required|numeric|min:0',
            'costo_por_bulto' => 'numeric|min:0',
            'pedido_minimo' => 'numeric|min:0',
            'tiempo_entrega_dias' => 'required|integer|min:1',
            'observaciones' => 'nullable|string',
            'activo' => 'boolean',
        ];
    }
}
