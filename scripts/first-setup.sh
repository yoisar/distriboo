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
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "   .env.local creado desde .env.example"
fi
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
