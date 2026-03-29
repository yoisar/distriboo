#!/bin/bash

# ============================================
# Limpieza de datos en producción
# Uso: ./scripts/clean-production.sh
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
log_warn "=== ADVERTENCIA ==="
log_warn "Este script ELIMINARÁ TODOS LOS DATOS de producción"
log_warn "excepto el Super Admin (sioy23@gmail.com) y las provincias"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'CONFIRMAR'): " confirm

if [ "$confirm" != "CONFIRMAR" ]; then
    log_info "Operación cancelada."
    exit 0
fi

log_info "Ejecutando limpieza de datos de producción..."

# Si estamos en el VPS, ejecutar directamente
if docker ps --filter "name=distriboo_prod_backend" --format '{{.Names}}' | grep -q distriboo_prod_backend; then
    docker exec distriboo_prod_backend php artisan data:clean-production --force
else
    log_error "El contenedor distriboo_prod_backend no está corriendo."
    log_error "¿Estás ejecutando esto en el VPS?"
    exit 1
fi

log_info "✅ Limpieza de producción completada!"
