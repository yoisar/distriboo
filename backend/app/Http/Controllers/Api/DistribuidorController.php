<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Distribuidor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DistribuidorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);
        $distribuidores = Distribuidor::orderBy('nombre_comercial')->paginate($perPage);

        return response()->json($distribuidores);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_comercial' => 'required|string|max:255',
            'razon_social' => 'nullable|string|max:255',
            'email_contacto' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        $distribuidor = Distribuidor::create($data);

        return response()->json($distribuidor, 201);
    }

    public function show(Distribuidor $distribuidore): JsonResponse
    {
        return response()->json($distribuidore->load(['clientes', 'productos']));
    }

    public function update(Request $request, Distribuidor $distribuidore): JsonResponse
    {
        $data = $request->validate([
            'nombre_comercial' => 'sometimes|string|max:255',
            'razon_social' => 'nullable|string|max:255',
            'email_contacto' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        $distribuidore->update($data);

        return response()->json($distribuidore);
    }

    public function destroy(Distribuidor $distribuidore): JsonResponse
    {
        if ($distribuidore->clientes()->exists() || $distribuidore->productos()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un distribuidor con clientes o productos asociados',
            ], 409);
        }

        $distribuidore->delete();

        return response()->json(['message' => 'Distribuidor eliminado']);
    }
}
