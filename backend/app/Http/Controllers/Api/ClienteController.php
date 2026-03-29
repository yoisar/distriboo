<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Cliente::with('provincia');

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('razon_social', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cuit', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('razon_social')->paginate(20));
    }

    public function store(StoreClienteRequest $request): JsonResponse
    {
        $cliente = Cliente::create($request->validated());

        return response()->json($cliente->load('provincia'), 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return response()->json($cliente->load('provincia'));
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): JsonResponse
    {
        $cliente->update($request->validated());

        return response()->json($cliente->load('provincia'));
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        try {
            $cliente->delete();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json(['message' => 'No se puede eliminar el cliente porque tiene pedidos asociados'], 409);
            }
            throw $e;
        }

        return response()->json(['message' => 'Cliente eliminado']);
    }
}
