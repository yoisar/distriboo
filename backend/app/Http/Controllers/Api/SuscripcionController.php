<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionComision;
use App\Models\Distribuidor;
use App\Models\Plan;
use App\Models\Revendedor;
use App\Models\Suscripcion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuscripcionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);

        $suscripciones = Suscripcion::with([
            'distribuidor:id,nombre_comercial',
            'plan:id,nombre,precio_mensual',
            'revendedor.user:id,name',
        ])->orderByDesc('created_at')->paginate($perPage);

        return response()->json($suscripciones);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'distribuidor_id' => 'required|exists:distribuidores,id',
            'plan_id' => 'required|exists:planes,id',
            'plazo_meses' => 'required|in:3,6,12',
            'codigo_referido' => 'nullable|string|exists:revendedores,codigo_referido',
        ]);

        $plan = Plan::findOrFail($data['plan_id']);

        // Calcular descuento
        $descuentos = [
            3 => (float) ConfiguracionComision::getValor('descuento_3_meses', '10'),
            6 => (float) ConfiguracionComision::getValor('descuento_6_meses', '20'),
            12 => (float) ConfiguracionComision::getValor('descuento_12_meses', '30'),
        ];

        $descuento = $descuentos[$data['plazo_meses']] ?? 0;
        $precioFinal = $plan->precio_mensual * (1 - $descuento / 100);

        // Encontrar revendedor si se proporcionó código
        $revendedorId = null;
        if (!empty($data['codigo_referido'])) {
            $revendedor = Revendedor::where('codigo_referido', $data['codigo_referido'])
                ->where('activo', true)
                ->first();
            $revendedorId = $revendedor?->id;

            // Asignar revendedor al distribuidor
            if ($revendedorId) {
                Distribuidor::where('id', $data['distribuidor_id'])
                    ->update(['revendedor_id' => $revendedorId]);
            }
        }

        $suscripcion = Suscripcion::create([
            'distribuidor_id' => $data['distribuidor_id'],
            'plan_id' => $data['plan_id'],
            'revendedor_id' => $revendedorId,
            'plazo_meses' => $data['plazo_meses'],
            'descuento_porcentaje' => $descuento,
            'precio_final_mensual' => $precioFinal,
            'setup_pagado' => $plan->setup_inicial,
            'fecha_inicio' => now()->toDateString(),
            'fecha_fin' => now()->addMonths($data['plazo_meses'])->toDateString(),
            'estado' => 'pendiente',
        ]);

        return response()->json($suscripcion->load(['plan', 'distribuidor', 'revendedor']), 201);
    }

    public function show(Suscripcion $suscripcion): JsonResponse
    {
        return response()->json(
            $suscripcion->load(['distribuidor', 'plan', 'revendedor.user:id,name', 'comisiones'])
        );
    }

    public function update(Request $request, Suscripcion $suscripcion): JsonResponse
    {
        $data = $request->validate([
            'estado' => 'sometimes|in:activa,cancelada,vencida,pendiente',
            'plan_id' => 'sometimes|exists:planes,id',
        ]);

        if (isset($data['plan_id']) && $data['plan_id'] !== $suscripcion->plan_id) {
            $plan = Plan::findOrFail($data['plan_id']);
            $data['precio_final_mensual'] = $plan->precio_mensual * (1 - $suscripcion->descuento_porcentaje / 100);
        }

        $suscripcion->update($data);

        return response()->json($suscripcion->load(['plan', 'distribuidor']));
    }
}
