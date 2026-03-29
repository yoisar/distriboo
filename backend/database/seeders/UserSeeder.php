<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Administrador',
            'email' => 'sioy23@gmail.com',
            'password' => 'distriboo2026',
            'role' => 'admin',
        ]);

        // Clientes demo
        $bsAs = Provincia::where('nombre', 'Buenos Aires')->first();
        $misiones = Provincia::where('nombre', 'Misiones')->first();
        $tierraDelFuego = Provincia::where('nombre', 'Tierra del Fuego')->first();

        if ($bsAs) {
            $cliente1 = Cliente::create([
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
                'cliente_id' => $cliente1->id,
            ]);
        }

        if ($misiones) {
            $cliente2 = Cliente::create([
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
                'cliente_id' => $cliente2->id,
            ]);
        }

        if ($tierraDelFuego) {
            $cliente3 = Cliente::create([
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
                'cliente_id' => $cliente3->id,
            ]);
        }
    }
}
