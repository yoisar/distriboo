<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Calcular comisiones el día 1 de cada mes a las 00:05
Schedule::command('comisiones:calcular')->monthlyOn(1, '00:05');
