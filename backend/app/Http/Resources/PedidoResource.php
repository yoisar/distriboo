<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'subtotal' => (float) $this->subtotal,
            'costo_logistico' => (float) $this->costo_logistico,
            'total' => (float) $this->total,
            'estado' => $this->estado,
            'fecha_estimada_entrega' => $this->fecha_estimada_entrega,
            'observaciones' => $this->observaciones,
            'detalles' => PedidoDetalleResource::collection($this->whenLoaded('detalles')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
