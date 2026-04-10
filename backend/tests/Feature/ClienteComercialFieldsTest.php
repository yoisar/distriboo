<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Distribuidor;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClienteComercialFieldsTest extends TestCase
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

    public function test_crear_cliente_con_campos_comerciales(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/clientes', [
                'razon_social' => 'Supermercado ABC',
                'email' => 'abc@test.com',
                'provincia_id' => $this->provincia->id,
                'segmento' => 'supermercado',
                'condicion_pago' => 'cuenta_corriente',
                'limite_credito' => 500000,
                'descuento_porcentaje' => 5,
                'descuento_fijo' => 0,
                'observaciones' => 'Cliente estratégico zona norte',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('clientes', [
            'razon_social' => 'Supermercado ABC',
            'segmento' => 'supermercado',
            'condicion_pago' => 'cuenta_corriente',
            'descuento_porcentaje' => 5,
        ]);
    }

    public function test_actualizar_segmento_y_descuentos(): void
    {
        $cliente = Cliente::create([
            'distribuidor_id' => $this->distribuidor->id,
            'razon_social' => 'Kiosco Juan',
            'email' => 'kiosco@test.com',
            'provincia_id' => $this->provincia->id,
            'activo' => true,
            'segmento' => 'minorista',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/clientes/{$cliente->id}", [
                'razon_social' => 'Kiosco Juan',
                'email' => 'kiosco@test.com',
                'provincia_id' => $this->provincia->id,
                'segmento' => 'estrategico',
                'descuento_porcentaje' => 15,
                'observaciones' => 'Ascendido a cliente estratégico',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('clientes', [
            'id' => $cliente->id,
            'segmento' => 'estrategico',
            'descuento_porcentaje' => 15,
        ]);
    }

    public function test_segmento_invalido_es_rechazado(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/clientes', [
                'razon_social' => 'Cliente X',
                'email' => 'x@test.com',
                'provincia_id' => $this->provincia->id,
                'segmento' => 'premium_gold',
            ]);

        $response->assertStatus(422);
    }
}
