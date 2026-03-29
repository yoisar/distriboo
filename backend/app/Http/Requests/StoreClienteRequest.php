<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'distribuidor_id' => 'nullable|exists:distribuidores,id',
            'razon_social' => 'required|string|max:255',
            'email' => 'required|email|unique:clientes,email',
            'telefono' => 'nullable|string|max:50',
            'provincia_id' => 'required|exists:provincias,id',
            'direccion' => 'nullable|string|max:500',
            'cuit' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ];
    }
}
