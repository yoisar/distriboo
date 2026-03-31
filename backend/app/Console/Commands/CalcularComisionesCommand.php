<?php

namespace App\Console\Commands;

use App\Models\Comision;
use App\Models\Suscripcion;
use Illuminate\Console\Command;

class CalcularComisionesCommand extends Command
{
    protected $signature = 'comisiones:calcular {--mes= : Mes a calcular (1-12)} {--anio= : Año a calcular}';

    protected $description = 'Calcula las comisiones mensuales para todos los revendedores con suscripciones activas';

    public function handle(): int
    {
        $mes = (int) ($this->option('mes') ?? now()->month);
        $anio = (int) ($this->option('anio') ?? now()->year);

        $this->info("Calculando comisiones para {$mes}/{$anio}...");

        $suscripciones = Suscripcion::where('estado', 'activa')
            ->whereNotNull('revendedor_id')
            ->with(['revendedor', 'plan'])
            ->get();

        $creadas = 0;
        $omitidas = 0;

        foreach ($suscripciones as $suscripcion) {
            // Verificar que no exista ya una comisión para este mes/año
            $existe = Comision::where('suscripcion_id', $suscripcion->id)
                ->where('tipo', 'mensual')
                ->where('mes', $mes)
                ->where('anio', $anio)
                ->exists();

            if ($existe) {
                $omitidas++;
                continue;
            }

            $revendedor = $suscripcion->revendedor;
            if (!$revendedor || !$revendedor->activo) {
                continue;
            }

            $porcentaje = $revendedor->porcentajeVigente();
            $montoBase = (float) $suscripcion->precio_final_mensual;
            $montoComision = round($montoBase * $porcentaje / 100, 2);

            Comision::create([
                'revendedor_id' => $revendedor->id,
                'suscripcion_id' => $suscripcion->id,
                'tipo' => 'mensual',
                'monto_base' => $montoBase,
                'porcentaje_aplicado' => $porcentaje,
                'monto_comision' => $montoComision,
                'mes' => $mes,
                'anio' => $anio,
                'estado' => 'pendiente',
            ]);

            $creadas++;
        }

        $this->info("Comisiones creadas: {$creadas}");
        $this->info("Omitidas (ya existían): {$omitidas}");

        return self::SUCCESS;
    }
}
