#!/bin/bash

# ============================================
# Backup de base de datos de producción
# Ejecutar en el VPS: ./scripts/backup-production.sh
# ============================================

set -e

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/www/backups/distriboo/production"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar que el container MySQL de producción está corriendo
if ! docker ps --filter 'name=distriboo_prod_mysql' --filter 'status=running' --format '{{.Names}}' | grep -q 'distriboo_prod_mysql'; then
    log_warn "Container distriboo_prod_mysql no está corriendo. Omitiendo backup."
    exit 0
fi

mkdir -p "$BACKUP_DIR"

log_info "Realizando backup de producción..."

# Obtener password desde el .env.production si no está en el entorno
if [ -z "${PROD_DB_PASSWORD}" ]; then
    PROD_DB_PASSWORD=$(grep 'PROD_DB_PASSWORD' /www/wwwroot/distriboo.yoisar.com/.env.production 2>/dev/null | cut -d'=' -f2)
fi

# Backup de la base de datos a través del contenedor MySQL
docker exec distriboo_prod_mysql mysqldump \
    -u distriboo_prod_user \
    -p"${PROD_DB_PASSWORD}" \
    distriboo_prod > "${BACKUP_DIR}/backup_${DATE}.sql" 2>/dev/null

if [ $? -ne 0 ]; then
    log_error "Error al crear el backup"
    rm -f "${BACKUP_DIR}/backup_${DATE}.sql"
    exit 1
fi

# Comprimir
gzip "${BACKUP_DIR}/backup_${DATE}.sql"

# Eliminar backups antiguos (más de 30 días)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

log_info "✅ Backup guardado en: ${BACKUP_DIR}/backup_${DATE}.sql.gz"
