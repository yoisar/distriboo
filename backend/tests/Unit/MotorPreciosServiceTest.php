<?php

namespace Tests\Unit;

use App\Models\Cliente;
use App\Models\Distribuidor;
use App\Models\ListaPrecio;
use App\Models\ListaPrecioProducto;
use App\Models\PrecioCliente;
use App\Models\Producto;
use App\Models\Provincia;
use App\Services\MotorPreciosService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MotorPreciosServiceTest extends TestCase
{
    use RefreshDatabase;

    private MotorPreciosService $service;
    private Distribuidor $distribuidor;
    private Provincia $provincia;
    private Producto $producto;
    private Cliente $cliente;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new MotorPreciosService();

        $this->provincia = Provincia::create(['nombre' => 'Buenos Aires']);
        $this->distribuidor = Distribuidor::create([
            'nombre_comercial' => 'Test Dist',
            'activo' => true,
        ]);
        $this->producto = Producto::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Helado 1L',
            'precio' => 1000,
            'stock' => 100,
            'activo' => true,
        ]);
        $this->cliente = Cliente::create([
            'distribuidor_id' => $this->distribuidor->id,
            'razon_social' => 'Cliente Test',
            'email' => 'test@test.com',
            'provincia_id' => $this->provincia->id,
            'activo' => true,
            'segmento' => 'mayorista',
            'descuento_porcentaje' => 0,
            'descuento_fijo' => 0,
        ]);
    }

    public function test_precio_general_cuando_no_hay_override(): void
    {
        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente);

        $this->assertEquals(1000, $resultado['precio_base']);
        $this->assertEquals(1000, $resultado['precio_final']);
        $this->assertEquals(0, $resultado['descuento']);
        $this->assertEquals('general', $resultado['fuente']);
    }

    public function test_precio_especifico_por_cliente_tiene_maxima_prioridad(): void
    {
        // Crear lista de precios con precio diferente
        $lista = ListaPrecio::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Lista Mayorista',
            'activo' => true,
        ]);
        ListaPrecioProducto::create([
            'lista_precio_id' => $lista->id,
            'producto_id' => $this->producto->id,
            'precio' => 800,
        ]);
        $this->cliente->update(['lista_precio_id' => $lista->id]);

        // Crear precio específico por cliente (mayor prioridad)
        PrecioCliente::create([
            'cliente_id' => $this->cliente->id,
            'producto_id' => $this->producto->id,
            'precio' => 700,
        ]);

        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente->fresh());

        $this->assertEquals(700, $resultado['precio_base']);
        $this->assertEquals('cliente', $resultado['fuente']);
    }

    public function test_precio_por_lista_cuando_no_hay_precio_cliente(): void
    {
        $lista = ListaPrecio::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Lista Mayorista',
            'activo' => true,
        ]);
        ListaPrecioProducto::create([
            'lista_precio_id' => $lista->id,
            'producto_id' => $this->producto->id,
            'precio' => 800,
        ]);
        $this->cliente->update(['lista_precio_id' => $lista->id]);

        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente->fresh());

        $this->assertEquals(800, $resultado['precio_base']);
        $this->assertEquals('lista', $resultado['fuente']);
    }

    public function test_descuento_porcentual_se_aplica(): void
    {
        $this->cliente->update(['descuento_porcentaje' => 10]);

        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente->fresh());

        $this->assertEquals(1000, $resultado['precio_base']);
        $this->assertEquals(900, $resultado['precio_final']);
        $this->assertEquals(100, $resultado['descuento']);
    }

    public function test_descuento_fijo_se_aplica(): void
    {
        $this->cliente->update(['descuento_fijo' => 150]);

        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente->fresh());

        $this->assertEquals(1000, $resultado['precio_base']);
        $this->assertEquals(850, $resultado['precio_final']);
        $this->assertEquals(150, $resultado['descuento']);
    }

    public function test_descuento_porcentual_y_fijo_combinados(): void
    {
        $this->cliente->update([
            'descuento_porcentaje' => 10,
            'descuento_fijo' => 50,
        ]);

        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente->fresh());

        // 1000 - 10% = 900, luego - 50 = 850
        $this->assertEquals(1000, $resultado['precio_base']);
        $this->assertEquals(850, $resultado['precio_final']);
        $this->assertEquals(150, $resultado['descuento']);
    }

    public function test_precio_final_no_puede_ser_negativo(): void
    {
        $this->cliente->update(['descuento_fijo' => 2000]);

        $resultado = $this->service->resolverPrecio($this->producto, $this->cliente->fresh());

        $this->assertEquals(0, $resultado['precio_final']);
    }

    public function test_resolver_precios_multiples(): void
    {
        $producto2 = Producto::create([
            'distribuidor_id' => $this->distribuidor->id,
            'nombre' => 'Helado 2L',
            'precio' => 2000,
            'stock' => 50,
            'activo' => true,
        ]);

        PrecioCliente::create([
            'cliente_id' => $this->cliente->id,
            'producto_id' => $this->producto->id,
            'precio' => 700,
        ]);

        $resultado = $this->service->resolverPrecios(
            [$this->producto->id, $producto2->id],
            $this->cliente
        );

        // producto1 tiene precio cliente
        $this->assertArrayHasKey($this->producto->id, $resultado);
        $this->assertEquals(700, $resultado[$this->producto->id]['precio_base']);
        $this->assertEquals('cliente', $resultado[$this->producto->id]['fuente']);

        // producto2 no tiene override, se omite (se resuelve con precio del producto)
        $this->assertArrayNotHasKey($producto2->id, $resultado);
    }
}
