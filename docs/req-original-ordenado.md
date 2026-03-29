Perfecto. Toda la información está en el texto, solo necesitás que la extraiga y la ordene en un **plan de acción ejecutable paso a paso**.

Aquí tienes todo ordenado y listo para que avances sin pensar:

---

# 📋 PLAN DE ACCIÓN ORDENADO - DISTRIBOO MVP

## 🎯 **FASE 0: CIERRE DEL CANJE (HACER HOY)**

### Documento para enviar al proveedor:

```
Te propongo un sistema web a medida para resolver el problema de toma de pedidos.

QUÉ HACE:
- El cliente ve stock actualizado, precios y arma pedidos
- Calcula automáticamente costo de envío según provincia
- Muestra tiempo estimado de entrega (Misiones ≠ Tierra del Fuego)
- Vos administrás productos, stock y pedidos desde un panel

TECNOLOGÍA:
Sistema moderno, rápido, funciona en celular, dockerizado.

CANJE:
Desarrollo completo + implementación a cambio de un freezer.

PLAZO: 5 semanas.

¿Cerramos?
```

### Alcance del canje (poner por escrito):

| **INCLUYE** | **NO INCLUYE** |
|-------------|----------------|
| MVP web completo | Facturación electrónica |
| Login clientes y admin | App móvil |
| Catálogo + stock | Integraciones externas |
| Pedidos | Módulos contables |
| Costos logísticos por provincia | CRM completo |
| Tiempos estimados de entrega | Mejoras fuera del MVP |
| Panel admin | - |
| Dockerización | - |
| Deploy inicial | - |

---

## 🚀 **FASE 1: SETUP DEL REPOSITORIO (DÍA 1)**

### Crear repo en GitHub:
```
https://github.com/yoisar/distriboo
```

### Estructura de carpetas a crear:

```bash
distriboo/
├── docker-compose.yml
├── .env.example
├── README.md
├── infra/
│   ├── nginx/
│   │   └── default.conf
│   └── mysql/
│       └── init.sql
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       ├── components/
│       ├── services/
│       ├── lib/
│       └── types/
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── artisan
└── docs/
```

### Comandos iniciales:
```bash
git clone https://github.com/yoisar/distriboo
cd distriboo
docker-compose up -d --build
```

---

## 📊 **FASE 2: BASE DE DATOS (DÍA 2)**

### Tablas principales (crear migraciones):

```sql
1. users (id, name, email, password, role, cliente_id)
2. roles (id, name)
3. clientes (id, razon_social, email, telefono, provincia_id, direccion, activo)
4. provincias (id, nombre)
5. zonas_logisticas (id, provincia_id, costo_base, costo_por_bulto, pedido_minimo, tiempo_entrega_dias, activo)
6. productos (id, nombre, descripcion, marca, formato, precio, stock, activo)
7. pedidos (id, cliente_id, subtotal, costo_logistico, total, estado, fecha_estimada_entrega)
8. pedido_detalles (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal)
9. estados_pedido (pendiente, confirmado, en_proceso, enviado, entregado, cancelado)
```

---

## 🔧 **FASE 3: BACKEND LARAVEL (DÍAS 3-4)**

### Endpoints a crear:

