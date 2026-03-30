#!/bin/bash

# ============================================
# Resetear entorno de testing con datos nuevos
# Ejecutar en el VPS: ./scripts/reset-testing.sh
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_warn "Esto ELIMINARÁ y RECREARÁ todos los datos de testing"
read -p "¿Continuar? (s/n): " confirm

if [ "$confirm" != "s" ]; then
    log_info "Operación cancelada."
    exit 0
fi

cd /www/wwwroot/test.distriboo.yoisar.com

# Detener contenedores
log_info "Deteniendo contenedores de testing..."
docker compose -f docker-compose.test.yml down

# Eliminar volumen de datos (reset completo)
log_info "Eliminando volumen de base de datos..."
docker volume rm distriboo_test_db_data 2>/dev/null || true

# Levantar contenedores
log_info "Levantando contenedores..."
docker compose -f docker-compose.test.yml up -d --build

# Esperar a que MySQL esté listo
log_info "Esperando a MySQL..."
until docker exec distriboo_test_mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
    sleep 2
done
log_info "MySQL listo."

# Ejecutar migraciones
log_info "Ejecutando migraciones..."
docker exec distriboo_test_backend php artisan migrate --force

# Cargar datos de prueba
log_info "Cargando datos de prueba (TestDataSeeder)..."
docker exec distriboo_test_backend php artisan db:seed --class=TestDataSeeder --force

log_info "✅ Testing reseteado correctamente!"
log_info "🌐 https://test.distriboo.yoisar.com"
