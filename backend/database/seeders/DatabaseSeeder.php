<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $env = app()->environment();

        // Provincias siempre se cargan
        $this->call(ProvinciaSeeder::class);

        if ($env === 'production') {
            // En producción solo provincias y estructura base
            echo "🏭 Entorno de producción: solo datos base.\n";
        } else {
            // En testing/local cargamos datos de prueba completos
            echo "🧪 Entorno {$env}: cargando datos de prueba...\n";
            $this->call(TestDataSeeder::class);
        }
    }
}
