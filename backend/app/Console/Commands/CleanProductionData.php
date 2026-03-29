<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CleanProductionData extends Command
{
    protected $signature = 'data:clean-production';
    protected $description = 'Elimina todos los datos de producción excepto Super Admin y provincias';

    public function handle(): int
    {
        if (!$this->confirm('⚠️  Esto ELIMINARÁ TODOS LOS DATOS excepto Super Admin y provincias. ¿Continuar?')) {
            $this->info('Operación cancelada.');
            return 0;
        }

        $this->info('=== LIMPIEZA DE DATOS DE PRODUCCIÓN ===');

        try {
            DB::beginTransaction();

            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $this->info('Eliminando pedido_detalles...');
            DB::table('pedido_detalles')->truncate();

            $this->info('Eliminando pedidos...');
            DB::table('pedidos')->truncate();

            $this->info('Eliminando productos...');
            DB::table('productos')->truncate();

            $this->info('Eliminando clientes...');
            DB::table('clientes')->truncate();

            $this->info('Eliminando zonas_logisticas...');
            DB::table('zonas_logisticas')->truncate();

            $this->info('Eliminando distribuidores...');
            DB::table('distribuidores')->truncate();

            $this->info('Eliminando usuarios (excepto Super Admin)...');
            DB::table('users')
                ->where('email', '!=', 'sioy23@gmail.com')
                ->delete();

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            // Verificar que Super Admin existe
            $superAdmin = DB::table('users')
                ->where('email', 'sioy23@gmail.com')
                ->first();

            if (!$superAdmin) {
                $this->info('Creando Super Admin...');
                DB::table('users')->insert([
                    'name' => 'Yassel Omar Izquierdo Souchay',
                    'email' => 'sioy23@gmail.com',
                    'password' => Hash::make('12345678'),
                    'role' => 'super_admin',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            $this->info('✅ Limpieza completada exitosamente!');
            $this->info('✅ Solo queda el Super Admin: sioy23@gmail.com');

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            $this->error('❌ Error durante la limpieza: ' . $e->getMessage());
            return 1;
        }
    }
}
