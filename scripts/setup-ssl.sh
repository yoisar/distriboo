#!/bin/bash

# ============================================
# Configurar SSL para todos los subdominios de distriboo
# Uso: ./scripts/setup-ssl.sh
# Requisito: certbot instalado y Nginx corriendo
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

DOMAINS=(
    "distriboo.yoisar.com"
    "api.distriboo.yoisar.com"
    "test.distriboo.yoisar.com"
    "test.api.distriboo.yoisar.com"
)

EMAIL="sioy23@gmail.com"

for DOMAIN in "${DOMAINS[@]}"; do
    echo -e "${GREEN}[SSL] Configurando certificado para $DOMAIN...${NC}"

    certbot certonly --nginx \
        -d "$DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL"

    echo -e "${GREEN}[SSL] ✅ Certificado emitido para $DOMAIN${NC}"
done

# Recargar Nginx
echo -e "${GREEN}[NGINX] Recargando configuración...${NC}"
nginx -s reload

echo -e "${GREEN}✅ SSL configurado para todos los subdominios.${NC}"
echo ""
echo "Subdominios protegidos:"
for DOMAIN in "${DOMAINS[@]}"; do
    echo "  https://$DOMAIN"
done