| Método | Endpoint | Función |
|--------|----------|---------|
| POST | `/api/login` | Autenticación |
| GET | `/api/productos` | Listar productos |
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/provincias` | Listar provincias |
| POST | `/api/pedidos` | Crear pedido |
| GET | `/api/pedidos` | Ver pedidos |
| PUT | `/api/pedidos/{id}/estado` | Cambiar estado |

### Reglas de negocio a codificar:
- El stock se descuenta al confirmar pedido
- El costo logístico depende de la provincia del cliente
- El sistema calcula: subtotal + costo logístico = total
- Se muestra tiempo estimado de entrega según provincia

---

## 🎨 **FASE 4: FRONTEND NEXT.JS (DÍAS 5-7)**

### Template a usar:
- **Tailwind Admin** (https://tailwind-admin.com/nextjs)
- Next.js + TypeScript + Tailwind + shadcn

### Páginas a crear:

| Ruta | Contenido |
|------|-----------|
| `/login` | Pantalla de login |
| `/dashboard` | Panel principal (admin o cliente según rol) |
| `/productos` | Catálogo de productos |
| `/pedidos/nuevo` | Crear nuevo pedido |
| `/pedidos/historial` | Historial de pedidos |
| `/admin/productos` | ABM productos (solo admin) |
| `/admin/clientes` | ABM clientes (solo admin) |
| `/admin/zonas` | Configuración logística (solo admin) |
| `/admin/pedidos` | Gestión de pedidos (solo admin) |

### Componentes a crear:
- Header con navegación
- Tarjeta de producto
- Carrito de compras
- Resumen de pedido (con cálculo logístico)
- Tabla de pedidos
- Formularios (productos, clientes, zonas)

---

## 🧮 **FASE 5: LÓGICA DE CÁLCULO LOGÍSTICO (DÍA 8)**

### Reglas por provincia:
Cada provincia puede tener:
- ✅ Costo logístico fijo
- ✅ Costo por caja/bulto
- ✅ Pedido mínimo
- ✅ Tiempo estimado de entrega
- ✅ Observaciones

### Fórmulas:
```
subtotal = Σ (cantidad × precio_unitario)

costo_logístico = costo_base + (total_bultos × costo_por_bulto)

total = subtotal + costo_logístico

