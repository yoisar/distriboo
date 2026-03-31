<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Revendedor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RevendedorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);

        $revendedores = Revendedor::with('user:id,name,email')
            ->withCount(['suscripciones as clientes_activos' => function ($q) {
                $q->where('estado', 'activa');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($revendedores);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'porcentaje_base' => 'nullable|numeric|min:0|max:100',
            'cbu' => 'nullable|string|max:255',
            'cvu' => 'nullable|string|max:255',
            'alias_bancario' => 'nullable|string|max:255',
            'banco' => 'nullable|string|max:255',
            'titular_cuenta' => 'nullable|string|max:255',
            'cuit' => 'nullable|string|max:20',
        ]);

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'revendedor',
            ]);

            $revendedor = Revendedor::create([
                'user_id' => $user->id,
                'codigo_referido' => $this->generarCodigoReferido(),
                'porcentaje_base' => $data['porcentaje_base'] ?? 20,
                'cbu' => $data['cbu'] ?? null,
                'cvu' => $data['cvu'] ?? null,
                'alias_bancario' => $data['alias_bancario'] ?? null,
                'banco' => $data['banco'] ?? null,
                'titular_cuenta' => $data['titular_cuenta'] ?? null,
                'cuit' => $data['cuit'] ?? null,
            ]);

            return response()->json($revendedor->load('user'), 201);
        });
    }

    public function show(Revendedor $revendedor): JsonResponse
    {
        $revendedor->load('user:id,name,email');
        $revendedor->loadCount(['suscripciones as clientes_activos' => function ($q) {
            $q->where('estado', 'activa');
        }]);

        $revendedor->porcentaje_vigente = $revendedor->porcentajeVigente();

        return response()->json($revendedor);
    }

    public function update(Request $request, Revendedor $revendedor): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $revendedor->user_id,
            'password' => 'nullable|string|min:6',
            'porcentaje_base' => 'nullable|numeric|min:0|max:100',
            'cbu' => 'nullable|string|max:255',
            'cvu' => 'nullable|string|max:255',
            'alias_bancario' => 'nullable|string|max:255',
            'banco' => 'nullable|string|max:255',
            'titular_cuenta' => 'nullable|string|max:255',
            'cuit' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ]);

        return DB::transaction(function () use ($data, $revendedor) {
            // Actualizar user
            $userData = array_filter([
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
            ]);

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            if (!empty($userData)) {
                $revendedor->user->update($userData);
            }

            // Actualizar revendedor
            $revendedorData = array_intersect_key($data, array_flip([
                'porcentaje_base', 'cbu', 'cvu', 'alias_bancario',
                'banco', 'titular_cuenta', 'cuit', 'activo',
            ]));

            $revendedor->update($revendedorData);

            return response()->json($revendedor->load('user'));
        });
    }

    public function destroy(Revendedor $revendedor): JsonResponse
    {
        $revendedor->update(['activo' => false]);
        $revendedor->delete(); // soft delete

        return response()->json(['message' => 'Revendedor desactivado']);
    }

    private function generarCodigoReferido(): string
    {
        do {
            $codigo = strtoupper(Str::random(8));
        } while (Revendedor::where('codigo_referido', $codigo)->exists());

        return $codigo;
    }
}
