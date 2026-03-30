#!/bin/bash

# ============================================
# Script de Deploy Remoto - Distriboo
# Uso: ./scripts/deploy-remote.sh [test|prod]
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

ENVIRONMENT=$1
if [[ ! "$ENVIRONMENT" =~ ^(test|prod)$ ]]; then
    echo "Uso: $0 [test|prod]"
    exit 1
fi

# Configuración VPS
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-92.112.178.62}"
VPS_PORT="${VPS_PORT:-2223}"
REMOTE_DIR="/www/wwwroot/distriboo.yoisar.com"

# Determinar rama según entorno
if [ "$ENVIRONMENT" == "test" ]; then
    BRANCH="develop"
else
    BRANCH="main"
fi

log_info "Desplegando $ENVIRONMENT (rama: $BRANCH) en $VPS_HOST:$VPS_PORT..."

ssh -p $VPS_PORT -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << ENDSSH
    cd $REMOTE_DIR
    git fetch origin
    git checkout $BRANCH
    git reset --hard origin/$BRANCH
    ./scripts/deploy-local.sh $ENVIRONMENT
ENDSSH

log_info "Deploy remoto completado!"
