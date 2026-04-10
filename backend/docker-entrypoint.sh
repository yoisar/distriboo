#!/bin/sh
set -e

# Instalar/actualizar dependencias siempre
echo "📦 Instalando dependencias de Composer..."
composer install --no-interaction --optimize-autoloader

# Generar key si no existe
php artisan key:generate --force 2>/dev/null || true

# Ejecutar migraciones
php artisan migrate --force 2>/dev/null || true

# Limpiar cache
php artisan optimize:clear 2>/dev/null || true

exec php artisan serve --host=0.0.0.0 --port=8000
