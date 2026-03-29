# Distriboo

Plataforma B2B para distribuidores y mayoristas.

## Stack
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Laravel 11 API REST
- **Base de datos**: MySQL 8
- **Infraestructura**: Docker + Docker Compose

## Objetivo
Permitir a distribuidores gestionar:
- Productos y stock
- Clientes mayoristas
- Pedidos online
- Zonas logísticas y costos por provincia
- Tiempos estimados de entrega

## Estructura
```
frontend/   → Panel web en Next.js
backend/    → API REST en Laravel
infra/      → Configuración de infraestructura
docs/       → Documentación funcional y técnica
scripts/    → Scripts de setup y deployment
```

## Requisitos
- Docker + Docker Compose
- Node.js 18+ (desarrollo local)
- PHP 8.2+ (desarrollo local)
- Composer (desarrollo local)

## Inicio rápido
```bash
# Clonar
git clone https://github.com/yoisar/distriboo
cd distriboo

# Configurar
cp .env.example .env

# Levantar
docker-compose up -d --build

# Setup inicial (primera vez)
./scripts/first-setup.sh
```

## Accesos locales
| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| MySQL | localhost:3306 |
| phpMyAdmin | http://localhost:8080 |

## Producción
- **URL**: https://distriboo.yoisar.com
- **API**: https://distriboo.yoisar.com/api

## Licencia
Privado - YOIS
