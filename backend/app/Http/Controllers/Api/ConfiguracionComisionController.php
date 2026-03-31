<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionComision;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfiguracionComisionController extends Controller
{
    public function index(): JsonResponse
    {
        $config = ConfiguracionComision::all();

        return response()->json($config);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'configuraciones' => 'required|array',
            'configuraciones.*.clave' => 'required|string|exists:configuracion_comisiones,clave',
            'configuraciones.*.valor' => 'required|string',
        ]);

        foreach ($data['configuraciones'] as $item) {
            ConfiguracionComision::where('clave', $item['clave'])
                ->update(['valor' => $item['valor']]);
        }

        return response()->json([
            'message' => 'Configuración actualizada',
            'data' => ConfiguracionComision::all(),
        ]);
    }
}
