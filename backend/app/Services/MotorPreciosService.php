<?php

namespace App\Services;

use App\Models\Cliente;
use App\Models\ListaPrecioProducto;
use App\Models\PrecioCliente;
use App\Models\Producto;

class MotorPreciosService
{
    /**
     * Resuelve el precio de un producto para un cliente, según prioridad:
     * 1. Precio específico por cliente
     * 2. Precio por lista de precios comercial
     * 3. Precio general del producto
     *
     * Luego aplica descuentos del cliente (porcentual y/o fijo).
     */
    public function resolverPrecio(Producto $producto, Cliente $cliente): array
    {
        $precioBase = (float) $producto->precio;
        $fuente = 'general';

        // 1. Precio específico por cliente (máxima prioridad)
        $precioCliente = PrecioCliente::where('cliente_id', $cliente->id)
            ->where('producto_id', $producto->id)
            ->first();

        if ($precioCliente) {
            $precioBase = (float) $precioCliente->precio;
            $fuente = 'cliente';
        }
        // 2. Precio por lista de precios comercial
        elseif ($cliente->lista_precio_id) {
            $precioLista = ListaPrecioProducto::where('lista_precio_id', $cliente->lista_precio_id)
                ->where('producto_id', $producto->id)
                ->first();

            if ($precioLista) {
                $precioBase = (float) $precioLista->precio;
                $fuente = 'lista';
            }
        }

        // Aplicar descuentos del cliente
        $descuento = 0;
        $precioFinal = $precioBase;

        if ($cliente->descuento_porcentaje > 0) {
            $descuento = round($precioBase * $cliente->descuento_porcentaje / 100, 2);
            $precioFinal = $precioBase - $descuento;
        }

        if ($cliente->descuento_fijo > 0) {
            $precioFinal = max(0, $precioFinal - (float) $cliente->descuento_fijo);
            $descuento += (float) $cliente->descuento_fijo;
        }

        return [
            'precio_base' => $precioBase,
            'precio_final' => round($precioFinal, 2),
            'descuento' => round($descuento, 2),
            'fuente' => $fuente,
        ];
    }

    /**
     * Resuelve precios para múltiples productos para un cliente.
     * Retorna un array indexado por producto_id.
     */
    public function resolverPrecios(array $productoIds, Cliente $cliente): array
    {
        // Pre-cargar precios específicos del cliente
        $preciosCliente = PrecioCliente::where('cliente_id', $cliente->id)
            ->whereIn('producto_id', $productoIds)
            ->pluck('precio', 'producto_id')
            ->toArray();

        // Pre-cargar precios de la lista si la tiene
        $preciosLista = [];
        if ($cliente->lista_precio_id) {
            $preciosLista = ListaPrecioProducto::where('lista_precio_id', $cliente->lista_precio_id)
                ->whereIn('producto_id', $productoIds)
                ->pluck('precio', 'producto_id')
                ->toArray();
        }

        $resultado = [];

        foreach ($productoIds as $productoId) {
            $fuente = 'general';

            if (isset($preciosCliente[$productoId])) {
                $precioBase = (float) $preciosCliente[$productoId];
                $fuente = 'cliente';
            } elseif (isset($preciosLista[$productoId])) {
                $precioBase = (float) $preciosLista[$productoId];
                $fuente = 'lista';
            } else {
                continue; // se resuelve con el precio del producto
            }

            $descuento = 0;
            $precioFinal = $precioBase;

            if ($cliente->descuento_porcentaje > 0) {
                $descuento = round($precioBase * $cliente->descuento_porcentaje / 100, 2);
                $precioFinal = $precioBase - $descuento;
            }

            if ($cliente->descuento_fijo > 0) {
                $precioFinal = max(0, $precioFinal - (float) $cliente->descuento_fijo);
                $descuento += (float) $cliente->descuento_fijo;
            }

            $resultado[$productoId] = [
                'precio_base' => $precioBase,
                'precio_final' => round($precioFinal, 2),
                'descuento' => round($descuento, 2),
                'fuente' => $fuente,
            ];
        }

        return $resultado;
    }
}
