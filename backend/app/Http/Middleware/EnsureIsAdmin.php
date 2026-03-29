<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, ['super_admin', 'distribuidor'])) {
            return response()->json(['message' => 'No autorizado. Se requiere rol de administrador.'], 403);
        }

        return $next($request);
    }
}
