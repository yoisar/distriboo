# Instrucciones para GitHub Copilot - Distriboo

## 📋 ÍNDICE
1. [🎯 PROYECTO MVP](#-proyecto-mvp)
2. [🚨 REGLAS CRÍTICAS GIT](#-reglas-críticas-git)
3. [🏗️ ARQUITECTURA Y STACK](#️-arquitectura-y-stack)
4. [🐳 CONFIGURACIÓN DOCKER](#-configuración-docker)
5. [🔧 COMANDOS BACKEND](#-comandos-backend)
6. [🌐 FRONTEND NEXT.JS](#-frontend-nextjs)
7. [🗄️ BASE DE DATOS](#️-base-de-datos)
8. [🧮 REGLAS DE NEGOCIO](#-reglas-de-negocio)
9. [🔐 ACCESO VPS Y DEPLOYMENT](#-acceso-vps-y-deployment)
10. [🔗 ENDPOINTS API](#-endpoints-api)
11. [🚀 PROTOCOLO DE DEPLOYMENT](#-protocolo-de-deployment)

---

## 🎯 PROYECTO MVP

**Nombre**: Distriboo  
**Dominio**: distriboo.yoisar.com  
**Repo**: https://github.com/yoisar/distriboo  
**Descripción**: Plataforma B2B para distribuidores: pedidos, stock, clientes y logística por zona.

### 📦 Stack Técnico
```
frontend/         # Next.js + TypeScript + Tailwind (Tailwind Admin)
backend/          # Laravel 11 API REST
infra/            # Docker: MySQL, Nginx
scripts/          # Scripts de setup y deployment
docs/             # Documentación funcional y técnica
```

### 🎯 Objetivo del MVP
Permitir a clientes mayoristas realizar pedidos online visualizando stock actualizado, precios, costo logístico estimado y tiempo estimado de entrega según su provincia o zona.

### 👥 Roles
- **Administrador**: Gestiona productos, stock, clientes, zonas logísticas, pedidos
- **Cliente mayorista**: Realiza pedidos, ve catálogo, stock, precios, historial

---

## 🚨 REGLAS CRÍTICAS GIT

### ⚠️ ANTES DE CUALQUIER OPERACIÓN
```bash
git checkout develop
git status
```

### 🔴 PROHIBIDO EN `main`
- ❌ **NUNCA** commits directos en `main`
- ❌ **NUNCA** push a `main` sin autorización
- ✅ **SIEMPRE** trabajar en `develop`

### 🔄 FLUJO ESTÁNDAR
```bash
git checkout develop
git add .
git commit -m "🎯 Descripción del cambio"
git push origin develop

# Solo releases:
git checkout main
git merge develop
git push origin main
git checkout develop
```

---

## 🏗️ ARQUITECTURA Y STACK

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Template base**: Tailwind Admin (https://tailwind-admin.com/nextjs)

### Backend
- **Framework**: Laravel 11
- **Auth**: Laravel Sanctum
- **API**: REST
- **Validaciones**: Form Requests

### Base de datos
- **Motor**: MySQL 8
- **ORM**: Eloquent

### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Proxy**: Nginx
- **Entorno local**: docker-compose.yml
- **Entorno producción**: docker-compose.prod.yml

---

## 🐳 CONFIGURACIÓN DOCKER

### 📦 Contenedores Locales (prefijo: distriboo)
| Contenedor | Servicio | Puerto |
|------------|----------|--------|
| `distriboo_frontend` | Next.js | 3000 |
| `distriboo_backend` | Laravel (PHP-FPM) | 8000 |
| `distriboo_mysql` | MySQL 8 | 3306 |
| `distriboo_nginx` | Nginx | 80 |

### 🔧 Comandos Docker
```bash
# Levantar todo
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar todo
docker-compose down

# Reconstruir
docker-compose up -d --build

# Acceder a MySQL
docker exec -it distriboo_mysql mysql -u root -proot distriboo
```

### 📦 Contenedores Producción
| Contenedor | Servicio | Puerto |
|------------|----------|--------|
| `distriboo_frontend_prod` | Next.js | 3000 |
| `distriboo_backend_prod` | Laravel | 8000 |
| `distriboo_mysql_prod` | MySQL 8 | 3306 |
| `distriboo_nginx_prod` | Nginx | 80 |

---

## 🔧 COMANDOS BACKEND

### 📋 Migraciones
```bash
# Migración simple
docker exec distriboo_backend php artisan migrate

# Migración limpia (solo desarrollo)
docker exec distriboo_backend php artisan migrate:fresh --seed

# Estado de migraciones
docker exec distriboo_backend php artisan migrate:status
```

### 🔧 Comandos frecuentes
```bash
# Limpiar cache
docker exec distriboo_backend php artisan optimize:clear

# Ver logs
docker exec -it distriboo_backend tail -n 60 ./storage/logs/laravel.log

# Tinker
docker exec distriboo_backend php artisan tinker

# Tests
docker exec distriboo_backend php artisan test
```

### 🚨 REGLA PRODUCCIÓN
- **NUNCA** correr `migrate:fresh` en producción
- **NUNCA** correr seeders en producción
- Solo migraciones incrementales: `php artisan migrate`

---

## 🌐 FRONTEND NEXT.JS

### 📁 Estructura
```
frontend/src/
├── app/
│   ├── (auth)/           # Login
│   ├── dashboard/        # Panel principal
│   ├── productos/        # Catálogo
│   ├── pedidos/          # Pedidos
│   ├── clientes/         # ABM clientes (admin)
│   ├── zonas-logisticas/ # Config logística (admin)
│   └── page.tsx
├── components/
│   ├── ui/               # Componentes base
│   ├── layout/           # Header, Sidebar
│   ├── pedidos/          # Componentes pedidos
│   ├── productos/        # Componentes productos
│   └── clientes/         # Componentes clientes
├── lib/
│   ├── api.ts            # Cliente API
│   ├── auth.ts           # Lógica auth
│   └── utils.ts          # Utilidades
├── services/             # Servicios API
├── hooks/                # Custom hooks
├── store/                # Estado global
├── types/                # TypeScript types
└── middleware.ts         # Auth middleware
```

### 🛠️ Comandos
```bash
cd frontend && npm run dev    # Desarrollo
cd frontend && npm run build  # Build
```

---

## 🗄️ BASE DE DATOS

### Tablas principales
```sql
users           -- id, name, email, password, role, cliente_id
clientes        -- id, razon_social, email, telefono, provincia_id, direccion, activo
provincias      -- id, nombre
zonas_logisticas -- id, provincia_id, costo_base, costo_por_bulto, pedido_minimo, tiempo_entrega_dias, activo
productos       -- id, nombre, descripcion, marca, formato, precio, stock, activo
pedidos         -- id, cliente_id, subtotal, costo_logistico, total, estado, fecha_estimada_entrega
pedido_detalles -- id, pedido_id, producto_id, cantidad, precio_unitario, subtotal
```

### Estados de pedido
```
pendiente → confirmado → en_proceso → enviado → entregado
                                                    ↓
                                               cancelado
```

---

## 🧮 REGLAS DE NEGOCIO

### Cálculos
```
subtotal = Σ (cantidad × precio_unitario)
costo_logístico = costo_base + (total_bultos × costo_por_bulto)
total = subtotal + costo_logístico
fecha_estimada = fecha_pedido + tiempo_entrega_dias
```

### Reglas
- El stock se descuenta al confirmar pedido
- El costo logístico depende de la provincia del cliente
- Cada provincia puede tener pedido mínimo
- El sistema debe mostrar stock actualizado en tiempo real

---

## 🔐 ACCESO VPS Y DEPLOYMENT

### 🔑 Conexión SSH
```bash
ssh -i ~/.ssh/id_ed25519 -p 2223 root@92.112.178.62
```

### 📂 Directorio en VPS
```
/www/wwwroot/distriboo.yoisar.com
```

### 🌐 Dominios
| Entorno | URL | Directorio VPS |
|---------|-----|----------------|
| Producción | https://distriboo.yoisar.com | /www/wwwroot/distriboo.yoisar.com |
| API | https://distriboo.yoisar.com/api | /www/wwwroot/distriboo.yoisar.com |

### 🔧 Variables de Entorno Producción
```env
APP_NAME=Distriboo
APP_ENV=production
APP_DEBUG=false

DB_HOST=distriboo_mysql_prod
DB_DATABASE=distriboo
DB_USERNAME=distriboo_user
DB_PASSWORD=<CAMBIAR_EN_PRODUCCION>

FRONTEND_URL=https://distriboo.yoisar.com
BACKEND_URL=https://distriboo.yoisar.com/api
```

---

## 🔗 ENDPOINTS API

### Autenticación
```http
POST   /api/login              # Login
POST   /api/logout             # Logout
GET    /api/user               # Usuario autenticado
```

### Productos
```http
GET    /api/productos           # Listar productos
POST   /api/productos           # Crear producto (admin)
PUT    /api/productos/{id}      # Editar producto (admin)
DELETE /api/productos/{id}      # Eliminar producto (admin)
```

### Clientes
```http
GET    /api/clientes            # Listar clientes
POST   /api/clientes            # Crear cliente (admin)
PUT    /api/clientes/{id}       # Editar cliente (admin)
DELETE /api/clientes/{id}       # Eliminar cliente (admin)
```

### Provincias / Zonas Logísticas
```http
GET    /api/provincias          # Listar provincias
GET    /api/zonas-logisticas    # Listar zonas
POST   /api/zonas-logisticas    # Crear zona (admin)
PUT    /api/zonas-logisticas/{id}  # Editar zona (admin)
```

### Pedidos
```http
GET    /api/pedidos             # Listar pedidos
POST   /api/pedidos             # Crear pedido
GET    /api/pedidos/{id}        # Ver pedido
PUT    /api/pedidos/{id}/estado # Cambiar estado (admin)
```

### Reportes
```http
GET    /api/reportes/pedidos-por-provincia     # Pedidos por provincia
GET    /api/reportes/productos-mas-vendidos    # Top productos
GET    /api/reportes/clientes-top              # Top clientes
GET    /api/reportes/stock-bajo                # Alertas stock
```

---

## 🚀 PROTOCOLO DE DEPLOYMENT

### Flujo de deployment
```bash
# 1. Desde local - push a develop
git checkout develop
git add . && git commit -m "🎯 Cambio" && git push origin develop

# 2. Merge a main para release
git checkout main && git merge develop && git push origin main

# 3. En VPS
ssh -i ~/.ssh/id_ed25519 -p 2223 root@92.112.178.62
cd /www/wwwroot/distriboo.yoisar.com
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Post-deploy
docker exec distriboo_backend_prod php artisan migrate --force
docker exec distriboo_backend_prod php artisan optimize:clear

# 5. Volver a develop
git checkout develop
```

### 📊 CHECKLIST POST-DEPLOYMENT
- [ ] Contenedores UP
- [ ] Cache regenerado
- [ ] Frontend accesible
- [ ] API responde
- [ ] Login funcional
- [ ] Pedidos operativos

---

## ⚠️ REGLAS FINALES

### PROHIBICIONES
1. **NO** commits directos en `main`
2. **NO** seeders en producción
3. **NO** `migrate:fresh` en producción
4. **NO** exponer credenciales en código
5. **NO** features fuera del MVP sin autorización

### METODOLOGÍA
1. Trabajar en `develop`
2. Cambios incrementales
3. Validar con `get_errors` antes de commit
4. Documentar cambios significativos
5. Tests antes de merge a main

---

**CREADO**: 29 Marzo 2026  
**STACK**: Next.js + Laravel + MySQL + Docker  
**VPS**: 92.112.178.62:2223
