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
        ];
    }
}
