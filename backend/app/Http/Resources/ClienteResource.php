<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'razon_social' => $this->razon_social,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'provincia_id' => $this->provincia_id,
            'provincia' => new ProvinciaResource($this->whenLoaded('provincia')),
            'direccion' => $this->direccion,
            'cuit' => $this->cuit,
            'activo' => (bool) $this->activo,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
