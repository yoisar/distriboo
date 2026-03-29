<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateZonaLogisticaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'costo_base' => 'sometimes|numeric|min:0',
            'costo_por_bulto' => 'numeric|min:0',
            'pedido_minimo' => 'numeric|min:0',
            'tiempo_entrega_dias' => 'sometimes|integer|min:1',
            'observaciones' => 'nullable|string',
            'activo' => 'boolean',
        ];
    }
}
