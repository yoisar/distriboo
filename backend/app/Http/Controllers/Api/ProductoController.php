<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductoRequest;
use App\Http\Requests\UpdateProductoRequest;
use App\Models\Producto;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Producto::query();

        // Filtrar por distribuidor según rol
        if ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        } elseif ($user->role === 'cliente') {
            // Cliente ve catálogo de su distribuidor, sin stock ni precio
            $query->where('distribuidor_id', $user->distribuidor_id)
                  ->where('activo', true);
        }
        // super_admin ve todo

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('marca', 'like', "%{$search}%");
            });
        }

        $productos = $query->orderBy('nombre')->paginate(20);

        // Clientes: ocultar stock y precio en la lista del catálogo
        if ($user->role === 'cliente') {
            $productos->getCollection()->transform(function ($p) {
                $p->makeHidden(['stock', 'precio']);
                return $p;
            });
        }

        return response()->json($productos);
    }

    public function store(StoreProductoRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Distribuidor crea para sí mismo
        $user = $request->user();
        if ($user->role === 'distribuidor') {
            $data['distribuidor_id'] = $user->distribuidor_id;
        }
        // super_admin debe enviar distribuidor_id en el request

        $producto = Producto::create($data);

        return response()->json($producto, 201);
    }

    public function show(Producto $producto, Request $request): JsonResponse
    {
        $user = $request->user();

        // Distribuidor solo ve sus productos
        if ($user->role === 'distribuidor' && $producto->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Cliente solo ve productos de su distribuidor
        if ($user->role === 'cliente' && $producto->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($producto);
    }

    public function update(UpdateProductoRequest $request, Producto $producto): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $producto->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $producto->update($request->validated());

        return response()->json($producto);
    }

    public function destroy(Producto $producto, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $producto->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        try {
            $producto->delete();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json(['message' => 'No se puede eliminar el producto porque tiene pedidos asociados'], 409);
            }
            throw $e;
        }

        return response()->json(['message' => 'Producto eliminado']);
    }
}
