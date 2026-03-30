<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8',
            'role'          => ['required', Rule::in(['super_admin', 'distribuidor', 'cliente'])],
            'distribuidor_id' => 'nullable|exists:distribuidores,id',
            'cliente_id'    => 'nullable|exists:clientes,id',
            'cliente_ids'   => 'nullable|array',
            'cliente_ids.*' => 'integer|exists:clientes,id',
        ];
    }
}
