<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Distribuidor;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\Provincia;
use App\Models\User;
use App\Models\ZonaLogistica;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    /**
     * Carga datos de prueba completos para el entorno de testing.
     * Incluye distribuidores, productos, clientes, zonas y pedidos de ejemplo.
     *
     * Uso: php artisan db:seed --class=TestDataSeeder
     */
    public function run(): void
    {
        echo "=== CARGANDO DATOS DE PRUEBA ===\n";

        // Limpiar datos existentes (excepto Super Admin y provincias)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        PedidoDetalle::truncate();
        Pedido::truncate();
        Producto::truncate();
        Cliente::truncate();
        ZonaLogistica::truncate();
        Distribuidor::truncate();
        User::where('email', '!=', 'sioy23@gmail.com')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Asegurar Super Admin
        $superAdmin = User::where('email', 'sioy23@gmail.com')->first();
        if (!$superAdmin) {
            User::create([
                'name' => 'Yassel Omar Izquierdo Souchay',
                'email' => 'sioy23@gmail.com',
                'password' => '12345678',
                'role' => 'super_admin',
            ]);
            echo "  → Super Admin creado\n";
        }

        // Asegurar provincias
        if (Provincia::count() === 0) {
            $this->call(ProvinciaSeeder::class);
        }

        // ── Distribuidor 1: Helados del Sur ──
        $dist1 = Distribuidor::create([
            'nombre_comercial' => 'Helados del Sur',
            'razon_social' => 'Helados del Sur SRL',
            'email_contacto' => 'admin@heladosdelsur.com',
            'telefono' => '11-5555-0100',
            'direccion' => 'Av. Rivadavia 5000, CABA',
            'activo' => true,
        ]);

        User::create([
            'name' => 'Admin Helados del Sur',
            'email' => 'admin@heladosdelsur.com',
            'password' => 'distriboo2026',
            'role' => 'distribuidor',
            'distribuidor_id' => $dist1->id,
        ]);
        echo "  → Distribuidor: Helados del Sur\n";

        // Productos distribuidor 1
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

        $productoModels1 = [];
        foreach ($productos1 as $p) {
            $productoModels1[] = Producto::create(array_merge($p, [
                'distribuidor_id' => $dist1->id,
                'activo' => true,
            ]));
        }

        // Zonas logísticas distribuidor 1
        $zonasData1 = [
            'Buenos Aires' => ['costo_base' => 5000, 'costo_por_bulto' => 500, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 2],
            'CABA' => ['costo_base' => 3000, 'costo_por_bulto' => 300, 'pedido_minimo' => 30000, 'tiempo_entrega_dias' => 1],
            'Córdoba' => ['costo_base' => 8000, 'costo_por_bulto' => 700, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 3],
            'Santa Fe' => ['costo_base' => 8000, 'costo_por_bulto' => 700, 'pedido_minimo' => 50000, 'tiempo_entrega_dias' => 3],
            'Mendoza' => ['costo_base' => 12000, 'costo_por_bulto' => 1000, 'pedido_minimo' => 70000, 'tiempo_entrega_dias' => 4],
            'Misiones' => ['costo_base' => 22000, 'costo_por_bulto' => 1800, 'pedido_minimo' => 100000, 'tiempo_entrega_dias' => 6],
            'Tierra del Fuego' => ['costo_base' => 35000, 'costo_por_bulto' => 3000, 'pedido_minimo' => 200000, 'tiempo_entrega_dias' => 10],
        ];

        foreach ($zonasData1 as $nombreProv => $zona) {
            $prov = Provincia::where('nombre', $nombreProv)->first();
            if ($prov) {
                ZonaLogistica::create(array_merge($zona, [
                    'distribuidor_id' => $dist1->id,
                    'provincia_id' => $prov->id,
                    'activo' => true,
                ]));
            }
        }

        // Clientes distribuidor 1
        $bsAs = Provincia::where('nombre', 'Buenos Aires')->first();
        $misiones = Provincia::where('nombre', 'Misiones')->first();
        $tierraDelFuego = Provincia::where('nombre', 'Tierra del Fuego')->first();

        $clientes1 = [];

        if ($bsAs) {
            $c = Cliente::create([
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
                'cliente_id' => $c->id,
            ]);
            $clientes1[] = $c;
        }

        if ($misiones) {
            $c = Cliente::create([
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
                'cliente_id' => $c->id,
            ]);
            $clientes1[] = $c;
        }

        if ($tierraDelFuego) {
            $c = Cliente::create([
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
                'cliente_id' => $c->id,
            ]);
            $clientes1[] = $c;
        }

        echo "  → 3 clientes + zonas logísticas\n";

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
        echo "  → Distribuidor: Congelados Express\n";

        // Productos distribuidor 2
        $productos2 = [
            ['nombre' => 'Milanesa de Pollo', 'descripcion' => 'Milanesas de pollo congeladas', 'marca' => 'Congelados Express', 'formato' => 'Bolsa x 12', 'precio' => 8500, 'stock' => 400],
            ['nombre' => 'Empanadas Carne', 'descripcion' => 'Empanadas de carne congeladas', 'marca' => 'Congelados Express', 'formato' => 'Docena', 'precio' => 6000, 'stock' => 500],
            ['nombre' => 'Pizza Muzzarella', 'descripcion' => 'Pizza congelada de muzzarella', 'marca' => 'Congelados Express', 'formato' => 'Unidad', 'precio' => 4500, 'stock' => 350],
            ['nombre' => 'Nuggets de Pollo', 'descripcion' => 'Nuggets de pollo congelados', 'marca' => 'Congelados Express', 'formato' => 'Bolsa x 20', 'precio' => 7000, 'stock' => 280],
        ];

        $productoModels2 = [];
        foreach ($productos2 as $p) {
            $productoModels2[] = Producto::create(array_merge($p, [
                'distribuidor_id' => $dist2->id,
                'activo' => true,
            ]));
        }

        // Zona logística distribuidor 2
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

        // Cliente distribuidor 2
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

        // ── Pedidos de ejemplo ──
        echo "  → Creando pedidos de ejemplo...\n";

        if (count($clientes1) >= 1 && count($productoModels1) >= 3) {
            // Pedido 1: Distribuidora Norte → Helados del Sur
            $p1 = $productoModels1[0]; // Paleta Frutal
            $p2 = $productoModels1[1]; // Bombón Helado
            $subtotal = ($p1->precio * 5) + ($p2->precio * 3);
            $costoLog = 5000 + (8 * 500); // Buenos Aires: base + 8 bultos
            $pedido1 = Pedido::create([
                'cliente_id' => $clientes1[0]->id,
                'distribuidor_id' => $dist1->id,
                'subtotal' => $subtotal,
                'costo_logistico' => $costoLog,
                'total' => $subtotal + $costoLog,
                'estado' => 'confirmado',
                'fecha_estimada_entrega' => now()->addDays(2),
            ]);
            PedidoDetalle::create(['pedido_id' => $pedido1->id, 'producto_id' => $p1->id, 'cantidad' => 5, 'precio_unitario' => $p1->precio, 'subtotal' => $p1->precio * 5]);
            PedidoDetalle::create(['pedido_id' => $pedido1->id, 'producto_id' => $p2->id, 'cantidad' => 3, 'precio_unitario' => $p2->precio, 'subtotal' => $p2->precio * 3]);

            // Pedido 2: mismo cliente, enviado
            $p3 = $productoModels1[2]; // Helado Crema 1L
            $subtotal2 = $p3->precio * 10;
            $costoLog2 = 5000 + (10 * 500);
            $pedido2 = Pedido::create([
                'cliente_id' => $clientes1[0]->id,
                'distribuidor_id' => $dist1->id,
                'subtotal' => $subtotal2,
                'costo_logistico' => $costoLog2,
                'total' => $subtotal2 + $costoLog2,
                'estado' => 'enviado',
                'fecha_estimada_entrega' => now()->addDays(1),
            ]);
            PedidoDetalle::create(['pedido_id' => $pedido2->id, 'producto_id' => $p3->id, 'cantidad' => 10, 'precio_unitario' => $p3->precio, 'subtotal' => $p3->precio * 10]);
        }

        if (count($clientes1) >= 2) {
            // Pedido 3: Helados del Litoral → pendiente
            $p4 = $productoModels1[3]; // Paleta Agua Limón
            $subtotal3 = $p4->precio * 20;
            $costoLog3 = 22000 + (20 * 1800); // Misiones
            $pedido3 = Pedido::create([
                'cliente_id' => $clientes1[1]->id,
                'distribuidor_id' => $dist1->id,
                'subtotal' => $subtotal3,
                'costo_logistico' => $costoLog3,
                'total' => $subtotal3 + $costoLog3,
                'estado' => 'pendiente',
                'fecha_estimada_entrega' => now()->addDays(6),
            ]);
            PedidoDetalle::create(['pedido_id' => $pedido3->id, 'producto_id' => $p4->id, 'cantidad' => 20, 'precio_unitario' => $p4->precio, 'subtotal' => $p4->precio * 20]);
        }

        echo "\n✅ Datos de prueba cargados exitosamente!\n";
        echo "\n=== CREDENCIALES DE PRUEBA ===\n";
        echo "Super Admin:    sioy23@gmail.com / 12345678\n";
        echo "Distribuidor 1: admin@heladosdelsur.com / distriboo2026\n";
        echo "Distribuidor 2: admin@congeladosexpress.com / distriboo2026\n";
        echo "Cliente 1:      norte@demo.com / cliente2026\n";
        echo "Cliente 2:      litoral@demo.com / cliente2026\n";
        echo "Cliente 3:      patagonia@demo.com / cliente2026\n";
        echo "Cliente 4:      kiosco@demo.com / cliente2026\n";
    }
}
