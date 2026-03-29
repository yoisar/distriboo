<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Distribuidor;
use App\Models\Producto;
use App\Models\Provincia;
use App\Models\User;
use App\Models\ZonaLogistica;
use Illuminate\Database\Seeder;

class DistribuidorSeeder extends Seeder
{
    public function run(): void
    {
        // ── Super Admin ──
        User::create([
            'name' => 'Yassel Omar Izquierdo Souchay',
            'email' => 'sioy23@gmail.com',
            'password' => '12345678',
            'role' => 'super_admin',
            'distribuidor_id' => null,
            'cliente_id' => null,
        ]);

        // ── Distribuidor 1: Helados del Sur ──
        $dist1 = Distribuidor::create([
            'nombre_comercial' => 'Helados del Sur',
            'razon_social' => 'Helados del Sur SRL',
            'email_contacto' => 'admin@heladosdelsur.com',
            'telefono' => '11-5555-0100',
            'direccion' => 'Av. Rivadavia 5000, CABA',
            'activo' => true,
        ]);

        // Usuario distribuidor
        User::create([
            'name' => 'Admin Helados del Sur',
            'email' => 'admin@heladosdelsur.com',
            'password' => 'distriboo2026',
            'role' => 'distribuidor',
            'distribuidor_id' => $dist1->id,
        ]);

        // Productos del distribuidor 1
        $productos1 = [
            ['nombre' => 'Paleta Frutal', 'descripcion' => 'Paleta helada sabor frutal', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 24', 'precio' => 12000, 'stock' => 200],
            ['nombre' => 'Bombón Helado Chocolate', 'descripcion' => 'Bombón helado bañado en chocolate', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 18', 'precio' => 18000, 'stock' => 150],
            ['nombre' => 'Helado Crema 1L', 'descripcion' => 'Pote de helado de crema 1 litro', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 6', 'precio' => 24000, 'stock' => 100],
            ['nombre' => 'Paleta Agua Limón', 'descripcion' => 'Paleta de agua sabor limón', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 30', 'precio' => 9000, 'stock' => 300],
            ['nombre' => 'Helado Crema 2.5L', 'descripcion' => 'Balde de helado 2.5 litros', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 4', 'precio' => 36000, 'stock' => 80],
            ['nombre' => 'Vasito Dulce de Leche', 'descripcion' => 'Vasito individual dulce de leche', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 36', 'precio' => 15000, 'stock' => 250],
            ['nombre' => 'Sándwich Helado', 'descripcion' => 'Sándwich de helado vainilla y chocolate', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 20', 'precio' => 16000, 'stock' => 180],
            ['nombre' => 'Cono Triple', 'descripcion' => 'Cono helado triple sabor', 'marca' => 'Helados del Sur', 'formato' => 'Caja x 12', 'precio' => 22000, 'stock' => 120],
        ];

        foreach ($productos1 as $p) {
            Producto::create(array_merge($p, ['distribuidor_id' => $dist1->id, 'activo' => true]));
        }

        // Zonas logísticas del distribuidor 1 (usamos las provincias ya creadas)
        $zonasData = [
            'Buenos Aires' => ['costo_base' => 5000, 'costo_por_bulto' => 500, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 2],
            'CABA' => ['costo_base' => 3000, 'costo_por_bulto' => 300, 'pedido_minimo' => 30000, 'tiempo_entrega_dias' => 1],
            'Córdoba' => ['costo_base' => 8000, 'costo_por_bulto' => 700, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 3],
            'Santa Fe' => ['costo_base' => 8000, 'costo_por_bulto' => 700, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 3],
            'Mendoza' => ['costo_base' => 12000, 'costo_por_bulto' => 1000, 'pedido_minimo' => 70000, 'tiempo_entrega_dias' => 4],
            'Misiones' => ['costo_base' => 22000, 'costo_por_bulto' => 1800, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            'Tierra del Fuego' => ['costo_base' => 35000, 'costo_por_bulto' => 3000, 'pedido_minimo' => 200000, 'tiempo_entrega_dias' => 10],
        ];

        foreach ($zonasData as $nombreProv => $zona) {
            $prov = Provincia::where('nombre', $nombreProv)->first();
            if ($prov) {
                ZonaLogistica::create(array_merge($zona, [
                    'distribuidor_id' => $dist1->id,
                    'provincia_id' => $prov->id,
                    'activo' => true,
                ]));
            }
        }

        // Clientes del distribuidor 1
        $bsAs = Provincia::where('nombre', 'Buenos Aires')->first();
        $misiones = Provincia::where('nombre', 'Misiones')->first();
        $tierraDelFuego = Provincia::where('nombre', 'Tierra del Fuego')->first();

        if ($bsAs) {
            $c1 = Cliente::create([
                'distribuidor_id' => $dist1->id,
                'razon_social' => 'Distribuidora Norte SRL',
                'email' => 'norte@demo.com',
                'telefono' => '11-5555-0001',
                'provincia_id' => $bsAs->id,
                'direccion' => 'Av. Corrientes 1234, CABA',
                'activo' => true,
            ]);
            User::create([
                'name' => 'Distribuidora Norte',
                'email' => 'norte@demo.com',
                'password' => 'cliente2026',
                'role' => 'cliente',
                'distribuidor_id' => $dist1->id,
                'cliente_id' => $c1->id,
            ]);
        }

        if ($misiones) {
            $c2 = Cliente::create([
                'distribuidor_id' => $dist1->id,
                'razon_social' => 'Helados del Litoral SA',
                'email' => 'litoral@demo.com',
                'telefono' => '376-444-0002',
                'provincia_id' => $misiones->id,
                'direccion' => 'Ruta 12 km 5, Posadas',
                'activo' => true,
            ]);
            User::create([
                'name' => 'Helados del Litoral',
                'email' => 'litoral@demo.com',
                'password' => 'cliente2026',
                'role' => 'cliente',
                'distribuidor_id' => $dist1->id,
                'cliente_id' => $c2->id,
            ]);
        }

        if ($tierraDelFuego) {
            $c3 = Cliente::create([
                'distribuidor_id' => $dist1->id,
                'razon_social' => 'Patagonia Fría SRL',
                'email' => 'patagonia@demo.com',
                'telefono' => '2901-555-0003',
                'provincia_id' => $tierraDelFuego->id,
                'direccion' => 'San Martín 567, Ushuaia',
                'activo' => true,
            ]);
            User::create([
                'name' => 'Patagonia Fría',
                'email' => 'patagonia@demo.com',
                'password' => 'cliente2026',
                'role' => 'cliente',
                'distribuidor_id' => $dist1->id,
                'cliente_id' => $c3->id,
            ]);
        }

        // ── Distribuidor 2: Congelados Express ──
        $dist2 = Distribuidor::create([
            'nombre_comercial' => 'Congelados Express',
            'razon_social' => 'Congelados Express SA',
            'email_contacto' => 'admin@congeladosexpress.com',
            'telefono' => '351-555-0200',
            'direccion' => 'Bv. San Juan 1200, Córdoba',
            'activo' => true,
        ]);

        User::create([
            'name' => 'Admin Congelados Express',
            'email' => 'admin@congeladosexpress.com',
            'password' => 'distriboo2026',
            'role' => 'distribuidor',
            'distribuidor_id' => $dist2->id,
        ]);

        // Productos del distribuidor 2
        $productos2 = [
            ['nombre' => 'Milanesa de Pollo', 'descripcion' => 'Milanesas de pollo congeladas', 'marca' => 'Congelados Express', 'formato' => 'Bolsa x 12', 'precio' => 8500, 'stock' => 400],
            ['nombre' => 'Empanadas Carne', 'descripcion' => 'Empanadas de carne congeladas', 'marca' => 'Congelados Express', 'formato' => 'Docena', 'precio' => 6000, 'stock' => 500],
            ['nombre' => 'Pizza Muzzarella', 'descripcion' => 'Pizza congelada de muzzarella', 'marca' => 'Congelados Express', 'formato' => 'Unidad', 'precio' => 4500, 'stock' => 350],
            ['nombre' => 'Nuggets de Pollo', 'descripcion' => 'Nuggets de pollo congelados', 'marca' => 'Congelados Express', 'formato' => 'Bolsa x 20', 'precio' => 7000, 'stock' => 280],
        ];

        foreach ($productos2 as $p) {
            Producto::create(array_merge($p, ['distribuidor_id' => $dist2->id, 'activo' => true]));
        }

        // Zona logística del distribuidor 2
        $cordoba = Provincia::where('nombre', 'Córdoba')->first();
        if ($cordoba) {
            ZonaLogistica::create([
                'distribuidor_id' => $dist2->id,
                'provincia_id' => $cordoba->id,
                'costo_base' => 4000,
                'costo_por_bulto' => 400,
                'pedido_minimo' => 30000,
                'tiempo_entrega_dias' => 1,
                'activo' => true,
            ]);
        }

        // Cliente del distribuidor 2
        if ($cordoba) {
            $c4 = Cliente::create([
                'distribuidor_id' => $dist2->id,
                'razon_social' => 'Kiosco El Centro',
                'email' => 'kiosco@demo.com',
                'telefono' => '351-555-0010',
                'provincia_id' => $cordoba->id,
                'direccion' => 'Av. Colón 456, Córdoba',
                'activo' => true,
            ]);
            User::create([
                'name' => 'Kiosco El Centro',
                'email' => 'kiosco@demo.com',
                'password' => 'cliente2026',
                'role' => 'cliente',
                'distribuidor_id' => $dist2->id,
                'cliente_id' => $c4->id,
            ]);
        }
    }
}
