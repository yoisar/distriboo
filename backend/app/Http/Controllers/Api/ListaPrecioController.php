<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ListaPrecio;
use App\Models\ListaPrecioProducto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListaPrecioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ListaPrecio::withCount('clientes');

        if ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        return response()->json($query->orderBy('nombre')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean',
            'precios' => 'nullable|array',
            'precios.*.producto_id' => 'required_with:precios|exists:productos,id',
            'precios.*.precio' => 'required_with:precios|numeric|min:0',
        ]);

        $user = $request->user();
        if ($user->role === 'distribuidor') {
            $data['distribuidor_id'] = $user->distribuidor_id;
        }

        $lista = ListaPrecio::create([
            'distribuidor_id' => $data['distribuidor_id'],
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'activo' => $data['activo'] ?? true,
        ]);

        if (!empty($data['precios'])) {
            foreach ($data['precios'] as $precio) {
                ListaPrecioProducto::create([
                    'lista_precio_id' => $lista->id,
                    'producto_id' => $precio['producto_id'],
                    'precio' => $precio['precio'],
                ]);
            }
        }

        return response()->json($lista->load('preciosProductos.producto'), 201);
    }

    public function show(ListaPrecio $listasPrecio, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $listasPrecio->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json(
            $listasPrecio->load(['preciosProductos.producto', 'clientes:id,razon_social,lista_precio_id'])
        );
    }

    public function update(Request $request, ListaPrecio $listasPrecio): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $listasPrecio->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean',
            'precios' => 'nullable|array',
            'precios.*.producto_id' => 'required_with:precios|exists:productos,id',
            'precios.*.precio' => 'required_with:precios|numeric|min:0',
        ]);

        $listasPrecio->update([
            'nombre' => $data['nombre'] ?? $listasPrecio->nombre,
            'descripcion' => $data['descripcion'] ?? $listasPrecio->descripcion,
            'activo' => $data['activo'] ?? $listasPrecio->activo,
        ]);

        if (isset($data['precios'])) {
            // Sync: eliminar existentes y recrear
            $listasPrecio->preciosProductos()->delete();
            foreach ($data['precios'] as $precio) {
                ListaPrecioProducto::create([
                    'lista_precio_id' => $listasPrecio->id,
                    'producto_id' => $precio['producto_id'],
                    'precio' => $precio['precio'],
                ]);
            }
        }

        return response()->json($listasPrecio->load('preciosProductos.producto'));
    }

    public function destroy(ListaPrecio $listasPrecio, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $listasPrecio->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $listasPrecio->delete();

        return response()->json(['message' => 'Lista de precios eliminada']);
    }
}
