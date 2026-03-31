<?php

namespace Database\Seeders;

use App\Models\ConfiguracionComision;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            [
                'nombre' => 'BASIC',
                'slug' => 'basic',
                'precio_mensual' => 60000,
                'setup_inicial' => 60000,
                'max_productos' => 50,
                'max_clientes' => 30,
                'multi_vendedor' => false,
                'integraciones' => false,
                'reportes' => false,
                'orden' => 1,
                'caracteristicas' => [
                    'Hasta 50 productos',
                    'Hasta 30 clientes',
                    'Pedidos online',
                    'Panel básico',
                ],
            ],
            [
                'nombre' => 'PRO',
                'slug' => 'pro',
                'precio_mensual' => 90000,
                'setup_inicial' => 90000,
                'max_productos' => 200,
                'max_clientes' => 100,
                'multi_vendedor' => false,
                'integraciones' => false,
                'reportes' => true,
                'orden' => 2,
                'caracteristicas' => [
                    'Hasta 200 productos',
                    'Hasta 100 clientes',
                    'Zonas/provincias',
                    'Reportes',
                ],
            ],
            [
                'nombre' => 'FULL',
                'slug' => 'full',
                'precio_mensual' => 120000,
                'setup_inicial' => 120000,
                'max_productos' => null,
                'max_clientes' => null,
                'multi_vendedor' => true,
                'integraciones' => true,
                'reportes' => true,
                'orden' => 3,
                'caracteristicas' => [
                    'Productos ilimitados',
                    'Clientes ilimitados',
                    'Multi vendedor',
                    'Integraciones/exportaciones',
                ],
            ],
        ];

        foreach ($planes as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }

        // Configuración de comisiones
        $configs = [
            ['clave' => 'porcentaje_base', 'valor' => '20', 'descripcion' => 'Porcentaje base de comisión para revendedores'],
            ['clave' => 'bonus_nivel_1_porcentaje', 'valor' => '25', 'descripcion' => 'Porcentaje bonus nivel 1'],
            ['clave' => 'bonus_nivel_1_min_clientes', 'valor' => '3', 'descripcion' => 'Mínimo de clientes activos para bonus nivel 1'],
            ['clave' => 'bonus_nivel_2_porcentaje', 'valor' => '30', 'descripcion' => 'Porcentaje bonus nivel 2'],
            ['clave' => 'bonus_nivel_2_min_clientes', 'valor' => '5', 'descripcion' => 'Mínimo de clientes activos para bonus nivel 2'],
            ['clave' => 'descuento_3_meses', 'valor' => '10', 'descripcion' => 'Descuento por contrato de 3 meses (%)'],
            ['clave' => 'descuento_6_meses', 'valor' => '20', 'descripcion' => 'Descuento por contrato de 6 meses (%)'],
            ['clave' => 'descuento_12_meses', 'valor' => '30', 'descripcion' => 'Descuento por contrato de 12 meses (%)'],
        ];

        foreach ($configs as $config) {
            ConfiguracionComision::updateOrCreate(['clave' => $config['clave']], $config);
        }
    }
}