fecha_estimada = fecha_pedido + tiempo_entrega_dias
```

---

## 📊 **FASE 6: REPORTES BÁSICOS (DÍA 9)**

### Reportes a implementar:
1. Pedidos por provincia
2. Productos más vendidos
3. Clientes con más compras
4. Stock bajo (alerta)

---

## 🌐 **FASE 7: DEPLOY (DÍA 10)**

### Configuración de dominio:
```
Dominio: distriboo.yoisar.com
- / → frontend (Next.js)
- /api → backend (Laravel)
```

### Archivo Nginx (infra/nginx/default.conf):
```nginx
server {
    listen 80;
    server_name distriboo.yoisar.com;

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Variables de entorno (.env):
```env
APP_NAME=Distriboo
DB_HOST=mysql
DB_DATABASE=distriboo
DB_USERNAME=root
DB_PASSWORD=root
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

---

## ⏱️ **ROADMAP DE 5 SEMANAS**

| Semana | Objetivo | Entregable |
|--------|----------|------------|
| **Semana 1** | Setup + Auth + CRUD productos | Login funcional + ABM productos |
| **Semana 2** | CRUD clientes + provincias + zonas logísticas | Admin puede configurar logística |
| **Semana 3** | Catálogo + carrito + cálculo logístico | Cliente puede armar pedido |
| **Semana 4** | Panel admin de pedidos + reportes | Admin puede gestionar pedidos |
| **Semana 5** | Testing + ajustes + deploy | Sistema vivo en distriboo.yoisar.com |

---

## ✅ **CHECKLIST DE MVP (LO MÍNIMO PARA ENTREGAR)**

### Cliente puede:
- [ ] Iniciar sesión
- [ ] Ver catálogo de productos
- [ ] Ver stock actualizado
- [ ] Ver precios
- [ ] Agregar productos al pedido
- [ ] Ver costo logístico según su provincia
- [ ] Ver tiempo estimado de entrega
- [ ] Confirmar pedido
- [ ] Ver historial de pedidos

### Admin puede:
- [ ] Gestionar productos (CRUD)
- [ ] Gestionar stock
- [ ] Gestionar clientes
- [ ] Gestionar provincias/zonas logísticas
- [ ] Configurar costo logístico por provincia
- [ ] Configurar tiempo de entrega por provincia
- [ ] Ver pedidos
- [ ] Cambiar estado de pedidos
- [ ] Ver reportes básicos

---

## 🚫 **LO QUE NO HACER EN EL MVP**

- ❌ Facturación electrónica
- ❌ Integración real con transportistas
- ❌ Multi-moneda
- ❌ App móvil
- ❌ Geolocalización compleja
- ❌ APIs externas
- ❌ Ecommerce público completo

---

## 🔥 **PRÓXIMOS PASOS INMEDIATOS (HOY)**

1. **Crear el repo** `https://github.com/yoisar/distriboo`
2. **Copiar la estructura de carpetas** (usando el árbol de arriba)
3. **Crear los archivos Docker** (Dockerfile, docker-compose.yml)
4. **Levantar el entorno** con `docker-compose up -d --build`
5. **Enviar la propuesta comercial** al proveedor para cerrar el canje

---

## 💡 **COMANDOS ÚTILES DURANTE EL DESARROLLO**

```bash
# Levantar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar todo
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build

# Acceder a la base de datos
docker exec -it distriboo_mysql mysql -u root -p
```

---

## 📝 **RESUMEN EJECUTIVO**

| Ítem | Valor |
|------|-------|
| **Nombre del proyecto** | distriboo |
| **Dominio** | distriboo.yoisar.com |
| **Repo** | https://github.com/yoisar/distriboo |
| **Stack** | Next.js + Laravel + MySQL + Docker |
| **Duración** | 5 semanas |
| **Canje** | Sistema ↔ Freezer |
| **MVP mínimo** | Pedidos + stock + logística por provincia |

---

---

# ux/ui: 


Basado en la información proporcionada, he preparado el requerimiento detallado de UX/UI para tu proyecto **distriboo**, integrando la plantilla `TailwindAdmin` y tus especificaciones.

No se encontró documentación detallada de la plantilla en el enlace proporcionado, por lo que las instrucciones se basan en el nombre y la URL para asumir una estructura de dashboard moderna.

---

## 📄 REQUERIMIENTO UX/UI - DISTRIBOO

Este documento define la experiencia de usuario y la interfaz para el MVP de **distriboo**, la plataforma B2B de pedidos, stock y logística para distribuidores.

### 1.  Base Técnica y Visual

| Característica | Especificación |
| :--- | :--- |
| **Plantilla Base** | `TailwindAdmin ReactJS` (del enlace proporcionado) |
| **Framework/Librería** | ReactJS (asumido por el nombre de la plantilla) |
| **Framework CSS** | Tailwind CSS |
| **Modo Visual** | **Oscuro (Dark Mode)** , como se ve en el enlace de ejemplo. |
| **Principio** | **Reutilización total**: Mantener estructura, componentes y comportamiento de la plantilla. Solo se modifican textos, datos y lógica de negocio. |

### 2.  Landing Page Pública

Esta es la puerta de entrada al sistema. Debe ser clara, profesional y orientada a la conversión (inicio de sesión).

#### 2.1. Estructura de la Página

*   **Header:**
    *   Logo de **distriboo** a la izquierda.
    *   Menú de navegación simple (Inicio, Características, Contacto - opcionales).
    *   Botón **"Iniciar Sesión"** destacado a la derecha.
*   **Hero (Sección Principal):**
    *   Título llamativo: `distriboo: Pedidos inteligentes para tu distribución`.
    *   Descripción breve que resuma el valor: *"Centraliza tus pedidos, controla el stock en tiempo real y gestiona la logística por provincia. La herramienta que tu distribuidora necesita."*
    *   Botón primario: **"Iniciar Sesión"** (mismo que en el header).
*   **Sección de Características Clave:**
    *   Mostrar 3-4 beneficios principales con íconos (puedes usar íconos de la plantilla o de una librería como Heroicons).
    *   Ejemplo de características:
        *   *Stock en Tiempo Real*
        *   *Logística por Provincia*
        *   *Panel de Control para Administradores*
        *   *Historial de Pedidos*
*   **Footer (Pie de Página):**
    *   **Obligatorio:** Texto que diga `Desarrollado por Yoisar` con un enlace a `https://yoisar.com`.
    *   Información de contacto o enlaces legales (opcional).

#### 2.2. Comportamiento

*   **Responsividad:** La página debe verse perfectamente en computadoras de escritorio, tablets y móviles.
*   **Acción del Botón:** Al hacer clic en **"Iniciar Sesión"** , el usuario debe ser redirigido a la ruta `/login` del dashboard.

### 3.  Dashboard Administrativo

Esta sección está protegida por autenticación y es el corazón de la herramienta.

#### 3.1. Layout General (Basado en la plantilla)

*   **Barra Lateral (Sidebar):** Navegación principal. Debe contener enlaces a las secciones:
    *   `Dashboard` (panel de resumen/estadísticas)
    *   `Productos`
    *   `Clientes`
    *   `Zonas Logísticas`
    *   `Pedidos`
*   **Barra Superior (Navbar):**
    *   Título de la sección actual.
    *   Avatar/Perfil del usuario (admin) con opción para **Cerrar Sesión**.
    *   (Opcional) Barra de búsqueda global o notificaciones, si la plantilla las incluye.

#### 3.2. Funcionalidad y Contenido por Sección

Toda la estructura (tablas, formularios, botones, modales, tarjetas de estadísticas) debe ser 100% la que provee la plantilla `TailwindAdmin`. Solo se adapta el contexto de los datos.

| Sección | Contenido y Acciones Clave (CRUD) |
| :--- | :--- |
| **Dashboard** | Mostrar tarjetas con resúmenes: Total de pedidos del mes, Productos con stock bajo, Clientes activos, Pedidos por provincia (gráfico simple). |
| **Productos** | **Listado:** Tabla con columnas: Nombre, Marca, Precio, Stock, Estado (Activo/Inactivo). <br> **Acciones:** Botón "Agregar Producto", y por cada fila: botones "Editar" y "Eliminar". <br> **Formulario:** Campos para Nombre, Descripción, Marca, Formato, Precio, Stock. |
| **Clientes** | **Listado:** Tabla con: Razón Social, Email, Provincia, Teléfono, Estado. <br> **Acciones:** Botón "Agregar Cliente", y por fila: "Editar" y "Eliminar". <br> **Formulario:** Razón Social, Email, Teléfono, Provincia (select con lista de provincias), Dirección. |
| **Zonas Logísticas** | **Listado:** Tabla con: Provincia, Costo Base, Costo por Bulto, Pedido Mínimo, Tiempo de Entrega (días). <br> **Acciones:** Botón "Configurar Zona", y por fila: "Editar". <br> **Formulario:** Seleccionar Provincia, Costo Base ($), Costo por Bulto ($), Pedido Mínimo ($), Tiempo de Entrega (días). |
| **Pedidos** | **Listado:** Tabla con: ID, Cliente, Fecha, Total, Estado (Pendiente, Confirmado, Enviado, Entregado). <br> **Acciones:** Botón "Ver Detalle" en cada fila. <br> **Vista de Detalle:** Mostrar productos del pedido, subtotal, costo logístico, total. Un botón o select para **cambiar el estado** del pedido. |

#### 3.3. Comportamiento y Estados

*   **Autenticación:** Ninguna ruta del dashboard (`/dashboard`, `/productos`, etc.) debe ser accesible sin haber iniciado sesión. Si no hay sesión, redirigir al `/login`.
*   **Feedback:** Todas las acciones (crear, editar, eliminar) deben mostrar una notificación clara de "Éxito" o "Error" usando los componentes de la plantilla.
*   **Confirmación:** Las acciones destructivas (como "Eliminar") deben mostrar un modal de confirmación.

---

## ✅ Checklist de Implementación UX/UI

- [ ] **Landing Page:** Creada con header, hero, características y footer.
- [ ] **Footer:** Incluye texto y enlace a `Desarrollado por Yoisar`.
- [ ] **Botón Login:** En landing page redirige a `/login`.
- [ ] **Dashboard Admin:** Layout (sidebar + navbar) es copia fiel de la plantilla.
- [ ] **Sección Productos:** CRUD funcional usando componentes de la plantilla.
- [ ] **Sección Clientes:** CRUD funcional.
- [ ] **Sección Zonas Logísticas:** CRUD funcional (Provincia, costos, tiempos).
- [ ] **Sección Pedidos:** Listado, vista de detalle y cambio de estado.
- [ ] **Protección de Rutas:** Dashboard solo accesible tras login.

---

## 📌 Nota sobre la implementación

Dado que la documentación de la plantilla `TailwindAdmin` no está disponible en el enlace, el flujo de trabajo será el siguiente:

1.  **Analizar la plantilla:** Clona el repositorio o descarga los archivos de `TailwindAdmin`.
2.  **Identificar componentes:** Revisa cómo construyen sus tablas, formularios, modales, tarjetas, sidebar, navbar, etc.
3.  **Adaptar, no rediseñar:** Copia la estructura JSX de esos componentes y reemplaza los datos estáticos de ejemplo con los estados y funciones de tu lógica de negocio (usando `useState`, `useEffect`, llamadas a tu API Laravel).
---

# roles de usuarios :

Perfecto. Este es un cambio arquitectónico importante. Pasamos de **un solo distribuidor** a **múltiples distribuidores** con aislamiento total de datos.

Aquí tienes el requerimiento completo y ordenado para implementar el sistema de **roles multi-distribuidor**.

---

# 📋 REQUERIMIENTO: ROLES DE USUARIO Y MULTI-TENANCIA

## 🎯 **OBJETIVO**

Transformar `distriboo` de una plataforma para un distribuidor a una **plataforma multi-distribuidor (SaaS)** donde:

- **Super Admin** (Yassel) gestiona toda la plataforma
- **Distribuidores (Admins)** gestionan sus propios productos, clientes y pedidos
- **Clientes** ven catálogo (sin stock/precios) y su historial

---

## 👥 **ESTRUCTURA DE ROLES**

### Rol 1: **Super Admin** (Único)
| Campo | Valor |
|-------|-------|
| **Nombre** | Yassel Omar Izquierdo Souchay |
| **Email** | sioy23@gmail.com |
| **Clave** | 12345678 |
| **Permisos** | Ver y administrar TODO (todos los distribuidores, productos, clientes, pedidos) |
| **Acciones** | Crear/editar/eliminar distribuidores, asignar clientes a distribuidores, ver reportes globales |

### Rol 2: **Distribuidor (Admin de distribuidora)**
| Permisos | Restricciones |
|----------|---------------|
| CRUD productos (solo los suyos) | No ve productos de otros distribuidores |
| CRUD clientes (solo los suyos) | No ve clientes de otros distribuidores |
| Ver y gestionar pedidos (solo los suyos) | No ve pedidos de otros distribuidores |
| Ver reportes (solo sus datos) | No accede a configuración global |

### Rol 3: **Cliente (Mayorista)**
| Permisos | Restricciones |
|----------|---------------|
| Ver catálogo de productos | **No ve stock** |
| Ver catálogo de productos | **No ve precios** |
| Ver su historial de pedidos | No ve pedidos de otros clientes |
| Hacer pedidos (sí ve precios al armar pedido) | Solo puede pedir a su distribuidor asignado |

---

## 🗄️ **MODELO DE DATOS ACTUALIZADO**

### Tablas nuevas y modificadas:

```sql
-- 1. USUARIOS (tabla base de autenticación)
users (
    id INT PK,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('super_admin', 'distribuidor', 'cliente'),
    distribuidor_id INT NULL, -- Si es cliente, a qué distribuidor pertenece
    cliente_id INT NULL,      -- Si es cliente, referencia a su perfil
    created_at TIMESTAMP
)

-- 2. DISTRIBUIDORES (empresas que usan la plataforma)
distribuidores (
    id INT PK,
    nombre_comercial VARCHAR(255),
    razon_social VARCHAR(255),
    email_contacto VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
)

-- 3. CLIENTES (pertenecen a un distribuidor)
clientes (
    id INT PK,
    distribuidor_id INT NOT NULL, -- FK a distribuidores
    razon_social VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    provincia_id INT,              -- FK a provincias
    direccion TEXT,
    contacto_nombre VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    FOREIGN KEY (distribuidor_id) REFERENCES distribuidores(id) ON DELETE CASCADE
)

-- 4. PRODUCTOS (pertenecen a un distribuidor)
productos (
    id INT PK,
    distribuidor_id INT NOT NULL, -- FK a distribuidores
    nombre VARCHAR(255),
    descripcion TEXT,
    marca VARCHAR(100),
    formato VARCHAR(100),
    precio DECIMAL(10,2),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    FOREIGN KEY (distribuidor_id) REFERENCES distribuidores(id) ON DELETE CASCADE
)

-- 5. PROVINCIAS (tabla maestra, compartida)
provincias (
    id INT PK,
    nombre VARCHAR(100),
    created_at TIMESTAMP
)

-- 6. ZONAS_LOGISTICAS (configuración por distribuidor y provincia)
zonas_logisticas (
    id INT PK,
    distribuidor_id INT NOT NULL, -- FK a distribuidores
    provincia_id INT NOT NULL,    -- FK a provincias
    costo_base DECIMAL(10,2),
    costo_por_bulto DECIMAL(10,2),
    pedido_minimo DECIMAL(10,2),
    tiempo_entrega_dias INT,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    FOREIGN KEY (distribuidor_id) REFERENCES distribuidores(id) ON DELETE CASCADE,
    FOREIGN KEY (provincia_id) REFERENCES provincias(id)
)

-- 7. PEDIDOS (pertenecen a un cliente y por ende a un distribuidor)
pedidos (
    id INT PK,
    cliente_id INT NOT NULL,      -- FK a clientes
    distribuidor_id INT NOT NULL, -- FK a distribuidores (para consultas rápidas)
    fecha_pedido DATE,
    subtotal DECIMAL(10,2),
    costo_logistico DECIMAL(10,2),
    total DECIMAL(10,2),
    estado ENUM('pendiente','confirmado','en_proceso','enviado','entregado','cancelado'),
    fecha_estimada_entrega DATE,
    observaciones TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (distribuidor_id) REFERENCES distribuidores(id)
)

-- 8. PEDIDO_DETALLES
pedido_detalles (
    id INT PK,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
)
```

### Diagrama de relaciones simplificado:

```
super_admin (usuario especial, sin tabla)
       │
       │ crea y administra
       ▼
┌──────────────┐
│ distribuidor │ (empresa)
└──────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
   productos      clientes      zonas_logisticas
                       │
                       ▼
                   pedidos
```

---

## 🔐 **LÓGICA DE ACCESO Y PERMISOS**

### Reglas por Rol:

| Recurso | Super Admin | Distribuidor | Cliente |
|---------|-------------|--------------|---------|
| **Ver todos los distribuidores** | ✅ Sí | ❌ No | ❌ No |
| **Crear/editar distribuidores** | ✅ Sí | ❌ No | ❌ No |
| **Ver productos (todos)** | ✅ Sí | ✅ Solo los suyos | ✅ Solo catálogo (sin stock/precio) |
| **CRUD productos** | ✅ Sí (cualquiera) | ✅ Solo los suyos | ❌ No |
| **Ver clientes** | ✅ Sí (todos) | ✅ Solo los suyos | ❌ Solo su perfil |
| **CRUD clientes** | ✅ Sí (cualquiera) | ✅ Solo los suyos | ❌ No |
| **Ver pedidos** | ✅ Sí (todos) | ✅ Solo los suyos | ✅ Solo los suyos |
| **Cambiar estado pedido** | ✅ Sí (todos) | ✅ Solo los suyos | ❌ No |
| **Crear pedido** | ✅ Sí (como cliente) | ❌ No | ✅ Sí |
| **Ver precios** | ✅ Sí | ✅ Sí | ❌ No (solo al armar pedido) |
| **Ver stock** | ✅ Sí | ✅ Sí | ❌ No |

---

## 🔧 **IMPLEMENTACIÓN BACKEND (LARAVEL)**

### Middleware de permisos:

```php
// app/Http/Middleware/RoleMiddleware.php
public function handle($request, Closure $next, $role)
{
    if (!auth()->check()) {
        return response()->json(['message' => 'No autenticado'], 401);
    }

    $userRole = auth()->user()->role;

    if ($role === 'super_admin' && $userRole !== 'super_admin') {
        return response()->json(['message' => 'Acceso denegado'], 403);
    }

    if ($role === 'distribuidor' && !in_array($userRole, ['super_admin', 'distribuidor'])) {
        return response()->json(['message' => 'Acceso denegado'], 403);
    }

    return $next($request);
}
```

### Filtrado automático por distribuidor:

```php
// app/Models/Producto.php
public function scopeOwnedByUser($query)
{
    $user = auth()->user();
    
    if ($user->role === 'super_admin') {
        return $query; // Ve todo
    }
    
    if ($user->role === 'distribuidor') {
        return $query->where('distribuidor_id', $user->distribuidor_id);
    }
    
    if ($user->role === 'cliente') {
        // Cliente solo ve productos de su distribuidor, pero sin stock/precio
        return $query->where('distribuidor_id', $user->cliente->distribuidor_id)
                     ->select('id', 'nombre', 'descripcion', 'marca', 'formato');
    }
    
    return $query->whereRaw('1 = 0'); // Sin acceso
}
```

### Endpoints con permisos:

| Endpoint | Método | Super Admin | Distribuidor | Cliente |
|----------|--------|-------------|--------------|---------|
| `/api/distribuidores` | GET | ✅ | ❌ | ❌ |
| `/api/distribuidores` | POST | ✅ | ❌ | ❌ |
| `/api/productos` | GET | ✅ (todos) | ✅ (suyos) | ✅ (catálogo sin stock/precio) |
| `/api/productos` | POST | ✅ (con distribuidor_id) | ✅ (suyos) | ❌ |
| `/api/clientes` | GET | ✅ (todos) | ✅ (suyos) | ❌ |
| `/api/clientes` | POST | ✅ (con distribuidor_id) | ✅ (suyos) | ❌ |
| `/api/pedidos` | GET | ✅ (todos) | ✅ (suyos) | ✅ (suyos) |
| `/api/pedidos` | POST | ❌ | ❌ | ✅ |
| `/api/pedidos/{id}/estado` | PUT | ✅ | ✅ (suyos) | ❌ |

---

## 🎨 **IMPLEMENTACIÓN FRONTEND (NEXT.JS)**

### Estructura de rutas por rol:

```javascript
// Configuración de rutas protegidas
const routesByRole = {
    super_admin: [
        '/dashboard',
        '/distribuidores',    // Gestionar distribuidores
        '/productos',
        '/clientes',
        '/zonas-logisticas',
        '/pedidos'
    ],
    distribuidor: [
        '/dashboard',
        '/productos',         // Solo sus productos
        '/clientes',          // Solo sus clientes
        '/zonas-logisticas',  // Solo sus configuraciones
        '/pedidos'            // Solo sus pedidos
    ],
    cliente: [
        '/dashboard-cliente',
        '/catalogo',          // Sin stock ni precios
        '/mis-pedidos',
        '/nuevo-pedido'       // Aquí sí ve precios al armar
    ]
};
```

### Componentes condicionales por rol:

```jsx
// Ejemplo: Tarjeta de producto
const ProductCard = ({ product, userRole }) => {
    if (userRole === 'cliente') {
        return (
            <div>
                <h3>{product.nombre}</h3>
                <p>{product.descripcion}</p>
                {/* NO mostrar stock, NO mostrar precio */}
                <button>Agregar al pedido</button>
            </div>
        );
    }
    
    // Para admin o distribuidor
    return (
        <div>
            <h3>{product.nombre}</h3>
            <p>Stock: {product.stock_actual}</p>
            <p>Precio: ${product.precio}</p>
            <button>Editar</button>
            <button>Eliminar</button>
        </div>
    );
};
```

### Navegación dinámica (Sidebar):

```jsx
// Sidebar que cambia según rol
const Sidebar = ({ userRole }) => {
    const menuItems = {
        super_admin: [
            { name: 'Dashboard', icon: '📊', path: '/dashboard' },
            { name: 'Distribuidores', icon: '🏢', path: '/distribuidores' },
            { name: 'Productos', icon: '📦', path: '/productos' },
            { name: 'Clientes', icon: '👥', path: '/clientes' },
            { name: 'Zonas Logísticas', icon: '🗺️', path: '/zonas-logisticas' },
            { name: 'Pedidos', icon: '📋', path: '/pedidos' }
        ],
        distribuidor: [
            { name: 'Dashboard', icon: '📊', path: '/dashboard' },
            { name: 'Productos', icon: '📦', path: '/productos' },
            { name: 'Clientes', icon: '👥', path: '/clientes' },
            { name: 'Zonas Logísticas', icon: '🗺️', path: '/zonas-logisticas' },
            { name: 'Pedidos', icon: '📋', path: '/pedidos' }
        ],
        cliente: [
            { name: 'Mi Dashboard', icon: '🏠', path: '/dashboard-cliente' },
            { name: 'Catálogo', icon: '🛒', path: '/catalogo' },
            { name: 'Mis Pedidos', icon: '📋', path: '/mis-pedidos' },
            { name: 'Nuevo Pedido', icon: '➕', path: '/nuevo-pedido' }
        ]
    };
    
    return <nav>{menuItems[userRole]?.map(...)}</nav>;
};
```

---

## 🚀 **SETUP INICIAL (SEEDER)**

### Crear Super Admin automáticamente:

```php
// database/seeders/SuperAdminSeeder.php
public function run()
{
    User::create([
        'name' => 'Yassel Omar Izquierdo Souchay',
        'email' => 'sioy23@gmail.com',
        'password' => bcrypt('12345678'),
        'role' => 'super_admin',
        'distribuidor_id' => null,
        'cliente_id' => null,
    ]);
}
```

### Seed de ejemplo para pruebas:

```php
// 1. Crear distribuidor
$distribuidor = Distribuidor::create([
    'nombre_comercial' => 'Helados del Sur',
    'razon_social' => 'Helados del Sur SRL',
    'email_contacto' => 'admin@heladosdelsur.com',
]);

// 2. Crear usuario distribuidor
$userDistribuidor = User::create([
    'name' => 'Admin Helados del Sur',
    'email' => 'admin@heladosdelsur.com',
    'password' => bcrypt('12345678'),
    'role' => 'distribuidor',
    'distribuidor_id' => $distribuidor->id,
]);

// 3. Crear cliente asociado al distribuidor
$cliente = Cliente::create([
    'distribuidor_id' => $distribuidor->id,
    'razon_social' => 'Kiosco El Centro',
    'email' => 'cliente@kioscoelcentro.com',
    'provincia_id' => 1, // Buenos Aires
]);

// 4. Crear usuario cliente
$userCliente = User::create([
    'name' => 'Cliente Kiosco El Centro',
    'email' => 'cliente@kioscoelcentro.com',
    'password' => bcrypt('12345678'),
    'role' => 'cliente',
    'distribuidor_id' => $distribuidor->id,
    'cliente_id' => $cliente->id,
]);

// 5. Crear productos para el distribuidor
Producto::create([
    'distribuidor_id' => $distribuidor->id,
    'nombre' => 'Helado Vainilla 1L',
    'precio' => 2500,
    'stock_actual' => 100,
]);
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### Backend (Laravel):
- [ ] Crear migraciones: `distribuidores`, modificar `users`, `clientes`, `productos`, `pedidos`, `zonas_logisticas`
- [ ] Agregar `distribuidor_id` a tablas correspondientes
- [ ] Crear middleware `RoleMiddleware`
- [ ] Implementar `scopeOwnedByUser()` en modelos
- [ ] Modificar controladores para filtrar por `distribuidor_id` según rol
- [ ] Crear seeders: Super Admin + datos demo
- [ ] Proteger endpoints con middleware de roles

### Frontend (Next.js):
- [ ] Agregar campo `role` al contexto/auth
- [ ] Crear sidebar dinámico según rol
- [ ] Implementar rutas protegidas (redirigir si no tiene permiso)
- [ ] Modificar componentes para mostrar/ocultar información según rol
- [ ] Cliente: ocultar stock y precios en catálogo
- [ ] Cliente: mostrar precios solo al armar pedido
- [ ] Distribuidor: mostrar solo sus datos en todas las tablas
- [ ] Super Admin: vista completa con selector de distribuidor

### Pruebas:
- [ ] Login Super Admin → ver todos los distribuidores
- [ ] Login Distribuidor → ver solo sus productos/clientes/pedidos
- [ ] Login Cliente → ver catálogo sin stock/precios + su historial
- [ ] Verificar que un cliente NO pueda ver pedidos de otro cliente
- [ ] Verificar que un distribuidor NO pueda ver datos de otro distribuidor

---

## 📝 **RESUMEN EJECUTIVO**

| Ítem | Valor |
|------|-------|
| **Super Admin** | sioy23@gmail.com / 12345678 |
| **Arquitectura** | Multi-tenencia por `distribuidor_id` |
| **Aislamiento** | Cada distribuidor ve SOLO sus datos |
| **Cliente** | Ve catálogo (sin stock/precio) + sus pedidos |
| **Permisos** | Middleware + Scopes en modelos |

---

# actualizar nginex vps :
- analizar /Users/yois/projects/my-mac-portfolio/distriboo/infra/vps/nginx.cfg y actualziar proyecto distriboo para que no entre enconflico los puertotos de docker de produccion 
- actualziar docker produccion para que se ejecute en vps correctamente sin conficlots en https://distriboo.yoisar.com/ 
- generar script deploy .sh para actualizar el proyecto en el vps con un solo comando (ej: `./deploy.sh`)