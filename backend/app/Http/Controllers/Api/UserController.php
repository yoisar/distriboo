<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = User::with('cliente');

        // Distribuidor solo ve usuarios de su distribuidora
        if ($user->role === 'distribuidor') {
            $query->where('distribuidor_id', $user->distribuidor_id);
        }

        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('name')->paginate(20));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        // Distribuidor solo puede crear clientes para sí mismo
        if ($user->role === 'distribuidor') {
            $data['distribuidor_id'] = $user->distribuidor_id;
            $data['role'] = 'cliente'; // Solo puede crear clientes
        }

        $newUser = User::create($data);

        return response()->json($newUser->load('cliente'), 201);
    }

    public function show(User $user, Request $request): JsonResponse
    {
        $authUser = $request->user();

        if ($authUser->role === 'distribuidor' && $user->distribuidor_id !== $authUser->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($user->load('cliente'));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        if ($authUser->role === 'distribuidor' && $user->distribuidor_id !== $authUser->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user->update($request->validated());

        return response()->json($user->load('cliente'));
    }

    public function destroy(User $user, Request $request): JsonResponse
    {
        $authUser = $request->user();

        if ($user->id === $authUser->id) {
            return response()->json(['message' => 'No podés eliminar tu propio usuario'], 403);
        }

        if ($authUser->role === 'distribuidor' && $user->distribuidor_id !== $authUser->distribuidor_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(null, 204);
    }
}
