<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Distribuidor;
use App\Models\PrecioCliente;
use App\Models\Producto;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrecioClienteApiTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Distribuidor $distribuidor;
    private Cliente $cliente;
    private Producto $producto;

    protected function setUp(): void
    {
        parent::setUp();

        $provincia = Provincia::create(['nombre' => 'Buenos Aires']);
        $this->distribuidor = Distribuidor::create([
            'nombre_comercial' => 'Test Dist',
            'activo' => true,
        ]);
        $this->adminUser = User::factory()->create([
            'role' => 'distribuidor',
            'distribuidor_id' => $this->distribuidor->id,
        ]);
        $this->cliente = Cliente::create([
            'distribuidor_id' => $this->distribuidor->id,
            'razon_social' => 'Cliente Test',
            'email' => 'cli@test.com',
            'provincia_id' => $provincia->id,
            'activo' => true,
            'segmento' => 'mayorista',
        ]);
        $this->producto = Producto::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Helado 1L',
            'precio' => 1000,
            'stock' => 100,
            'activo' => true,
        ]);
    }

    public function test_puede_obtener_precios_por_cliente(): void
    {
        PrecioCliente::create([
            'cliente_id' => $this->cliente->id,
            'producto_id' => $this->producto->id,
            'precio' => 750,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/clientes/{$this->cliente->id}/precios");

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['precio' => '750.00']);
    }

    public function test_puede_actualizar_precios_por_cliente(): void
    {
        $producto2 = Producto::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Helado 2L',
            'precio' => 2000,
            'stock' => 50,
            'activo' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/clientes/{$this->cliente->id}/precios", [
                'precios' => [
                    ['producto_id' => $this->producto->id, 'precio' => 800],
                    ['producto_id' => $producto2->id, 'precio' => 1600],
                ],
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('precios_clientes', [
            'cliente_id' => $this->cliente->id,
            'producto_id' => $this->producto->id,
            'precio' => 800,
        ]);
        $this->assertDatabaseHas('precios_clientes', [
            'cliente_id' => $this->cliente->id,
            'producto_id' => $producto2->id,
            'precio' => 1600,
        ]);
    }

    public function test_distribuidor_no_accede_precios_de_otro_distribuidor(): void
    {
        $otroDist = Distribuidor::create([
            'nombre_comercial' => 'Otro',
            'activo' => true,
        ]);
        $provincia = Provincia::first();
        $otroCliente = Cliente::create([
            'distribuidor_id' => $otroDist->id,
            'razon_social' => 'Otro Cliente',
            'email' => 'otro@test.com',
            'provincia_id' => $provincia->id,
            'activo' => true,
            'segmento' => 'mayorista',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/clientes/{$otroCliente->id}/precios");

        $response->assertStatus(403);
    }
}
