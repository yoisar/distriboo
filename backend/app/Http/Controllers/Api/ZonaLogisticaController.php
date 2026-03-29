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
    public function index(): JsonResponse
    {
        $zonas = ZonaLogistica::with('provincia')
            ->orderBy('provincia_id')
            ->get();

        return response()->json($zonas);
    }

    public function store(StoreZonaLogisticaRequest $request): JsonResponse
    {
        $zona = ZonaLogistica::create($request->validated());

        return response()->json($zona->load('provincia'), 201);
    }

    public function show(ZonaLogistica $zonasLogistica): JsonResponse
    {
        return response()->json($zonasLogistica->load('provincia'));
    }

    public function update(UpdateZonaLogisticaRequest $request, ZonaLogistica $zonasLogistica): JsonResponse
    {
        $zonasLogistica->update($request->validated());

        return response()->json($zonasLogistica->load('provincia'));
    }

    public function destroy(ZonaLogistica $zonasLogistica): JsonResponse
    {
        $zonasLogistica->delete();

        return response()->json(['message' => 'Zona logística eliminada']);
    }
}
