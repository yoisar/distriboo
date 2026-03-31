<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS)
    |--------------------------------------------------------------------------
    |
    | Orígenes permitidos según entorno:
    |   Producción : https://distriboo.yoisar.com
    |   Testing    : http://test.distriboo.yoisar.com
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter([
        env('FRONTEND_URL'),
        env('APP_FRONTEND_URL'),
        env('FRONTEND_TEST_URL'),
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'https://distriboo.yoisar.com',
        'https://test.distriboo.yoisar.com',
    ]))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
