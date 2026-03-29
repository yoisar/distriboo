<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZonaLogisticaRequest;
use App\Http\Requests\UpdateZonaLogisticaRequest;
use App\Models\ZonaLogistica;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZonaLogisticaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ZonaLogistica::with('provincia');

        if ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        }

        $perPage = $request->get('per_page', 10);
        $zonas = $query->orderBy('provincia_id')->paginate($perPage);

        return response()->json($zonas);
    }

    public function store(StoreZonaLogisticaRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $request->user();
        if ($user->role === 'distribuidor') {
            $data['distribuidor_id'] = $user->distribuidor_id;
        }

        $zona = ZonaLogistica::create($data);

        return response()->json($zona->load('provincia'), 201);
    }

    public function show(ZonaLogistica $zonasLogistica, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $zonasLogistica->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($zonasLogistica->load('provincia'));
    }

    public function update(UpdateZonaLogisticaRequest $request, ZonaLogistica $zonasLogistica): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $zonasLogistica->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $zonasLogistica->update($request->validated());

        return response()->json($zonasLogistica->load('provincia'));
    }

    public function destroy(ZonaLogistica $zonasLogistica, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'distribuidor' && $zonasLogistica->distribuidor_id !== $user->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $zonasLogistica->delete();

        return response()->json(['message' => 'Zona logística eliminada']);
    }
}
