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
        $user = $request->user();
        $query = Cliente::with(['provincia', 'distribuidor']);

        // Filtrar por distribuidor según rol
        if ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        }
        // super_admin ve todo

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
        $data = $request->validated();

        $user = $request->user();
        if ($user->role === 'distribuidor') {
            $data['distribuidor_id'] = $user->distribuidor_id;
        }

        $distribuidorId = $data['distribuidor_id'] ?? null;

        // Verificar si ya existe un cliente con este email para este distribuidor
        $existingMismoDistribuidor = Cliente::where('email', $data['email'])
            ->where('distribuidor_id', $distribuidorId)
            ->first();

        if ($existingMismoDistribuidor) {
            return response()->json([
                'message' => 'Ya existe un cliente con ese email en tu distribuidora.',
                'cliente_existente' => $existingMismoDistribuidor->load(['provincia', 'distribuidor']),
            ], 409);
        }

        // Si existe en otro distribuidor, traer sus datos para pre-rellenar
        $existingOtroDistribuidor = Cliente::where('email', $data['email'])
            ->where('distribuidor_id', '!=', $distribuidorId)
            ->first();

        if ($existingOtroDistribuidor) {
            // Pre-rellenar con datos del cliente existente (omitir distribuidor_id)
            $data['razon_social'] = $data['razon_social'] ?: $existingOtroDistribuidor->razon_social;
            $data['telefono'] = $data['telefono'] ?? $existingOtroDistribuidor->telefono;
            $data['provincia_id'] = $data['provincia_id'] ?? $existingOtroDistribuidor->provincia_id;
            $data['direccion'] = $data['direccion'] ?? $existingOtroDistribuidor->direccion;
            $data['cuit'] = $data['cuit'] ?? $existingOtroDistribuidor->cuit;
        }

        $cliente = Cliente::create($data);

        return response()->json($cliente->load(['provincia', 'distribuidor']), 201);
    }

    public function show(Cliente $cliente, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $cliente->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($cliente->load(['provincia', 'distribuidor']));
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $cliente->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $cliente->update($request->validated());

        return response()->json($cliente->load(['provincia', 'distribuidor']));
    }

    public function destroy(Cliente $cliente, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $cliente->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

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
