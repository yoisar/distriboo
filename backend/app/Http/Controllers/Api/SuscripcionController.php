<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionComision;
use App\Models\Distribuidor;
use App\Models\Plan;
use App\Models\Revendedor;
use App\Models\Suscripcion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuscripcionController extends Controller
{
    public function storePublic(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_comercial' => 'required|string|max:255',
            'razon_social' => 'nullable|string|max:255',
            'email_contacto' => 'required|email|max:255',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'nombre_usuario' => 'required|string|max:255',
            'email_usuario' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'plan_id' => 'required|exists:planes,id',
            'plazo_meses' => 'required|in:1,3,6,12',
            'codigo_referido' => 'nullable|string|exists:revendedores,codigo_referido',
        ]);

        return DB::transaction(function () use ($data) {
            $plan = Plan::where('activo', true)->findOrFail($data['plan_id']);
            [$descuento, $precioFinal, $revendedorId] = $this->resolverValoresSuscripcion($plan, $data['plazo_meses'], $data['codigo_referido'] ?? null);

            $distribuidor = Distribuidor::create([
                'nombre_comercial' => $data['nombre_comercial'],
                'razon_social' => $data['razon_social'] ?? null,
                'email_contacto' => $data['email_contacto'],
                'telefono' => $data['telefono'] ?? null,
                'direccion' => $data['direccion'] ?? null,
                'activo' => true,
                'revendedor_id' => $revendedorId,
            ]);

            User::create([
                'name' => $data['nombre_usuario'],
                'email' => $data['email_usuario'],
                'password' => Hash::make($data['password']),
                'role' => 'distribuidor',
                'distribuidor_id' => $distribuidor->id,
            ]);

            $suscripcion = Suscripcion::create([
                'distribuidor_id' => $distribuidor->id,
                'plan_id' => $plan->id,
                'revendedor_id' => $revendedorId,
                'plazo_meses' => $data['plazo_meses'],
                'descuento_porcentaje' => $descuento,
                'precio_final_mensual' => $precioFinal,
                'setup_pagado' => $plan->setup_inicial,
                'fecha_inicio' => now()->toDateString(),
                'fecha_fin' => now()->copy()->addMonths($data['plazo_meses'])->toDateString(),
                'estado' => 'pendiente',
            ]);

            return response()->json([
                'message' => 'Solicitud de suscripción creada correctamente',
                'suscripcion' => $suscripcion->load(['plan', 'distribuidor', 'revendedor']),
            ], 201);
        });
    }

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
            'plazo_meses' => 'required|in:1,3,6,12',
            'codigo_referido' => 'nullable|string|exists:revendedores,codigo_referido',
        ]);

        $plan = Plan::findOrFail($data['plan_id']);
        [$descuento, $precioFinal, $revendedorId] = $this->resolverValoresSuscripcion($plan, $data['plazo_meses'], $data['codigo_referido'] ?? null);

        if ($revendedorId) {
            Distribuidor::where('id', $data['distribuidor_id'])
                ->update(['revendedor_id' => $revendedorId]);
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

    private function resolverValoresSuscripcion(Plan $plan, int $plazoMeses, ?string $codigoReferido): array
    {
        $descuentos = [
            1 => 0,
            3 => (float) ConfiguracionComision::getValor('descuento_3_meses', '10'),
            6 => (float) ConfiguracionComision::getValor('descuento_6_meses', '20'),
            12 => (float) ConfiguracionComision::getValor('descuento_12_meses', '30'),
        ];

        $descuento = $descuentos[$plazoMeses] ?? 0;
        $precioFinal = $plan->precio_mensual * (1 - $descuento / 100);

        $revendedorId = null;
        if (!empty($codigoReferido)) {
            $revendedor = Revendedor::where('codigo_referido', $codigoReferido)
                ->where('activo', true)
                ->first();
            $revendedorId = $revendedor?->id;
        }

        return [$descuento, $precioFinal, $revendedorId];
    }
}
