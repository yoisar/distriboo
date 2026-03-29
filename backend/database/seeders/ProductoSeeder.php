<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $productos = [
            ['nombre' => 'Paleta Frutal', 'descripcion' => 'Paleta helada sabor frutal', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 24', 'precio' => 12000, 'stock' => 200],
            ['nombre' => 'Bombón Helado Chocolate', 'descripcion' => 'Bombón helado bañado en chocolate', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 18', 'precio' => 18000, 'stock' => 150],
            ['nombre' => 'Helado Crema 1L', 'descripcion' => 'Pote de helado de crema 1 litro', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 6', 'precio' => 24000, 'stock' => 100],
            ['nombre' => 'Paleta Agua Limón', 'descripcion' => 'Paleta de agua sabor limón', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 30', 'precio' => 9000, 'stock' => 300],
            ['nombre' => 'Helado Crema 2.5L', 'descripcion' => 'Balde de helado 2.5 litros', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 4', 'precio' => 36000, 'stock' => 80],
            ['nombre' => 'Vasito Dulce de Leche', 'descripcion' => 'Vasito individual dulce de leche', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 36', 'precio' => 15000, 'stock' => 250],
            ['nombre' => 'Sándwich Helado', 'descripcion' => 'Sándwich de helado vainilla y chocolate', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 20', 'precio' => 16000, 'stock' => 180],
            ['nombre' => 'Cono Triple', 'descripcion' => 'Cono helado triple sabor', 'marca' => 'Distriboo Ice', 'formato' => 'Caja x 12', 'precio' => 22000, 'stock' => 120],
        ];

        foreach ($productos as $producto) {
            Producto::create(array_merge($producto, ['activo' => true]));
        }
    }
}
