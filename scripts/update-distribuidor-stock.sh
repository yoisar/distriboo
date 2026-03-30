#!/usr/bin/env bash

# ============================================
# update-distribuidor-stock.sh
#
# Actualiza el stock de todos los productos de un distribuidor,
# identificado por el email de su usuario.
#
# Uso:
#   ./scripts/update-distribuidor-stock.sh <email> <cantidad> <entorno>
#
# Entornos: local | testing | produccion
#
# Ejemplos:
#   ./scripts/update-distribuidor-stock.sh benlive@distriboo.com 100 testing
#   ./scripts/update-distribuidor-stock.sh dist@empresa.com 50 produccion
#   ./scripts/update-distribuidor-stock.sh dist@empresa.com 0 local
# ============================================

set -euo pipefail

# ── Colores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_step()  { echo -e "${BLUE}[···]${NC}   $1"; }

# ── Ayuda ─────────────────────────────────────────────────────────────────────
usage() {
    echo -e "${YELLOW}Uso:${NC} $0 <email_distribuidor> <cantidad_stock> <entorno>"
    echo ""
    echo "  email      Email del usuario con rol 'distribuidor'"
    echo "  cantidad   Stock a asignar a todos sus productos (entero ≥ 0)"
    echo "  entorno    local | testing | produccion"
    echo ""
    echo -e "${YELLOW}Ejemplo:${NC}"
    echo "  $0 benlive@distriboo.com 100 testing"
    echo "  $0 dist@empresa.com 0 produccion"
    echo ""
}

if [ $# -ne 3 ]; then
    usage
    exit 1
fi

EMAIL="$1"
CANTIDAD="$2"
ENTORNO="$3"

# ── Validaciones ──────────────────────────────────────────────────────────────
if ! echo "$EMAIL" | grep -qE '^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'; then
    log_error "Email inválido: '$EMAIL'"
    exit 1
fi

if ! [[ "$CANTIDAD" =~ ^[0-9]+$ ]]; then
    log_error "La cantidad debe ser un entero ≥ 0. Recibido: '$CANTIDAD'"
    exit 1
fi

if [[ ! "$ENTORNO" =~ ^(local|testing|produccion)$ ]]; then
    log_error "Entorno inválido: '$ENTORNO'. Válidos: local | testing | produccion"
    exit 1
fi

# ── Config según entorno ──────────────────────────────────────────────────────
case "$ENTORNO" in
    local)      CONTAINER="distriboo_backend";       IS_REMOTE=false ;;
    testing)    CONTAINER="distriboo_test_backend";   IS_REMOTE=true  ;;
    produccion) CONTAINER="distriboo_prod_backend";   IS_REMOTE=true  ;;
esac

VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-92.112.178.62}"
VPS_PORT="${VPS_PORT:-2223}"

# ── PHP a ejecutar vía tinker (heredoc quoted → sin expansión shell) ──────────
PHP_SCRIPT=$(cat << 'PHPEOF'
$email    = getenv('DIST_EMAIL');
$cantidad = (int) getenv('DIST_CANTIDAD');

$user = \App\Models\User::where('email', $email)
    ->where('role', 'distribuidor')
    ->first();

if (!$user) {
    echo 'DIST_ERROR:No existe usuario con rol "distribuidor" y email "' . $email . '"';
} elseif (!$user->distribuidor_id) {
    echo 'DIST_ERROR:El usuario "' . $email . '" no tiene distribuidor asociado';
} else {
    $total = \App\Models\Producto::where('distribuidor_id', $user->distribuidor_id)->count();
    if ($total === 0) {
        echo 'DIST_WARN:El distribuidor no tiene productos registrados';
    } else {
        \App\Models\Producto::where('distribuidor_id', $user->distribuidor_id)
            ->update(['stock' => $cantidad]);
        echo 'DIST_OK:' . $total . ' productos actualizados a stock ' . $cantidad;
    }
}
PHPEOF
)

# ── Resumen y confirmación ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}┌──────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│   ACTUALIZAR STOCK - DISTRIBUIDOR            │${NC}"
echo -e "${YELLOW}└──────────────────────────────────────────────┘${NC}"
echo ""
log_step "Distribuidor : $EMAIL"
log_step "Nuevo stock  : $CANTIDAD unidades (TODOS sus productos)"
log_step "Entorno      : $ENTORNO"
log_step "Contenedor   : $CONTAINER"
if [ "$IS_REMOTE" = true ]; then
    log_step "VPS          : $VPS_USER@$VPS_HOST:$VPS_PORT"
fi
echo ""
log_warn "Esta operación aplicará stock=$CANTIDAD a TODOS los productos del distribuidor."
echo ""
read -r -p "$(echo -e "${YELLOW}¿Confirmar? (s/n): ${NC}")" CONFIRM

if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    log_info "Operación cancelada."
    exit 0
fi

echo ""
log_step "Ejecutando..."

# ── Ejecución ─────────────────────────────────────────────────────────────────
if [ "$IS_REMOTE" = false ]; then
    # Verificar que el contenedor local esté corriendo
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        log_error "El contenedor '$CONTAINER' no está corriendo."
        log_error "Iniciá el entorno con: ./scripts/up.sh"
        exit 1
    fi
    RESULT=$(printf '%s\n' "$PHP_SCRIPT" | \
        docker exec -i \
            -e "DIST_EMAIL=$EMAIL" \
            -e "DIST_CANTIDAD=$CANTIDAD" \
            "$CONTAINER" \
            php artisan tinker 2>&1)
else
    RESULT=$(printf '%s\n' "$PHP_SCRIPT" | \
        ssh -p "$VPS_PORT" \
            -o StrictHostKeyChecking=no \
            -o BatchMode=yes \
            "$VPS_USER@$VPS_HOST" \
            "docker exec -i \
                -e 'DIST_EMAIL=$EMAIL' \
                -e 'DIST_CANTIDAD=$CANTIDAD' \
                '$CONTAINER' \
                php artisan tinker 2>&1")
fi

# ── Parsear resultado ─────────────────────────────────────────────────────────
OK_LINE=$(echo "$RESULT"   | grep "DIST_OK:"    || true)
WARN_LINE=$(echo "$RESULT" | grep "DIST_WARN:"  || true)
ERR_LINE=$(echo "$RESULT"  | grep "DIST_ERROR:" || true)

echo ""
if [ -n "$OK_LINE" ]; then
    MSG=$(echo "$OK_LINE" | sed 's/.*DIST_OK://')
    log_info "✅ $MSG"
    log_info "Distribuidor: $EMAIL | Entorno: $ENTORNO"
elif [ -n "$WARN_LINE" ]; then
    MSG=$(echo "$WARN_LINE" | sed 's/.*DIST_WARN://')
    log_warn "⚠️  $MSG"
elif [ -n "$ERR_LINE" ]; then
    MSG=$(echo "$ERR_LINE" | sed 's/.*DIST_ERROR://')
    log_error "❌ $MSG"
    exit 1
else
    log_error "❌ Respuesta inesperada del contenedor. Output completo:"
    echo "$RESULT"
    exit 1
fi
echo ""
