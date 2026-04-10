<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\PrecioCliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrecioClienteController extends Controller
{
    public function index(Cliente $cliente, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $cliente->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $precios = PrecioCliente::where('cliente_id', $cliente->id)
            ->with('producto:id,nombre,marca,formato,precio')
            ->get();

        return response()->json($precios);
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $cliente->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'precios' => 'required|array',
            'precios.*.producto_id' => 'required|exists:productos,id',
            'precios.*.precio' => 'required|numeric|min:0',
        ]);

        // Sync: eliminar existentes y recrear
        PrecioCliente::where('cliente_id', $cliente->id)->delete();

        foreach ($data['precios'] as $precio) {
            PrecioCliente::create([
                'cliente_id' => $cliente->id,
                'producto_id' => $precio['producto_id'],
                'precio' => $precio['precio'],
            ]);
        }

        $precios = PrecioCliente::where('cliente_id', $cliente->id)
            ->with('producto:id,nombre,marca,formato,precio')
            ->get();

        return response()->json($precios);
    }
}
