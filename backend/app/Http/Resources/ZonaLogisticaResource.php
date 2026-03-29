<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ZonaLogisticaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provincia_id' => $this->provincia_id,
            'provincia' => new ProvinciaResource($this->whenLoaded('provincia')),
            'costo_base' => (float) $this->costo_base,
            'costo_por_bulto' => (float) $this->costo_por_bulto,
            'pedido_minimo' => (float) $this->pedido_minimo,
            'tiempo_entrega_dias' => (int) $this->tiempo_entrega_dias,
            'observaciones' => $this->observaciones,
            'activo' => (bool) $this->activo,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
