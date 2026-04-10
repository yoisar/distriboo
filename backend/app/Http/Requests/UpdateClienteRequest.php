<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'razon_social' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:clientes,email,' . $this->route('cliente')->id,
            'telefono' => 'nullable|string|max:50',
            'provincia_id' => 'sometimes|exists:provincias,id',
            'direccion' => 'nullable|string|max:500',
            'cuit' => 'nullable|string|max:20',
            'activo' => 'boolean',
            'segmento' => 'nullable|in:minorista,mayorista,autoservicio,supermercado,estrategico',
            'lista_precio_id' => 'nullable|exists:listas_precios,id',
            'condicion_pago' => 'nullable|string|max:255',
            'limite_credito' => 'nullable|numeric|min:0',
            'observaciones' => 'nullable|string',
            'descuento_porcentaje' => 'nullable|numeric|min:0|max:100',
            'descuento_fijo' => 'nullable|numeric|min:0',
        ];
    }
}
