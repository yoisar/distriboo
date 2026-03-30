#!/bin/bash

# ============================================
# Script de Deploy Local - Distriboo
# Uso: ./scripts/deploy-local.sh [test|prod]
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar argumento
ENVIRONMENT=$1
if [[ ! "$ENVIRONMENT" =~ ^(test|prod)$ ]]; then
    echo "Uso: $0 [test|prod]"
    exit 1
fi

# Ir al directorio raíz del proyecto
cd "$(dirname "$0")/.."

# Configurar según entorno
if [ "$ENVIRONMENT" == "test" ]; then
    COMPOSE_FILE="docker-compose.test.yml"
    ENV_FILE=".env.test"
    DOMAIN="test.distriboo.yoisar.com"
    CONTAINER_PREFIX="distriboo_test"
else
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.production"
    DOMAIN="distriboo.yoisar.com"
    CONTAINER_PREFIX="distriboo_prod"
fi

log_info "Desplegando entorno: $ENVIRONMENT"
log_info "Dominio: $DOMAIN"

# Verificar archivos
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "No se encuentra $COMPOSE_FILE"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    log_error "No se encuentra $ENV_FILE - Copiá $ENV_FILE.example y configurá las variables"
    exit 1
fi

# Cargar variables de entorno
set -a
source "$ENV_FILE"
set +a

# Detener contenedores existentes
log_info "Deteniendo contenedores existentes..."
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true

# Construir imágenes
# El frontend se reconstruye SIEMPRE sin caché porque NEXT_PUBLIC_API_URL
# se hornea en el bundle durante npm run build (var de build-time, no runtime).
# Si se reutiliza la capa en caché puede quedar el valor vacío/incorrecto.
log_info "Construyendo frontend (sin caché para hornear NEXT_PUBLIC_API_URL)..."
docker compose -f "$COMPOSE_FILE" build --no-cache frontend

log_info "Construyendo backend y servicios..."
docker compose -f "$COMPOSE_FILE" build backend

log_info "Levantando contenedores..."
docker compose -f "$COMPOSE_FILE" up -d

# Esperar a que MySQL esté listo
log_info "Esperando a MySQL..."
sleep 10

# Ejecutar migraciones
log_info "Ejecutando migraciones..."
docker exec "${CONTAINER_PREFIX}_backend" php artisan migrate --force

if [ "$ENVIRONMENT" == "test" ]; then
    log_warn "Ejecutando seeders (entorno test)..."
    docker exec "${CONTAINER_PREFIX}_backend" php artisan db:seed --force
fi

# Limpiar caché
log_info "Optimizando caché..."
docker exec "${CONTAINER_PREFIX}_backend" php artisan config:cache
docker exec "${CONTAINER_PREFIX}_backend" php artisan route:cache
docker exec "${CONTAINER_PREFIX}_backend" php artisan view:cache

# Verificar estado
log_info "Estado de contenedores:"
docker ps --filter "name=${CONTAINER_PREFIX}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
log_info "Deploy completado exitosamente!"
log_info "Sitio disponible en: https://$DOMAIN"
