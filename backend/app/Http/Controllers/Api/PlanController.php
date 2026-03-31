<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Listar planes (público para landing, autenticado para admin)
     */
    public function index(): JsonResponse
    {
        $planes = Plan::where('activo', true)->orderBy('orden')->get();

        return response()->json($planes);
    }

    /**
     * Listar todos los planes (incluidos inactivos) - Solo Super Admin
     */
    public function indexAdmin(): JsonResponse
    {
        $planes = Plan::orderBy('orden')->get();

        return response()->json($planes);
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json($plan);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:planes,slug',
            'precio_mensual' => 'required|numeric|min:0',
            'setup_inicial' => 'required|numeric|min:0',
            'caracteristicas' => 'required|array',
            'max_productos' => 'nullable|integer|min:1',
            'max_clientes' => 'nullable|integer|min:1',
            'multi_vendedor' => 'boolean',
            'integraciones' => 'boolean',
            'reportes' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ]);

        $plan = Plan::create($data);

        return response()->json($plan, 201);
    }

    public function update(Request $request, Plan $plan): JsonResponse
    {
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:planes,slug,' . $plan->id,
            'precio_mensual' => 'sometimes|numeric|min:0',
            'setup_inicial' => 'sometimes|numeric|min:0',
            'caracteristicas' => 'sometimes|array',
            'max_productos' => 'nullable|integer|min:1',
            'max_clientes' => 'nullable|integer|min:1',
            'multi_vendedor' => 'boolean',
            'integraciones' => 'boolean',
            'reportes' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ]);

        $plan->update($data);

        return response()->json($plan);
    }

    public function destroy(Plan $plan): JsonResponse
    {
        if ($plan->suscripciones()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un plan con suscripciones activas',
            ], 409);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan eliminado']);
    }
}
