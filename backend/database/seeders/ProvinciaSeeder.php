<?php

namespace Database\Seeders;

use App\Models\Provincia;
use App\Models\ZonaLogistica;
use Illuminate\Database\Seeder;

class ProvinciaSeeder extends Seeder
{
    public function run(): void
    {
        $provincias = [
            ['nombre' => 'Buenos Aires', 'costo_base' => 5000, 'costo_por_bulto' => 500, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 2],
            ['nombre' => 'CABA', 'costo_base' => 3000, 'costo_por_bulto' => 300, 'pedido_minimo' => 30000, 'tiempo_entrega_dias' => 1],
            ['nombre' => 'Catamarca', 'costo_base' => 15000, 'costo_por_bulto' => 1200, 'pedido_minimo' => 80000, 'tiempo_entrega_dias' => 5],
            ['nombre' => 'Chaco', 'costo_base' => 18000, 'costo_por_bulto' => 1500, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 5],
            ['nombre' => 'Chubut', 'costo_base' => 25000, 'costo_por_bulto' => 2000, 'pedido_minimo' => 120000, 'tiempo_entrega_dias' => 7],
            ['nombre' => 'Córdoba', 'costo_base' => 8000, 'costo_por_bulto' => 700, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 3],
            ['nombre' => 'Corrientes', 'costo_base' => 18000, 'costo_por_bulto' => 1500, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 5],
            ['nombre' => 'Entre Ríos', 'costo_base' => 10000, 'costo_por_bulto' => 900, 'pedido_minimo' => 60000, 'tiempo_entrega_dias' => 3],
            ['nombre' => 'Formosa', 'costo_base' => 20000, 'costo_por_bulto' => 1600, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            ['nombre' => 'Jujuy', 'costo_base' => 20000, 'costo_por_bulto' => 1600, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            ['nombre' => 'La Pampa', 'costo_base' => 12000, 'costo_por_bulto' => 1000, 'pedido_minimo' => 70000, 'tiempo_entrega_dias' => 4],
            ['nombre' => 'La Rioja', 'costo_base' => 15000, 'costo_por_bulto' => 1200, 'pedido_minimo' => 80000, 'tiempo_entrega_dias' => 5],
            ['nombre' => 'Mendoza', 'costo_base' => 12000, 'costo_por_bulto' => 1000, 'pedido_minimo' => 70000, 'tiempo_entrega_dias' => 4],
            ['nombre' => 'Misiones', 'costo_base' => 22000, 'costo_por_bulto' => 1800, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            ['nombre' => 'Neuquén', 'costo_base' => 20000, 'costo_por_bulto' => 1600, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            ['nombre' => 'Río Negro', 'costo_base' => 20000, 'costo_por_bulto' => 1600, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            ['nombre' => 'Salta', 'costo_base' => 20000, 'costo_por_bulto' => 1600, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            ['nombre' => 'San Juan', 'costo_base' => 15000, 'costo_por_bulto' => 1200, 'pedido_minimo' => 80000, 'tiempo_entrega_dias' => 5],
            ['nombre' => 'San Luis', 'costo_base' => 12000, 'costo_por_bulto' => 1000, 'pedido_minimo' => 70000, 'tiempo_entrega_dias' => 4],
            ['nombre' => 'Santa Cruz', 'costo_base' => 30000, 'costo_por_bulto' => 2500, 'pedido_minimo' => 150000, 'tiempo_entrega_dias' => 8],
            ['nombre' => 'Santa Fe', 'costo_base' => 8000, 'costo_por_bulto' => 700, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 3],
            ['nombre' => 'Santiago del Estero', 'costo_base' => 15000, 'costo_por_bulto' => 1200, 'pedido_minimo' => 80000, 'tiempo_entrega_dias' => 5],
            ['nombre' => 'Tierra del Fuego', 'costo_base' => 35000, 'costo_por_bulto' => 3000, 'pedido_minimo' => 200000, 'tiempo_entrega_dias' => 10],
            ['nombre' => 'Tucumán', 'costo_base' => 18000, 'costo_por_bulto' => 1500, 'pedido_minimo' => 90000, 'tiempo_entrega_dias' => 5],
        ];

        foreach ($provincias as $data) {
            $provincia = Provincia::create([
                'nombre' => $data['nombre'],
                'activo' => true,
            ]);

            ZonaLogistica::create([
                'provincia_id' => $provincia->id,
                'costo_base' => $data['costo_base'],
                'costo_por_bulto' => $data['costo_por_bulto'],
                'pedido_minimo' => $data['pedido_minimo'],
                'tiempo_entrega_dias' => $data['tiempo_entrega_dias'],
                'activo' => true,
            ]);
        }
    }
}
