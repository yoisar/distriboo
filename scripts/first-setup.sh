#!/bin/bash
set -e

echo "=== Distriboo - First Setup ==="
echo ""

# Backend
echo ">> Configurando backend..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   .env creado desde .env.example"
fi
composer install --no-interaction
php artisan key:generate
echo "   Backend listo."
cd ..

# Frontend
echo ""
echo ">> Configurando frontend..."
cd frontend
# NOTA: No se crea .env.local en el frontend aquí.
# Las variables NEXT_PUBLIC_* se pasan como build args en docker-compose
# y se hornean en el bundle durante el build. Si existiera .env.local,
# podría colarse en la imagen Docker y pisar los build args.
npm install
echo "   Frontend listo."
cd ..

echo ""
echo ">> Levantando contenedores Docker..."
docker compose up -d --build

echo ""
echo ">> Esperando a MySQL..."
sleep 10

echo ">> Ejecutando migraciones y seeders..."
docker compose exec backend php artisan migrate --seed

echo ""
echo "=== Setup completo ==="
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  PHPMyAdmin: http://localhost:8080"
echo "  Admin: admin@distriboo.com / distriboo2026"
