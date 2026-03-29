<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Provincia;
use App\Models\ZonaLogistica;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    // ─── Plantillas ───────────────────────────────────────────────────────────

    public function plantillaProductos()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="plantilla_productos.csv"',
        ];

        $rows = [
            ['nombre', 'descripcion', 'marca', 'formato', 'precio', 'stock', 'activo'],
            ['Ejemplo Producto 1', 'Descripción opcional', 'Marca A', '1kg', '1500.00', '100', '1'],
            ['Ejemplo Producto 2', '', 'Marca B', '500g', '800.00', '50', '1'],
        ];

        return response($this->buildCsv($rows), 200, $headers);
    }

    public function plantillaClientes()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="plantilla_clientes.csv"',
        ];

        $rows = [
            ['razon_social', 'email', 'telefono', 'direccion', 'cuit', 'provincia_nombre', 'activo'],
            ['Empresa Ejemplo SA', 'empresa@ejemplo.com', '+54 11 1234-5678', 'Av. Corrientes 123', '20-12345678-9', 'Buenos Aires', '1'],
            ['Comercio Ejemplo SRL', 'comercio@ejemplo.com', '+54 351 456-7890', 'San Martín 456', '30-87654321-0', 'Córdoba', '1'],
        ];

        return response($this->buildCsv($rows), 200, $headers);
    }

    public function plantillaZonas()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="plantilla_zonas_logisticas.csv"',
        ];

        $rows = [
            ['provincia_nombre', 'costo_base', 'costo_por_bulto', 'pedido_minimo', 'tiempo_entrega_dias', 'observaciones', 'activo'],
            ['Buenos Aires', '500.00', '50.00', '5000.00', '3', 'Entrega normal', '1'],
            ['Córdoba', '700.00', '70.00', '4000.00', '4', '', '1'],
            ['Misiones', '1500.00', '120.00', '8000.00', '10', 'Flete a cargo del cliente', '1'],
        ];

        return response($this->buildCsv($rows), 200, $headers);
    }

    // ─── Importaciones ───────────────────────────────────────────────────────

    public function importarProductos(Request $request): JsonResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $user = $request->user();
        $distribuidorId = $user->role === 'distribuidor' ? $user->distribuidor_id : null;

        $rows = $this->parseCsv($request->file('archivo'));

        if ($rows === false || empty($rows)) {
            return response()->json(['message' => 'El archivo está vacío o no es un CSV válido'], 422);
        }

        $headers = array_map('trim', array_shift($rows));
        $required = ['nombre', 'precio', 'stock'];
        $missingHeaders = array_diff($required, $headers);

        if (!empty($missingHeaders)) {
            return response()->json([
                'message' => 'El CSV no tiene las columnas requeridas: ' . implode(', ', $missingHeaders),
            ], 422);
        }

        $created = 0;
        $updated = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            if (count(array_filter($row, fn($v) => $v !== '')) === 0) continue;

            $data = $this->mapRow($headers, $row);

            $validator = Validator::make($data, [
                'nombre' => 'required|string|max:255',
                'precio' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'descripcion' => 'nullable|string',
                'marca' => 'nullable|string|max:255',
                'formato' => 'nullable|string|max:255',
                'activo' => 'nullable|in:0,1,true,false',
            ]);

            if ($validator->fails()) {
                $errors[] = "Fila {$rowNum}: " . implode(', ', $validator->errors()->all());
                continue;
            }

            $productoData = [
                'nombre' => $data['nombre'],
                'precio' => (float) $data['precio'],
                'stock' => (int) $data['stock'],
                'descripcion' => $data['descripcion'] ?? null,
                'marca' => $data['marca'] ?? null,
                'formato' => $data['formato'] ?? null,
                'activo' => $this->parseBool($data['activo'] ?? '1'),
            ];

            if ($distribuidorId) {
                $productoData['distribuidor_id'] = $distribuidorId;
            } elseif (!empty($data['distribuidor_id'])) {
                $productoData['distribuidor_id'] = (int) $data['distribuidor_id'];
            }

            // Buscar por nombre + distribuidor para actualizar si existe
            $query = Producto::where('nombre', $productoData['nombre']);
            if (isset($productoData['distribuidor_id'])) {
                $query->where('distribuidor_id', $productoData['distribuidor_id']);
            }

            $existing = $query->first();

            if ($existing) {
                $existing->update($productoData);
                $updated++;
            } else {
                Producto::create($productoData);
                $created++;
            }
        }

        return response()->json([
            'message' => "Importación completada: {$created} creados, {$updated} actualizados.",
            'creados' => $created,
            'actualizados' => $updated,
            'errores' => $errors,
        ]);
    }

    public function importarClientes(Request $request): JsonResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $user = $request->user();
        $distribuidorId = $user->role === 'distribuidor' ? $user->distribuidor_id : null;

        $rows = $this->parseCsv($request->file('archivo'));

        if ($rows === false || empty($rows)) {
            return response()->json(['message' => 'El archivo está vacío o no es un CSV válido'], 422);
        }

        $headers = array_map('trim', array_shift($rows));
        $required = ['razon_social'];
        $missingHeaders = array_diff($required, $headers);

        if (!empty($missingHeaders)) {
            return response()->json([
                'message' => 'El CSV no tiene las columnas requeridas: ' . implode(', ', $missingHeaders),
            ], 422);
        }

        // Precarga provincias por nombre para evitar N+1
        $provincias = Provincia::all()->keyBy(fn($p) => mb_strtolower(trim($p->nombre)));

        $created = 0;
        $updated = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            if (count(array_filter($row, fn($v) => $v !== '')) === 0) continue;

            $data = $this->mapRow($headers, $row);

            $validator = Validator::make($data, [
                'razon_social' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'telefono' => 'nullable|string|max:50',
                'direccion' => 'nullable|string|max:255',
                'cuit' => 'nullable|string|max:20',
                'activo' => 'nullable|in:0,1,true,false',
            ]);

            if ($validator->fails()) {
                $errors[] = "Fila {$rowNum}: " . implode(', ', $validator->errors()->all());
                continue;
            }

            // Resolver provincia por nombre
            $provinciaId = null;
            if (!empty($data['provincia_nombre'])) {
                $pNombre = mb_strtolower(trim($data['provincia_nombre']));
                $provincia = $provincias->first(fn($p) => mb_strtolower(trim($p->nombre)) === $pNombre);
                if ($provincia) {
                    $provinciaId = $provincia->id;
                } else {
                    $errors[] = "Fila {$rowNum}: Provincia '{$data['provincia_nombre']}' no encontrada. Se importó sin provincia.";
                }
            }

            $clienteData = [
                'razon_social' => $data['razon_social'],
                'email' => $data['email'] ?? null,
                'telefono' => $data['telefono'] ?? null,
                'direccion' => $data['direccion'] ?? null,
                'cuit' => $data['cuit'] ?? null,
                'provincia_id' => $provinciaId,
                'activo' => $this->parseBool($data['activo'] ?? '1'),
            ];

            if ($distribuidorId) {
                $clienteData['distribuidor_id'] = $distribuidorId;
            } elseif (!empty($data['distribuidor_id'])) {
                $clienteData['distribuidor_id'] = (int) $data['distribuidor_id'];
            }

            // Buscar por email + distribuidor o por razon_social + distribuidor
            $query = Cliente::query();
            if (isset($clienteData['distribuidor_id'])) {
                $query->where('distribuidor_id', $clienteData['distribuidor_id']);
            }
            if (!empty($clienteData['email'])) {
                $query->where('email', $clienteData['email']);
            } else {
                $query->where('razon_social', $clienteData['razon_social']);
            }

            $existing = $query->first();

            if ($existing) {
                $existing->update($clienteData);
                $updated++;
            } else {
                Cliente::create($clienteData);
                $created++;
            }
        }

        return response()->json([
            'message' => "Importación completada: {$created} creados, {$updated} actualizados.",
            'creados' => $created,
            'actualizados' => $updated,
            'errores' => $errors,
        ]);
    }

    public function importarZonas(Request $request): JsonResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $user = $request->user();
        $distribuidorId = $user->role === 'distribuidor' ? $user->distribuidor_id : null;

        $rows = $this->parseCsv($request->file('archivo'));

        if ($rows === false || empty($rows)) {
            return response()->json(['message' => 'El archivo está vacío o no es un CSV válido'], 422);
        }

        $headers = array_map('trim', array_shift($rows));
        $required = ['provincia_nombre', 'costo_base'];
        $missingHeaders = array_diff($required, $headers);

        if (!empty($missingHeaders)) {
            return response()->json([
                'message' => 'El CSV no tiene las columnas requeridas: ' . implode(', ', $missingHeaders),
            ], 422);
        }

        $provincias = Provincia::all()->keyBy(fn($p) => mb_strtolower(trim($p->nombre)));

        $created = 0;
        $updated = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            if (count(array_filter($row, fn($v) => $v !== '')) === 0) continue;

            $data = $this->mapRow($headers, $row);

            $validator = Validator::make($data, [
                'provincia_nombre' => 'required|string',
                'costo_base' => 'required|numeric|min:0',
                'costo_por_bulto' => 'nullable|numeric|min:0',
                'pedido_minimo' => 'nullable|numeric|min:0',
                'tiempo_entrega_dias' => 'nullable|integer|min:1',
                'activo' => 'nullable|in:0,1,true,false',
            ]);

            if ($validator->fails()) {
                $errors[] = "Fila {$rowNum}: " . implode(', ', $validator->errors()->all());
                continue;
            }

            $pNombre = mb_strtolower(trim($data['provincia_nombre']));
            $provincia = $provincias->first(fn($p) => mb_strtolower(trim($p->nombre)) === $pNombre);

            if (!$provincia) {
                $errors[] = "Fila {$rowNum}: Provincia '{$data['provincia_nombre']}' no encontrada. Fila omitida.";
                continue;
            }

            $zonaData = [
                'provincia_id' => $provincia->id,
                'costo_base' => (float) $data['costo_base'],
                'costo_por_bulto' => isset($data['costo_por_bulto']) && $data['costo_por_bulto'] !== '' ? (float) $data['costo_por_bulto'] : 0,
                'pedido_minimo' => isset($data['pedido_minimo']) && $data['pedido_minimo'] !== '' ? (float) $data['pedido_minimo'] : 0,
                'tiempo_entrega_dias' => isset($data['tiempo_entrega_dias']) && $data['tiempo_entrega_dias'] !== '' ? (int) $data['tiempo_entrega_dias'] : 1,
                'observaciones' => $data['observaciones'] ?? null,
                'activo' => $this->parseBool($data['activo'] ?? '1'),
            ];

            if ($distribuidorId) {
                $zonaData['distribuidor_id'] = $distribuidorId;
            } elseif (!empty($data['distribuidor_id'])) {
                $zonaData['distribuidor_id'] = (int) $data['distribuidor_id'];
            }

            // Buscar zona por provincia + distribuidor para actualizar si existe
            $query = ZonaLogistica::where('provincia_id', $zonaData['provincia_id']);
            if (isset($zonaData['distribuidor_id'])) {
                $query->where('distribuidor_id', $zonaData['distribuidor_id']);
            }

            $existing = $query->first();

            if ($existing) {
                $existing->update($zonaData);
                $updated++;
            } else {
                ZonaLogistica::create($zonaData);
                $created++;
            }
        }

        return response()->json([
            'message' => "Importación completada: {$created} creadas, {$updated} actualizadas.",
            'creados' => $created,
            'actualizados' => $updated,
            'errores' => $errors,
        ]);
    }

    // ─── Helpers privados ────────────────────────────────────────────────────

    private function parseCsv($file): array|false
    {
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if ($handle === false) return false;

        // Detectar BOM UTF-8 y eliminarlo
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            fseek($handle, 0);
        }

        $rows = [];
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            $rows[] = array_map(fn($v) => trim($v), $row);
        }

        fclose($handle);
        return $rows;
    }

    private function mapRow(array $headers, array $row): array
    {
        $row = array_pad($row, count($headers), '');
        return array_combine($headers, $row);
    }

    private function parseBool(mixed $value): bool
    {
        if (is_bool($value)) return $value;
        $v = strtolower(trim((string) $value));
        return in_array($v, ['1', 'true', 'yes', 'si', 'sí']);
    }

    private function buildCsv(array $rows): string
    {
        $output = '';
        foreach ($rows as $row) {
            $escaped = array_map(function ($field) {
                $field = str_replace('"', '""', $field);
                if (str_contains($field, ',') || str_contains($field, '"') || str_contains($field, "\n")) {
                    $field = '"' . $field . '"';
                }
                return $field;
            }, $row);
            $output .= implode(',', $escaped) . "\r\n";
        }
        return $output;
    }
}
