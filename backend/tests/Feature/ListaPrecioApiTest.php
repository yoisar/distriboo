<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Distribuidor;
use App\Models\ListaPrecio;
use App\Models\ListaPrecioProducto;
use App\Models\Producto;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListaPrecioApiTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Distribuidor $distribuidor;
    private Provincia $provincia;

    protected function setUp(): void
    {
        parent::setUp();

        $this->provincia = Provincia::create(['nombre' => 'Buenos Aires']);
        $this->distribuidor = Distribuidor::create([
            'nombre_comercial' => 'Test Dist',
            'activo' => true,
        ]);
        $this->adminUser = User::factory()->create([
            'role' => 'distribuidor',
            'distribuidor_id' => $this->distribuidor->id,
        ]);
    }

    public function test_distribuidor_puede_crear_lista_precios(): void
    {
        $producto = Producto::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Helado 1L',
            'precio' => 1000,
            'stock' => 100,
            'activo' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/listas-precios', [
                'nombre' => 'Lista Mayorista',
                'descripcion' => 'Precios para mayoristas',
                'precios' => [
                    ['producto_id' => $producto->id, 'precio' => 800],
                ],
            ]);

        $response->assertStatus(201);
        $response->assertJsonFragment(['nombre' => 'Lista Mayorista']);
        $this->assertDatabaseHas('listas_precios', ['nombre' => 'Lista Mayorista']);
        $this->assertDatabaseHas('lista_precio_productos', [
            'producto_id' => $producto->id,
            'precio' => 800,
        ]);
    }

    public function test_distribuidor_puede_listar_sus_listas(): void
    {
        ListaPrecio::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Lista A',
            'activo' => true,
        ]);
        ListaPrecio::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Lista B',
            'activo' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/listas-precios');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_distribuidor_no_ve_listas_de_otro(): void
    {
        $otroDist = Distribuidor::create([
            'nombre_comercial' => 'Otro Dist',
            'activo' => true,
        ]);
        ListaPrecio::create([
            'distribuidor_id' => $otroDist->id,
            'nombre' => 'Lista Ajena',
            'activo' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/listas-precios');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_distribuidor_puede_actualizar_lista(): void
    {
        $lista = ListaPrecio::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Lista Original',
            'activo' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/listas-precios/{$lista->id}", [
                'nombre' => 'Lista Actualizada',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('listas_precios', ['nombre' => 'Lista Actualizada']);
    }

    public function test_distribuidor_puede_eliminar_lista(): void
    {
        $lista = ListaPrecio::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Lista a Borrar',
            'activo' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/listas-precios/{$lista->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('listas_precios', ['id' => $lista->id]);
    }

    public function test_no_autenticado_no_accede_listas(): void
    {
        $response = $this->getJson('/api/listas-precios');
        $response->assertStatus(401);
    }
}
