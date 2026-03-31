<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comision;
use App\Models\Revendedor;
use App\Models\Suscripcion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReporteComisionController extends Controller
{
    /**
     * Comisiones por revendedor (mensual, anual) - Super Admin
     */
    public function comisionesPorRevendedor(Request $request): JsonResponse
    {
        $anio = $request->get('anio', now()->year);

        $revendedores = Revendedor::with('user:id,name,email')
            ->withSum(['comisiones as total_pagadas' => function ($q) use ($anio) {
                $q->where('estado', 'pagada')->where('anio', $anio);
            }], 'monto_comision')
            ->withSum(['comisiones as total_pendientes' => function ($q) use ($anio) {
                $q->where('estado', 'pendiente')->where('anio', $anio);
            }], 'monto_comision')
            ->withCount(['suscripciones as clientes_activos' => function ($q) {
                $q->where('estado', 'activa');
            }])
            ->get();

        return response()->json($revendedores);
    }

    /**
     * Clientes por plan - Super Admin
     */
    public function clientesPorPlan(): JsonResponse
    {
        $data = Suscripcion::where('estado', 'activa')
            ->selectRaw('plan_id, COUNT(*) as total')
            ->groupBy('plan_id')
            ->with('plan:id,nombre')
            ->get();

        return response()->json($data);
    }

    /**
     * MRR (Monthly Recurring Revenue) - Super Admin
     */
    public function mrr(): JsonResponse
    {
        $mrr = Suscripcion::where('estado', 'activa')
            ->sum('precio_final_mensual');

        $totalSuscripciones = Suscripcion::where('estado', 'activa')->count();

        return response()->json([
            'mrr' => $mrr,
            'total_suscripciones_activas' => $totalSuscripciones,
        ]);
    }

    /**
     * Ranking de revendedores por ventas - Super Admin
     */
    public function rankingRevendedores(): JsonResponse
    {
        $ranking = Revendedor::with('user:id,name')
            ->withCount(['suscripciones as total_clientes' => function ($q) {
                $q->where('estado', 'activa');
            }])
            ->withSum(['comisiones as total_comisiones' => function ($q) {
                $q->where('estado', 'pagada');
            }], 'monto_comision')
            ->orderByDesc('total_clientes')
            ->get();

        return response()->json($ranking);
    }

    /**
     * Proyección para revendedor
     */
    public function proyeccionRevendedor(Request $request): JsonResponse
    {
        $user = $request->user();
        $revendedor = Revendedor::where('user_id', $user->id)->firstOrFail();

        $clientesActivos = $revendedor->clientesActivos();
        $porcentajeActual = $revendedor->porcentajeVigente();

        // Calcular ingreso promedio mensual actual
        $ingresoActual = Comision::where('revendedor_id', $revendedor->id)
            ->where('tipo', 'mensual')
            ->where('anio', now()->year)
            ->where('mes', now()->month)
            ->sum('monto_comision');

        // Proyección: si consigo X clientes más
        $proyecciones = [];
        for ($extra = 1; $extra <= 5; $extra++) {
            $totalFuturo = $clientesActivos + $extra;
            $porcentajeFuturo = $porcentajeActual;

            // Recalcular porcentaje según config
            $config = \App\Models\ConfiguracionComision::getConfigArray();
            if ($totalFuturo >= ($config['bonus_nivel_2_min_clientes'] ?? 5)) {
                $porcentajeFuturo = (float) ($config['bonus_nivel_2_porcentaje'] ?? 30);
            } elseif ($totalFuturo >= ($config['bonus_nivel_1_min_clientes'] ?? 3)) {
                $porcentajeFuturo = (float) ($config['bonus_nivel_1_porcentaje'] ?? 25);
            }

            $proyecciones[] = [
                'clientes_extra' => $extra,
                'total_clientes' => $totalFuturo,
                'porcentaje' => $porcentajeFuturo,
            ];
        }

        return response()->json([
            'clientes_activos' => $clientesActivos,
            'porcentaje_actual' => $porcentajeActual,
            'ingreso_mensual_actual' => $ingresoActual,
            'proyecciones' => $proyecciones,
        ]);
    }
}
