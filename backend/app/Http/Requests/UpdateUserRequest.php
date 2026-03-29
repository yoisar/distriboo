<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($this->route('user')->id)],
            'password' => 'sometimes|string|min:8',
            'role' => ['sometimes', Rule::in(['super_admin', 'distribuidor', 'cliente'])],
            'distribuidor_id' => 'nullable|exists:distribuidores,id',
            'cliente_id' => 'nullable|exists:clientes,id',
        ];
    }
}
