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
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

mkdir -p "$BACKUP_DIR"

log_info "Realizando backup de producción..."

# Backup de la base de datos a través del contenedor MySQL
docker exec distriboo_prod_mysql mysqldump \
    -u distriboo_prod_user \
    -p"${PROD_DB_PASSWORD}" \
    distriboo_prod > "${BACKUP_DIR}/backup_${DATE}.sql"

if [ $? -ne 0 ]; then
    log_error "Error al crear el backup"
    exit 1
fi

# Comprimir
gzip "${BACKUP_DIR}/backup_${DATE}.sql"

# Eliminar backups antiguos (más de 30 días)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

log_info "✅ Backup guardado en: ${BACKUP_DIR}/backup_${DATE}.sql.gz"
