<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Provincia;
use Illuminate\Http\JsonResponse;

class ProvinciaController extends Controller
{
    public function index(): JsonResponse
    {
        $provincias = Provincia::with('zonaLogistica')
            ->where('activo', true)
            ->orderBy('nombre')
            ->get();

        return response()->json($provincias);
    }
}
