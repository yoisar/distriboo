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

Necesito que me proporciones el contenido del archivo `/Users/yois/projects/my-mac-portfolio/distriboo/infra/vps/nginx.cfg` para poder analizarlo y crear una configuración que no entre en conflicto.

**Mientras tanto**, voy a generar el requerimiento completo basado en la estructura estándar que usaremos, y luego lo ajustaremos con tu archivo actual.

---

# 📋 REQUERIMIENTO: DEPLOY EN VPS - PRODUCCIÓN

## 🎯 **OBJETIVO**

Configurar el despliegue de **distriboo** en el VPS en `/www/wwwroot/distriboo.yoisar.com` sin conflictos de puertos con otros contenedores Docker, y con un script de deploy automático.

---

## 🏗️ **ARQUITECTURA DE PRODUCCIÓN**

### Estructura de directorios en VPS:
```
/www/wwwroot/distriboo.yoisar.com/
├── docker-compose.prod.yml
├── .env.production
├── frontend/
├── backend/
├── infra/
│   └── vps/
│       └── nginx.conf
└── scripts/
    ├── deploy.sh
    └── rollback.sh
```

### Puerto estándar para producción:

| Servicio | Puerto Desarrollo | Puerto Producción | Exposición |
|----------|------------------|-------------------|------------|
| Frontend (Next.js) | 3000 | **3001** | Interno (solo Nginx) |
| Backend (Laravel) | 8000 | **8001** | Interno (solo Nginx) |
| MySQL | 3306 | **3307** | Interno (solo backend) |
| Nginx (público) | 80 | **80/443** | Externo |

> **Nota:** Se cambian los puertos para evitar conflictos con otros proyectos en el mismo VPS.

---

## 🐳 **DOCKER COMPOSE DE PRODUCCIÓN**

### Archivo: `docker-compose.prod.yml`

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: distriboo_frontend_prod
    restart: always
    ports:
      - "127.0.0.1:3001:3000"  # Solo local, no expuesto directamente
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:8001/api
    networks:
      - distriboo_network
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: distriboo_backend_prod
    restart: always
    ports:
      - "127.0.0.1:8001:8000"  # Solo local, no expuesto directamente
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=distriboo_prod
      - DB_USERNAME=distriboo_user
      - DB_PASSWORD=${DB_PASSWORD}
    networks:
      - distriboo_network
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: distriboo_mysql_prod
    restart: always
    ports:
      - "127.0.0.1:3307:3306"  # Solo local
    environment:
      - MYSQL_DATABASE=distriboo_prod
      - MYSQL_USER=distriboo_user
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${ROOT_PASSWORD}
    volumes:
      - mysql_data_prod:/var/lib/mysql
    networks:
      - distriboo_network

networks:
  distriboo_network:
    driver: bridge

volumes:
  mysql_data_prod:
```

---

## 🌐 **NGINX CONFIGURACIÓN (VPS)**

### Archivo: `infra/vps/nginx.conf`

```nginx
# /etc/nginx/conf.d/distriboo.yoisar.com.conf
# O en el panel de tu VPS (Ej: aaPanel / CyberPanel)

server {
    listen 80;
    listen [::]:80;
    server_name distriboo.yoisar.com;

    # Redirigir HTTP a HTTPS (si tienes SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name distriboo.yoisar.com;

    # SSL Certificados (configurar según tu VPS)
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Logs
    access_log /var/log/nginx/distriboo_access.log;
    error_log /var/log/nginx/distriboo_error.log;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (Laravel)
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos (opcional)
    location /storage {
        alias /www/wwwroot/distriboo.yoisar.com/backend/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🚀 **SCRIPT DE DEPLOY AUTOMÁTICO**

### Archivo: `scripts/deploy.sh`

```bash
#!/bin/bash

# ============================================
# Script de Deploy - Distriboo
# Uso: ./deploy.sh [--rollback]
# ============================================

set -e  # Detener si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="/www/wwwroot/distriboo.yoisar.com"
BACKUP_DIR="/www/backups/distriboo"
DATE=$(date +"%Y%m%d_%H%M%S")

# Función para imprimir mensajes
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para hacer backup
backup_database() {
    log_info "Creando backup de la base de datos..."
    docker exec distriboo_mysql_prod mysqldump -u distriboo_user -p${DB_PASSWORD} distriboo_prod > ${BACKUP_DIR}/db_backup_${DATE}.sql
    log_info "Backup guardado en: ${BACKUP_DIR}/db_backup_${DATE}.sql"
}

# Función para hacer rollback
rollback() {
    log_warn "Iniciando rollback..."
    
    # Detener contenedores actuales
    cd ${PROJECT_DIR}
    docker-compose -f docker-compose.prod.yml down
    
    # Restaurar último backup
    LAST_BACKUP=$(ls -t ${BACKUP_DIR}/db_backup_*.sql | head -1)
    if [ -f "$LAST_BACKUP" ]; then
        log_info "Restaurando base de datos desde: $LAST_BACKUP"
        docker exec -i distriboo_mysql_prod mysql -u root -p${ROOT_PASSWORD} distriboo_prod < $LAST_BACKUP
    fi
    
    # Volver a versión anterior de código
    if [ -d "${BACKUP_DIR}/code_backup_${DATE}" ]; then
        log_info "Restaurando código desde backup..."
        cp -r ${BACKUP_DIR}/code_backup_${DATE}/* ${PROJECT_DIR}/
    fi
    
    # Levantar contenedores
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log_info "Rollback completado"
    exit 0
}

# Verificar argumentos
if [ "$1" == "--rollback" ]; then
    rollback
fi

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "El directorio $PROJECT_DIR no existe"
    exit 1
fi

cd $PROJECT_DIR

# Crear directorio de backups si no existe
mkdir -p ${BACKUP_DIR}

# 1. Backup de la base de datos actual
log_info "Paso 1/6: Haciendo backup de la base de datos..."
backup_database

# 2. Backup del código actual
log_info "Paso 2/6: Haciendo backup del código actual..."
BACKUP_CODE_DIR="${BACKUP_DIR}/code_backup_${DATE}"
mkdir -p ${BACKUP_CODE_DIR}
cp -r ${PROJECT_DIR}/backend ${BACKUP_CODE_DIR}/
cp -r ${PROJECT_DIR}/frontend ${BACKUP_CODE_DIR}/
cp ${PROJECT_DIR}/.env.production ${BACKUP_CODE_DIR}/
log_info "Backup de código guardado en: ${BACKUP_CODE_DIR}"

# 3. Pull del repositorio (asumiendo que es un repo git)
log_info "Paso 3/6: Actualizando código desde GitHub..."
git pull origin main

# 4. Actualizar dependencias
log_info "Paso 4/6: Actualizando dependencias..."

# Backend
docker run --rm -v ${PROJECT_DIR}/backend:/app composer:latest composer install --no-dev --optimize-autoloader

# Frontend
docker run --rm -v ${PROJECT_DIR}/frontend:/app node:18 npm install --production

# 5. Construir y levantar contenedores
log_info "Paso 5/6: Construyendo y levantando contenedores..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 6. Ejecutar migraciones
log_info "Paso 6/6: Ejecutando migraciones de base de datos..."
docker exec distriboo_backend_prod php artisan migrate --force

# 7. Limpiar caché de Laravel
log_info "Limpiando caché de Laravel..."
docker exec distriboo_backend_prod php artisan config:cache
docker exec distriboo_backend_prod php artisan route:cache
docker exec distriboo_backend_prod php artisan view:cache

# 8. Verificar estado
log_info "Verificando estado de los contenedores..."
docker ps --filter "name=distriboo"

log_info "✅ Deploy completado exitosamente!"
log_info "🌐 Sitio disponible en: https://distriboo.yoisar.com"

# Mostrar logs si hay error
if [ $? -ne 0 ]; then
    log_error "El deploy falló. Ejecutando rollback..."
    rollback
fi
```

### Archivo: `scripts/rollback.sh`

```bash
#!/bin/bash

# Script rápido para rollback
# Uso: ./rollback.sh

cd /www/wwwroot/distriboo.yoisar.com
./scripts/deploy.sh --rollback
```

---

## 🔧 **DOCKERFILE DE PRODUCCIÓN**

### Backend: `backend/Dockerfile.prod`

```dockerfile
FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias de Composer
RUN composer install --no-dev --optimize-autoloader

# Permisos
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### Frontend: `frontend/Dockerfile.prod`

```dockerfile
# Etapa 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 📁 **ESTRUCTURA FINAL EN VPS**

```bash
/www/wwwroot/distriboo.yoisar.com/
├── .env.production
├── docker-compose.prod.yml
├── frontend/
│   ├── Dockerfile.prod
│   ├── .env.production
│   └── ...
├── backend/
│   ├── Dockerfile.prod
│   ├── .env.production
│   └── ...
├── infra/
│   └── vps/
│       └── nginx.conf
├── scripts/
│   ├── deploy.sh
│   └── rollback.sh
└── storage/
    └── backups/ (creado automáticamente)
```

---

## ⚙️ **CONFIGURACIÓN DE .ENV PRODUCCIÓN**

### Archivo: `.env.production` (raíz del proyecto)

```env
# Docker
COMPOSE_PROJECT_NAME=distriboo_prod

# Base de datos
DB_PASSWORD=CambiarEstaClaveFuerte123!
ROOT_PASSWORD=CambiarRootPassword456!

# Backend (Laravel)
APP_NAME=Distriboo
APP_ENV=production
APP_DEBUG=false
APP_URL=https://distriboo.yoisar.com

DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=distriboo_prod
DB_USERNAME=distriboo_user

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=https://distriboo.yoisar.com/api
NEXT_PUBLIC_APP_NAME=Distriboo
```

---

## 🚀 **COMANDOS DE DEPLOY**

### Primer deploy (setup inicial):

```bash
# 1. Conectarse al VPS
ssh usuario@tu-vps

# 2. Ir al directorio
cd /www/wwwroot/distriboo.yoisar.com

# 3. Dar permisos a scripts
chmod +x scripts/*.sh

# 4. Ejecutar deploy
./scripts/deploy.sh
```

### Deploy normal (actualización):

```bash
# Desde tu máquina local
cd /Users/yois/projects/my-mac-portfolio/distriboo

# Subir cambios a GitHub
git add .
git commit -m "Actualización del sistema"
git push origin main

# En el VPS
ssh usuario@tu-vps "cd /www/wwwroot/distriboo.yoisar.com && ./scripts/deploy.sh"
```

### Rollback (si algo sale mal):

```bash
# En el VPS
cd /www/wwwroot/distriboo.yoisar.com
./scripts/rollback.sh
```

---

## 🔥 **SOLUCIÓN DE CONFLICTOS DE PUERTOS**

### Verificar qué puertos están en uso:

```bash
# Ver todos los contenedores Docker
docker ps

# Ver qué proceso usa el puerto 80
sudo lsof -i :80

# Ver qué proceso usa el puerto 443
sudo lsof -i :443
```

### Si hay conflicto con otro proyecto:

```bash
# Opción 1: Cambiar puertos en docker-compose.prod.yml
# Opción 2: Parar el otro proyecto temporalmente
docker stop otro_proyecto

# Opción 3: Usar Nginx como proxy inverso (recomendado)
# Configurar Nginx para redirigir según el dominio
```

### Configuración Nginx para múltiples dominios:

```nginx
# /etc/nginx/nginx.conf

# Proyecto 1: distriboo.yoisar.com
server {
    listen 80;
    server_name distriboo.yoisar.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
    }
    location /api {
        proxy_pass http://127.0.0.1:8001;
    }
}

# Proyecto 2: otro-dominio.com
server {
    listen 80;
    server_name otro-dominio.com;
    location / {
        proxy_pass http://127.0.0.1:3002;
    }
}
```

---

## ✅ **CHECKLIST DE CONFIGURACIÓN VPS**

### Antes del deploy:
- [ ] Verificar que Docker y Docker Compose están instalados
- [ ] Verificar que Git está instalado
- [ ] Configurar SSL (Let's Encrypt) para `distriboo.yoisar.com`
- [ ] Crear directorio `/www/wwwroot/distriboo.yoisar.com`
- [ ] Clonar repositorio en el VPS
- [ ] Configurar variables de entorno (`.env.production`)

### Durante el deploy:
- [ ] Ejecutar `./scripts/deploy.sh`
- [ ] Verificar que no hay errores
- [ ] Probar la URL `https://distriboo.yoisar.com`

### Post-deploy:
- [ ] Configurar backup automático (cron job)
- [ ] Configurar monitoreo (opcional)
- [ ] Configurar logs rotation

---

## 📝 **CRON JOB PARA BACKUPS AUTOMÁTICOS**

```bash
# Editar crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * cd /www/wwwroot/distriboo.yoisar.com && ./scripts/backup.sh

# Limpiar backups de más de 30 días
0 3 * * * find /www/backups/distriboo -name "*.sql" -mtime +30 -delete
```

---

## 🔥 **NECESITO TU ARCHIVO ACTUAL**

Para ajustar la configuración sin conflictos, **por favor comparte el contenido de**:

```
/Users/yois/projects/my-mac-portfolio/distriboo/infra/vps/nginx.cfg
```

Con ese archivo podré:
1. Analizar los puertos que ya están en uso
2. Identificar conflictos potenciales
3. Ajustar la configuración de producción
4. Crear un `nginx.conf` compatible

**Mientras tanto, puedes ir creando los archivos que te he proporcionado.** 🚀

--

# varios ajustes 
- no usar modo dark usar modo lihgt por defecto, y agregar un toggle para cambiar a modo dark (que se guarde en localStorage)
- agregar , paginado entodos los listaods, catalogo, propductos, pedidos, zonas, etc. -explorar todos los listados para aplciar paginado.
- usar componentes graficos de dashoard usados en https://tailwindadmin-reactjs-dark.netlify.app/
- actualizar landing pages usando esctructura similar a https://tailwindadmin-reactjs-dark.netlify.app/frontend-pages/homepage
- bajrar css y/o estilos apra que sean usados en el proyecto, y no usar CDN, para mejorar performance y evitar problemas de carga.
- agregar un favicon personalizado (puede ser el logo de distriboo o algo relacionado)
- agregar un loader/spinner para las páginas que hacen fetch de datos, para mejorar UX mientras se cargan los datos.
- revisar y mejorar la estructura de carpetas en el frontend para organizar mejor los componentes, páginas, estilos, etc. (ej: separar por módulos o funcionalidades)
- agregar validaciones en los formularios (ej: crear/editar producto, cliente, pedido) para evitar errores y mejorar la experiencia del usuario.
- agregar mensajes de éxito/error después de acciones como crear/editar producto, cliente, pedido, para dar feedback al usuario.
- no usar emojos en la interfaz, mantener un diseño profesional y limpio solo icono sde laplantilla
---

---

# 📋 REQUERIMIENTO: AJUSTES UX/UI Y OPTIMIZACIONES

## 🎯 **OBJETIVO**

Mejorar la experiencia de usuario, el rendimiento y la organización del código de **distriboo** con los siguientes ajustes.

---

## 🎨 **1. TEMA CLARO POR DEFECTO + TOGGLE DARK MODE**

### Especificación:

| Ítem | Valor |
|------|-------|
| **Tema por defecto** | Light mode (claro) |
| **Toggle** | Switch en el navbar (luna/sol) |
| **Persistencia** | Guardar preferencia en `localStorage` |
| **Comportamiento** | Al cargar la app, leer `localStorage` y aplicar el tema guardado |

### Implementación:

```jsx
// lib/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('distriboo-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('distriboo-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 📄 **2. PAGINADO EN TODOS LOS LISTADOS**

### Listados que requieren paginado:

| Sección | Elementos por página |
|---------|---------------------|
| Productos | 10, 25, 50 (selector) |
| Clientes | 10, 25, 50 |
| Pedidos | 10, 25, 50 |
| Zonas logísticas | 10, 25, 50 |
| Distribuidores | 10, 25, 50 |
| Catálogo (cliente) | 12 (grid) |

### Comportamiento:

```jsx
// Componente de paginado reutilizable
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* Selector de items por página */}
      <div className="flex items-center">
        <span className="mr-2 text-sm text-gray-700">Mostrar</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-md"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="ml-2 text-sm text-gray-700">entradas</span>
      </div>

      {/* Botones de navegación */}
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
```

### Backend (Laravel):

```php
// Controlador
public function index(Request $request)
{
    $perPage = $request->get('per_page', 10);
    $productos = Producto::ownedByUser()->paginate($perPage);
    
    return response()->json($productos);
}
```

---

## 📊 **3. COMPONENTES GRÁFICOS DEL DASHBOARD**

### Componentes a implementar (de la plantilla):

| Componente | Ubicación | Función |
|------------|-----------|---------|
| **StatsCard** | Dashboard | Tarjetas con métricas (pedidos, productos, clientes, stock bajo) |
| **LineChart** | Dashboard | Evolución de pedidos por mes |
| **BarChart** | Dashboard | Pedidos por provincia |
| **RecentOrdersTable** | Dashboard | Últimos 5 pedidos |
| **TopProducts** | Dashboard | Productos más vendidos |
| **ActivityTimeline** | Dashboard | Actividad reciente |

### Estructura de gráficos:

```jsx
// components/dashboard/StatsCard.jsx
const StatsCard = ({ title, value, icon, trend, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-green-600">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🏠 **4. LANDING PAGE ACTUALIZADA**

### Estructura similar a la homepage de TailwindAdmin:

```jsx
// app/page.tsx (landing page pública)
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header con navegación */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Testimonials (opcional) */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer con crédito Yoisar */}
      <Footer />
    </div>
  );
}
```

### Componentes de la landing:

```jsx
// Hero Section
const HeroSection = () => (
  <section className="py-20 px-4 text-center">
    <h1 className="text-5xl font-bold text-gray-900 mb-4">
      Distriboo: Pedidos inteligentes para tu distribución
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
      Centraliza tus pedidos, controla el stock en tiempo real 
      y gestiona la logística por provincia.
    </p>
    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      Iniciar Sesión
    </button>
  </section>
);
```

---

## 🎨 **5. CSS Y ESTILOS LOCALES**

### No usar CDN → archivos locales:

```bash
frontend/
├── styles/
│   ├── globals.css      # Estilos globales
│   ├── tailwind.css     # Tailwind imports
│   └── components.css   # Estilos específicos de componentes
```

### Configuración de Tailwind (local):

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // Usar clase 'dark' para modo oscuro
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos personalizados sin depender de CDN */
@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
  body.dark {
    @apply bg-gray-900 text-gray-100;
  }
}
```

---

## 🖼️ **6. FAVICON PERSONALIZADO**

### Estructura:

```bash
frontend/public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
└── site.webmanifest
```

### Implementación en `<head>`:

```jsx
// app/layout.tsx
export const metadata = {
  title: 'Distriboo - Plataforma de Distribución',
  description: 'Sistema de pedidos, stock y logística para distribuidores',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
};
```

---

## ⏳ **7. LOADER/SPINNER PARA FETCHES**

### Componente Spinner:

```jsx
// components/ui/Spinner.jsx
const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} border-4 border-${color}-200 border-t-${color}-600 rounded-full animate-spin`}
      />
    </div>
  );
};
```

### Uso con React Query:

```jsx
// Hook personalizado con loading state
const { data, isLoading, error } = useQuery('productos', fetchProductos);

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;

return <ProductList products={data} />;
```

### Spinner de página completa:

```jsx
// components/ui/PageLoader.jsx
const PageLoader = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
    </div>
  </div>
);
```

---

## 📁 **8. REESTRUCTURACIÓN DE CARPETAS**

### Nueva estructura optimizada:

```bash
frontend/src/
├── app/                          # App router (páginas)
│   ├── (auth)/                   # Rutas autenticadas
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── productos/
│   │   │   ├── clientes/
│   │   │   ├── pedidos/
│   │   │   └── zonas/
│   │   └── cliente/
│   │       ├── dashboard/
│   │       ├── catalogo/
│   │       ├── pedidos/
│   │       └── nuevo-pedido/
│   ├── (public)/                 # Rutas públicas
│   │   ├── login/
│   │   └── page.tsx              # Landing
│   └── layout.tsx
│
├── components/                   # Componentes reutilizables
│   ├── ui/                       # UI básicos
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── Pagination.jsx
│   │   └── Toast.jsx
│   ├── layout/                   # Layout components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   └── ThemeToggle.jsx
│   ├── dashboard/                # Dashboard específico
│   │   ├── StatsCard.jsx
│   │   ├── LineChart.jsx
│   │   ├── BarChart.jsx
│   │   └── RecentOrders.jsx
│   ├── productos/                # Módulo productos
│   │   ├── ProductList.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductForm.jsx
│   │   └── ProductFilters.jsx
│   ├── clientes/                 # Módulo clientes
│   │   ├── ClientList.jsx
│   │   ├── ClientForm.jsx
│   │   └── ClientFilters.jsx
│   ├── pedidos/                  # Módulo pedidos
│   │   ├── OrderList.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── OrderForm.jsx
│   │   └── OrderStatusBadge.jsx
│   └── zonas/                    # Módulo zonas logísticas
│       ├── ZoneList.jsx
│       └── ZoneForm.jsx
│
├── hooks/                        # Custom hooks
│   ├── useAuth.js
│   ├── useTheme.js
│   ├── usePagination.js
│   └── useFetch.js
│
├── services/                     # API calls
│   ├── api.js                    # Configuración base
│   ├── productos.js
│   ├── clientes.js
│   ├── pedidos.js
│   └── zonas.js
│
├── lib/                          # Utilidades
│   ├── ThemeContext.jsx
│   ├── AuthContext.jsx
│   └── validations.js            # Esquemas de validación
│
├── types/                        # TypeScript types
│   ├── product.types.ts
│   ├── client.types.ts
│   ├── order.types.ts
│   └── user.types.ts
│
├── styles/                       # Estilos
│   ├── globals.css
│   └── tailwind.css
│
└── middleware.ts                 # Protección de rutas
```

---

## ✅ **9. VALIDACIONES EN FORMULARIOS**

### Esquemas de validación (Zod):

```jsx
// lib/validations.js
import { z } from 'zod';

// Validación de producto
export const productSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  marca: z.string().min(2, 'La marca es requerida'),
  formato: z.string().min(1, 'El formato es requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
});

// Validación de cliente
export const clientSchema = z.object({
  razon_social: z.string().min(3, 'La razón social es requerida'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  provincia_id: z.number().positive('Seleccione una provincia'),
  direccion: z.string().min(5, 'La dirección es requerida'),
});

// Validación de zona logística
export const zoneSchema = z.object({
  provincia_id: z.number().positive('Seleccione una provincia'),
  costo_base: z.number().min(0, 'El costo base no puede ser negativo'),
  costo_por_bulto: z.number().min(0, 'El costo por bulto no puede ser negativo'),
  pedido_minimo: z.number().min(0, 'El pedido mínimo no puede ser negativo'),
  tiempo_entrega_dias: z.number().int().min(1, 'El tiempo debe ser al menos 1 día'),
});
```

### Formulario con validación:

```jsx
// components/productos/ProductForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validations';

const ProductForm = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          {...register('nombre')}
          className="w-full px-3 py-2 border rounded-lg"
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
        )}
      </div>
      {/* Más campos... */}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Guardar
      </button>
    </form>
  );
};
```

---

## 🔔 **10. MENSAJES DE ÉXITO/ERROR**

### Sistema de Toast/Notificaciones:

```jsx
// components/ui/Toast.jsx
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};
```

### Hook para notificaciones:

```jsx
// hooks/useToast.js
import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
};
```

### Uso en acciones:

```jsx
// Ejemplo: crear producto
const handleCreateProduct = async (data) => {
  try {
    await api.post('/productos', data);
    showToast('Producto creado exitosamente', 'success');
    router.refresh();
  } catch (error) {
    showToast(error.response?.data?.message || 'Error al crear producto', 'error');
  }
};
```

---

## 🚫 **11. SIN EMOJIS**

### Reemplazar emojis con íconos de la plantilla:

```jsx
// ❌ NO usar:
<button>📦 Productos</button>

// ✅ Usar íconos de la plantilla:
import { PackageIcon } from '@/components/icons';

<button>
  <PackageIcon className="w-5 h-5 mr-2" />
  Productos
</button>
```

### Íconos a usar (de Heroicons o Lucide):

```jsx
// components/icons/index.jsx
export const DashboardIcon = () => (...);
export const PackageIcon = () => (...);
export const UsersIcon = () => (...);
export const ShoppingCartIcon = () => (...);
export const MapIcon = () => (...);
export const SettingsIcon = () => (...);
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### Tema y estilos:
- [ ] Configurar tema claro por defecto
- [ ] Implementar toggle dark mode con localStorage
- [ ] Descargar CSS localmente (sin CDN)
- [ ] Agregar favicon personalizado

### Componentes y UX:
- [ ] Implementar paginado en todos los listados
- [ ] Crear componentes gráficos del dashboard (StatsCard, gráficos)
- [ ] Agregar loader/spinner para fetches
- [ ] Implementar mensajes de éxito/error (toast)

### Landing page:
- [ ] Actualizar landing con estructura de TailwindAdmin
- [ ] Mantener footer con crédito Yoisar

### Código y organización:
- [ ] Reestructurar carpetas del frontend
- [ ] Agregar validaciones en formularios (Zod)
- [ ] Reemplazar todos los emojis por íconos

---

## 📝 **RESUMEN EJECUTIVO**

| Ítem | Acción |
|------|--------|
| **Tema** | Light por defecto + toggle dark mode |
| **Paginado** | 10/25/50 items por página en todos los listados |
| **Gráficos** | StatsCard, LineChart, BarChart del dashboard |
| **Landing** | Similar a homepage de TailwindAdmin |
| **CSS** | Local (no CDN) |
| **Favicon** | Logo de distriboo |
| **Loader** | Spinner durante fetch de datos |
| **Estructura** | Modular por funcionalidades |
| **Validaciones** | Zod en formularios |
| **Feedback** | Toast de éxito/error |
| **Íconos** | Solo SVG, sin emojis |

---


# ajustes ux/ui - mobile first + deploy + testing: 

Perfecto. Aquí tienes el requerimiento completo y ordenado para las fases de **UX/UI Mobile First** y **Deploy + Testing**.

---

# 📋 REQUERIMIENTO: FASE 1 - UX/UI MOBILE FIRST

## 🎯 **OBJETIVO**

Garantizar que **todas** las pantallas de distriboo sean completamente funcionales y adaptadas a dispositivos móviles (smartphones y tablets).

---

## 📱 **1. PRINCIPIOS MOBILE FIRST APLICADOS**

### Estrategia general:

| Principio | Implementación |
|-----------|----------------|
| **Diseño fluido** | Usar `w-full`, `max-w-`, flexbox y grid responsivo |
| **Breakpoints** | `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px) |
| **Touch targets** | Botones mínimos de 44x44px para dedos |
| **Fuentes legibles** | Tamaño base 16px en móvil |
| **Espaciado** | Padding/ margins mayores en móvil (p-4 vs p-6 en desktop) |

### Clases Tailwind a usar:

```css
/* Móvil primero */
.contenedor {
  @apply w-full px-4 py-3;  /* Base móvil */
  @apply md:px-6 md:py-4;   /* Tablet */
  @apply lg:px-8 lg:py-6;   /* Desktop */
}

/* Grid responsivo */
.grid-lista {
  @apply grid grid-cols-1 gap-4;      /* Móvil: 1 columna */
  @apply sm:grid-cols-2;              /* Tablet pequeña: 2 */
  @apply md:grid-cols-3;              /* Tablet grande: 3 */
  @apply lg:grid-cols-4;              /* Desktop: 4 */
}

/* Tabla responsiva */
.tabla-responsive {
  @apply w-full overflow-x-auto;      /* Scroll horizontal en móvil */
  -webkit-overflow-scrolling: touch;
}
```

---

## 📊 **2. LISTADOS RESPONSIVOS (TABLAS)**

### Problema detectado:
Las tablas se cortan en móviles y no se pueden desplazar.

### Solución aplicada a:

| Sección | Archivo | Solución |
|---------|---------|----------|
| **Productos** | `ProductList.jsx` | Scroll horizontal + tarjetas en móvil |
| **Clientes** | `ClientList.jsx` | Scroll horizontal + tarjetas en móvil |
| **Pedidos** | `OrderList.jsx` | Scroll horizontal + tarjetas en móvil |
| **Zonas logísticas** | `ZoneList.jsx` | Scroll horizontal + tarjetas en móvil |
| **Distribuidores** | `DistribuidorList.jsx` | Scroll horizontal + tarjetas en móvil |

### Implementación estándar para tablas:

```jsx
// components/ui/ResponsiveTable.jsx
const ResponsiveTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="w-full">
      {/* Desktop: Tabla normal */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">
                    Editar
                  </button>
                  <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Tarjetas */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-500">{col.label}:</span>
                <span className="text-sm text-gray-900">{item[col.key]}</span>
              </div>
            ))}
            <div className="flex justify-end space-x-3 mt-3 pt-2">
              <button onClick={() => onEdit(item)} className="text-blue-600 text-sm font-medium">
                Editar
              </button>
              <button onClick={() => onDelete(item)} className="text-red-600 text-sm font-medium">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📝 **3. FORMULARIOS RESPONSIVOS**

### Problema detectado:
Los formularios no se adaptan bien en móviles (inputs muy anchos, botones pequeños).

### Solución:

```jsx
// components/ui/ResponsiveForm.jsx
const ResponsiveForm = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
        <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg">
          Guardar
        </button>
        <button type="button" className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg">
          Cancelar
        </button>
      </div>
    </form>
  );
};

// Campo de formulario responsivo
const FormField = ({ label, error, children }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="w-full">
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
```

### Grid responsivo para formularios:

```jsx
// Formulario con 2 columnas en desktop, 1 en móvil
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <FormField label="Nombre">
    <input className="w-full px-3 py-2 border rounded-lg" />
  </FormField>
  <FormField label="Email">
    <input className="w-full px-3 py-2 border rounded-lg" />
  </FormField>
</div>
```

---

## 📊 **4. DASHBOARD RESPONSIVO**

### Componentes a adaptar:

| Componente | Móvil | Tablet | Desktop |
|------------|-------|--------|---------|
| **StatsCard** | 1 columna, texto pequeño | 2 columnas | 4 columnas |
| **Gráficos** | 100% ancho, altura reducida | 100% ancho | 50% ancho |
| **Tablas recientes** | Scroll horizontal | Scroll horizontal | Normal |

### Implementación:

```jsx
// Dashboard principal
const Dashboard = () => {
  return (
    <div className="p-4 md:p-6">
      {/* Stats Cards - Grid responsivo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Pedidos hoy" value="24" />
        <StatsCard title="Productos" value="156" />
        <StatsCard title="Clientes" value="89" />
        <StatsCard title="Stock bajo" value="5" />
      </div>

      {/* Gráficos - Stack en móvil, grid en desktop */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <LineChart title="Pedidos por mes" />
        </div>
        <div className="w-full lg:w-1/2">
          <BarChart title="Pedidos por provincia" />
        </div>
      </div>

      {/* Tabla de pedidos recientes - Scroll horizontal en móvil */}
      <div className="mt-6 overflow-x-auto">
        <RecentOrdersTable />
      </div>
    </div>
  );
};
```

---

## 🏠 **5. LANDING PAGE RESPONSIVA**

### Estructura responsiva:

```jsx
// Landing page
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header responsivo */}
      <header className="px-4 py-3 md:px-8 md:py-4">
        <div className="flex justify-between items-center">
          <Logo className="h-8 md:h-10" />
          <button className="px-4 py-2 text-sm md:px-6 md:py-2 md:text-base bg-blue-600 text-white rounded-lg">
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 text-center md:py-20">
        <h1 className="text-3xl font-bold md:text-5xl">
          Distriboo: Pedidos inteligentes
        </h1>
        <p className="mt-4 text-base text-gray-600 max-w-md mx-auto md:text-lg md:max-w-2xl">
          Centraliza tus pedidos, controla el stock y gestiona la logística por provincia.
        </p>
      </section>

      {/* Features - Grid responsivo */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <FeatureCard icon={PackageIcon} title="Stock en tiempo real" />
          <FeatureCard icon={TruckIcon} title="Logística por provincia" />
          <FeatureCard icon={ChartIcon} title="Reportes y estadísticas" />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-sm text-gray-500 border-t">
        Desarrollado por{' '}
        <a href="https://yoisar.com" className="text-blue-600 hover:underline">
          Yoisar
        </a>
      </footer>
    </div>
  );
};
```

---

# 🚀 REQUERIMIENTO: FASE 2 - DEPLOY + TESTING

## 🎯 **OBJETIVO**

Configurar entorno de testing (`test.distriboo.yoisar.com`) y producción (`distriboo.yoisar.com`) sin conflictos en el mismo VPS.

---

## 🐳 **1. ESTRUCTURA DE CONTENEDORES**

### Puertos asignados:

| Entorno | Frontend | Backend | MySQL |
|---------|----------|---------|-------|
| **Testing** | 3002 | 8002 | 3308 |
| **Producción** | 3001 | 8001 | 3307 |

### Nombres de contenedores:

| Entorno | Frontend | Backend | MySQL |
|---------|----------|---------|-------|
| **Testing** | `distriboo_test_frontend` | `distriboo_test_backend` | `distriboo_test_mysql` |
| **Producción** | `distriboo_prod_frontend` | `distriboo_prod_backend` | `distriboo_prod_mysql` |

---

## 📁 **2. ARCHIVOS DE CONFIGURACIÓN**

### Docker Compose Testing: `docker-compose.test.yml`

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.test
    container_name: distriboo_test_frontend
    restart: always
    ports:
      - "127.0.0.1:3002:3000"
    environment:
      - NODE_ENV=test
      - NEXT_PUBLIC_API_URL=http://localhost:8002/api
    networks:
      - distriboo_test_network
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    container_name: distriboo_test_backend
    restart: always
    ports:
      - "127.0.0.1:8002:8000"
    environment:
      - APP_ENV=testing
      - APP_DEBUG=true
      - DB_HOST=mysql_test
      - DB_PORT=3306
      - DB_DATABASE=distriboo_test
      - DB_USERNAME=distriboo_test_user
      - DB_PASSWORD=${TEST_DB_PASSWORD}
    networks:
      - distriboo_test_network
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: distriboo_test_mysql
    restart: always
    ports:
      - "127.0.0.1:3308:3306"
    environment:
      - MYSQL_DATABASE=distriboo_test
      - MYSQL_USER=distriboo_test_user
      - MYSQL_PASSWORD=${TEST_DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${TEST_ROOT_PASSWORD}
    volumes:
      - mysql_test_data:/var/lib/mysql
    networks:
      - distriboo_test_network

networks:
  distriboo_test_network:
    driver: bridge

volumes:
  mysql_test_data:
```

### Docker Compose Producción: `docker-compose.prod.yml`

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: distriboo_prod_frontend
    restart: always
    ports:
      - "127.0.0.1:3001:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://distriboo.yoisar.com/api
    networks:
      - distriboo_prod_network
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: distriboo_prod_backend
    restart: always
    ports:
      - "127.0.0.1:8001:8000"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_HOST=mysql_prod
      - DB_PORT=3306
      - DB_DATABASE=distriboo_prod
      - DB_USERNAME=distriboo_prod_user
      - DB_PASSWORD=${PROD_DB_PASSWORD}
    networks:
      - distriboo_prod_network
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: distriboo_prod_mysql
    restart: always
    ports:
      - "127.0.0.1:3307:3306"
    environment:
      - MYSQL_DATABASE=distriboo_prod
      - MYSQL_USER=distriboo_prod_user
      - MYSQL_PASSWORD=${PROD_DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${PROD_ROOT_PASSWORD}
    volumes:
      - mysql_prod_data:/var/lib/mysql
    networks:
      - distriboo_prod_network

networks:
  distriboo_prod_network:
    driver: bridge

volumes:
  mysql_prod_data:
```

---

## 🌐 **3. CONFIGURACIÓN NGINX ACTUALIZADA**

### Archivo: `infra/vps/nginx.conf`

```nginx
# /etc/nginx/conf.d/distriboo.conf

# === TESTING ENVIRONMENT ===
server {
    listen 80;
    listen [::]:80;
    server_name test.distriboo.yoisar.com;

    # Logs
    access_log /var/log/nginx/distriboo_test_access.log;
    error_log /var/log/nginx/distriboo_test_error.log;

    # Frontend Testing
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Testing
    location /api {
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# === PRODUCTION ENVIRONMENT ===
server {
    listen 80;
    listen [::]:80;
    server_name distriboo.yoisar.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name distriboo.yoisar.com;

    # SSL Certificados (configurar según tu VPS)
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Logs
    access_log /var/log/nginx/distriboo_prod_access.log;
    error_log /var/log/nginx/distriboo_prod_error.log;

    # Frontend Producción
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Producción
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos
    location /storage {
        alias /www/wwwroot/distriboo.yoisar.com/backend/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🚀 **4. SCRIPT DE DEPLOY LOCAL**

### Archivo: `scripts/deploy-local.sh`

```bash
#!/bin/bash

# ============================================
# Script de Deploy Local - Distriboo
# Uso: ./deploy-local.sh [test|prod]
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar argumento
ENVIRONMENT=$1
if [[ ! "$ENVIRONMENT" =~ ^(test|prod)$ ]]; then
    echo "Uso: $0 [test|prod]"
    exit 1
fi

# Configurar archivos según entorno
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
    log_error "No se encuentra $ENV_FILE"
    exit 1
fi

# Cargar variables de entorno
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Detener contenedores existentes
log_info "Deteniendo contenedores existentes..."
docker-compose -f $COMPOSE_FILE down

# Construir y levantar
log_info "Construyendo imágenes..."
docker-compose -f $COMPOSE_FILE build --no-cache

log_info "Levantando contenedores..."
docker-compose -f $COMPOSE_FILE up -d

# Ejecutar migraciones
log_info "Ejecutando migraciones..."
if [ "$ENVIRONMENT" == "test" ]; then
    docker exec ${CONTAINER_PREFIX}_backend php artisan migrate --force
    docker exec ${CONTAINER_PREFIX}_backend php artisan db:seed --force
else
    docker exec ${CONTAINER_PREFIX}_backend php artisan migrate --force
fi

# Limpiar caché
log_info "Limpiando caché..."
docker exec ${CONTAINER_PREFIX}_backend php artisan config:cache
docker exec ${CONTAINER_PREFIX}_backend php artisan route:cache
docker exec ${CONTAINER_PREFIX}_backend php artisan view:cache

# Verificar estado
log_info "Verificando estado de contenedores..."
docker ps --filter "name=$CONTAINER_PREFIX"

log_info "✅ Deploy completado exitosamente!"
log_info "🌐 Sitio disponible en: http://$DOMAIN"

# Mostrar logs si hay error
if [ $? -ne 0 ]; then
    log_error "El deploy falló. Revisa los logs:"
    docker-compose -f $COMPOSE_FILE logs --tail=50
fi
```

### Script de deploy remoto VPS: `scripts/deploy-remote.sh`

```bash
#!/bin/bash

# ============================================
# Script de Deploy Remoto - Distriboo
# Uso: ./deploy-remote.sh [test|prod]
# ============================================

ENVIRONMENT=$1

if [[ ! "$ENVIRONMENT" =~ ^(test|prod)$ ]]; then
    echo "Uso: $0 [test|prod]"
    exit 1
fi

# Configuración VPS
VPS_USER="tu_usuario"
VPS_HOST="tu_vps_ip"

log_info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }

log_info "Conectando al VPS y desplegando $ENVIRONMENT..."

ssh $VPS_USER@$VPS_HOST << EOF
    cd /www/wwwroot/distriboo.yoisar.com
    git pull origin main
    ./scripts/deploy-local.sh $ENVIRONMENT
EOF

log_info "✅ Deploy remoto completado!"
```

---

## 📝 **5. ARCHIVOS .ENV**

### `.env.test` (Testing)

```env
# Testing Environment
APP_NAME=Distriboo-Test
APP_ENV=testing
APP_DEBUG=true

# Database Testing
TEST_DB_PASSWORD=TestPass123!
TEST_ROOT_PASSWORD=TestRoot456!

# Docker
COMPOSE_PROJECT_NAME=distriboo_test
```

### `.env.production` (Producción)

```env
# Production Environment
APP_NAME=Distriboo
APP_ENV=production
APP_DEBUG=false

# Database Production
PROD_DB_PASSWORD=ProdPass123!
PROD_ROOT_PASSWORD=ProdRoot456!

# Docker
COMPOSE_PROJECT_NAME=distriboo_prod
```

---

## 🐛 **6. CORRECCIÓN DE ERRORES EN CONSOLE.LOG**

### Puntos a revisar:

| Archivo | Posible error | Solución |
|---------|---------------|----------|
| `frontend/src/lib/api.js` | `fetch` sin manejo de error | Agregar try/catch |
| `frontend/src/hooks/useAuth.js` | Token expirado | Redirigir a login |
| `frontend/src/components/ui/Modal.jsx` | `setState` después de unmount | Usar ref para evitar |
| `backend/routes/api.php` | Rutas sin middleware auth | Agregar verificación |

### Ejemplo de corrección:

```jsx
// lib/api.js - Corrección de errores
const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### Testing (`test.distriboo.yoisar.com`):
- [ ] Docker compose testing levantado sin errores
- [ ] Puerto 3002 (frontend) funcionando
- [ ] Puerto 8002 (backend) funcionando
- [ ] Base de datos testing accesible
- [ ] Nginx redirige correctamente
- [ ] Todos los listados responsivos
- [ ] Todos los formularios responsivos
- [ ] Dashboard responsivo
- [ ] Landing page responsiva
- [ ] Sin errores en consola

### Producción (`distriboo.yoisar.com`):
- [ ] Docker compose producción levantado
- [ ] Puerto 3001 (frontend) funcionando
- [ ] Puerto 8001 (backend) funcionando
- [ ] Base de datos producción separada
- [ ] SSL configurado correctamente
- [ ] No hay conflictos con testing
- [ ] Performance optimizada

### Conflictos evitados:
- [ ] Testing y producción usan puertos diferentes
- [ ] Contenedores tienen nombres distintos
- [ ] Redes Docker separadas
- [ ] Volúmenes de BD separados
- [ ] Nginx distingue por dominio

---

## 📝 **RESUMEN EJECUTIVO**

| Entorno | URL | Frontend | Backend | MySQL |
|---------|-----|----------|---------|-------|
| **Testing** | test.distriboo.yoisar.com | 3002 | 8002 | 3308 |
| **Producción** | distriboo.yoisar.com | 3001 | 8001 | 3307 |

### Comandos útiles:

```bash
# Deploy local testing
./scripts/deploy-local.sh test

# Deploy local producción
./scripts/deploy-local.sh prod

# Deploy remoto testing
./scripts/deploy-remote.sh test

# Deploy remoto producción
./scripts/deploy-remote.sh prod

# Ver logs testing
docker-compose -f docker-compose.test.yml logs -f

# Ver logs producción
docker-compose -f docker-compose.prod.yml logs -f

# Detener testing
docker-compose -f docker-compose.test.yml down

# Detener producción
docker-compose -f docker-compose.prod.yml down
```

---

# gestión de datos de testing/producción y el flujo de despliegue con GitHub.

---

# 📋 REQUERIMIENTO: GESTIÓN DE DATOS Y FLUJO DE DEPLOY

## 🎯 **OBJETIVO**

Establecer un flujo limpio y profesional donde:
- **Producción** solo tenga datos reales (empezando con el Super Admin)
- **Testing** tenga datos de prueba para desarrollo
- **GitHub** maneje dos ramas separadas: `main` (producción) y `develop` (testing)

---

## 🗑️ **1. LIMPIEZA DE DATOS EN PRODUCCIÓN**

### Base de datos a limpiar: `distriboo_prod`

### Datos a eliminar (manteniendo estructura):

| Tabla | Acción | Excepción |
|-------|--------|-----------|
| `pedido_detalles` | Eliminar todos | - |
| `pedidos` | Eliminar todos | - |
| `productos` | Eliminar todos | - |
| `clientes` | Eliminar todos | - |
| `zonas_logisticas` | Eliminar todos | - |
| `distribuidores` | Eliminar todos | - |
| `users` | Eliminar todos excepto Super Admin | `sioy23@gmail.com` |
| `provincias` | **Mantener** (datos maestros) | Todas las provincias argentinas |

### Script de limpieza: `scripts/clean-production-data.php`

```php
<?php
// scripts/clean-production-data.php
// Ejecutar: php scripts/clean-production-data.php

use Illuminate\Database\Capsule\Manager as DB;

require_once __DIR__ . '/../backend/bootstrap.php';

echo "=== LIMPIEZA DE DATOS DE PRODUCCIÓN ===\n";

try {
    DB::beginTransaction();

    // 1. Limpiar detalles de pedidos
    echo "Eliminando pedido_detalles...\n";
    DB::table('pedido_detalles')->truncate();

    // 2. Limpiar pedidos
    echo "Eliminando pedidos...\n";
    DB::table('pedidos')->truncate();

    // 3. Limpiar productos
    echo "Eliminando productos...\n";
    DB::table('productos')->truncate();

    // 4. Limpiar clientes
    echo "Eliminando clientes...\n";
    DB::table('clientes')->truncate();

    // 5. Limpiar zonas logísticas
    echo "Eliminando zonas_logisticas...\n";
    DB::table('zonas_logisticas')->truncate();

    // 6. Limpiar distribuidores
    echo "Eliminando distribuidores...\n";
    DB::table('distribuidores')->truncate();

    // 7. Limpiar usuarios excepto Super Admin
    echo "Eliminando usuarios (excepto Super Admin)...\n";
    DB::table('users')
        ->where('email', '!=', 'sioy23@gmail.com')
        ->delete();

    // 8. Verificar que Super Admin existe
    $superAdmin = DB::table('users')
        ->where('email', 'sioy23@gmail.com')
        ->first();

    if (!$superAdmin) {
        echo "Creando Super Admin...\n";
        DB::table('users')->insert([
            'name' => 'Yassel Omar Izquierdo Souchay',
            'email' => 'sioy23@gmail.com',
            'password' => bcrypt('12345678'),
            'role' => 'super_admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    DB::commit();
    echo "✅ Limpieza completada exitosamente!\n";
    echo "✅ Solo queda el Super Admin: sioy23@gmail.com\n";

} catch (Exception $e) {
    DB::rollBack();
    echo "❌ Error durante la limpieza: " . $e->getMessage() . "\n";
    exit(1);
}
```

### Script de limpieza remota: `scripts/clean-production.sh`

```bash
#!/bin/bash

# ============================================
# Limpieza de datos en producción
# Uso: ./scripts/clean-production.sh
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
log_warn "=== ADVERTENCIA ==="
log_warn "Este script ELIMINARÁ TODOS LOS DATOS de producción"
log_warn "excepto el Super Admin (sioy23@gmail.com)"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'CONFIRMAR'): " confirm

if [ "$confirm" != "CONFIRMAR" ]; then
    log_info "Operación cancelada."
    exit 0
fi

log_info "Conectando al VPS y limpiando datos de producción..."

ssh user@your-vps-ip << 'EOF'
    cd /www/wwwroot/distriboo.yoisar.com
    
    # Ejecutar limpieza dentro del contenedor backend
    docker exec distriboo_prod_backend php scripts/clean-production-data.php
    
    echo "✅ Producción limpiada correctamente"
EOF

log_info "✅ Limpieza de producción completada!"
```

---

## 🧪 **2. DATOS DE PRUEBA PARA TESTING**

### Script de seed para testing: `database/seeders/TestDataSeeder.php`

```php
<?php
// database/seeders/TestDataSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run()
    {
        echo "=== CARGANDO DATOS DE PRUEBA ===\n";

        // 1. Limpiar datos existentes (excepto Super Admin)
        DB::table('pedido_detalles')->truncate();
        DB::table('pedidos')->truncate();
        DB::table('productos')->truncate();
        DB::table('clientes')->truncate();
        DB::table('zonas_logisticas')->truncate();
        DB::table('distribuidores')->truncate();
        DB::table('users')->where('email', '!=', 'sioy23@gmail.com')->delete();

        // 2. Crear distribuidores de prueba
        $distribuidores = [
            [
                'nombre_comercial' => 'Helados del Sur',
                'razon_social' => 'Helados del Sur SRL',
                'email_contacto' => 'admin@heladosdelsur.com',
                'telefono' => '011-4567-8901',
                'direccion' => 'Av. Corrientes 1234, CABA',
                'activo' => true,
            ],
            [
                'nombre_comercial' => 'Distribuidora Norte',
                'razon_social' => 'Norte Distribuciones SA',
                'email_contacto' => 'admin@distribuidoranorte.com',
                'telefono' => '0351-4567-8901',
                'direccion' => 'Av. Colon 567, Córdoba',
                'activo' => true,
            ],
        ];

        foreach ($distribuidores as $data) {
            $id = DB::table('distribuidores')->insertGetId($data);
            
            // Crear usuario distribuidor
            DB::table('users')->insert([
                'name' => $data['nombre_comercial'],
                'email' => $data['email_contacto'],
                'password' => Hash::make('12345678'),
                'role' => 'distribuidor',
                'distribuidor_id' => $id,
                'created_at' => now(),
            ]);
        }

        // 3. Crear provincias (si no existen)
        $provincias = [
            'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
            'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
            'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
            'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
            'Tierra del Fuego', 'Tucumán'
        ];

        foreach ($provincias as $provincia) {
            DB::table('provincias')->updateOrInsert(
                ['nombre' => $provincia],
                ['created_at' => now()]
            );
        }

        // 4. Crear clientes de prueba
        $clientes = [
            [
                'distribuidor_id' => 1,
                'razon_social' => 'Kiosco El Centro',
                'email' => 'cliente1@test.com',
                'telefono' => '011-5555-1234',
                'provincia_id' => 1, // Buenos Aires
                'direccion' => 'Av. Rivadavia 123',
                'activo' => true,
            ],
            [
                'distribuidor_id' => 1,
                'razon_social' => 'Supermercado La Familia',
                'email' => 'cliente2@test.com',
                'telefono' => '011-5555-5678',
                'provincia_id' => 2, // CABA
                'direccion' => 'Av. Santa Fe 456',
                'activo' => true,
            ],
            [
                'distribuidor_id' => 2,
                'razon_social' => 'Heladería Patagonia',
                'email' => 'cliente3@test.com',
                'telefono' => '0291-5555-9012',
                'provincia_id' => 5, // Chubut
                'direccion' => 'Av. Rawson 789',
                'activo' => true,
            ],
        ];

        foreach ($clientes as $data) {
            $id = DB::table('clientes')->insertGetId($data);
            
            // Crear usuario cliente
            DB::table('users')->insert([
                'name' => $data['razon_social'],
                'email' => $data['email'],
                'password' => Hash::make('12345678'),
                'role' => 'cliente',
                'distribuidor_id' => $data['distribuidor_id'],
                'cliente_id' => $id,
                'created_at' => now(),
            ]);
        }

        // 5. Crear productos de prueba
        $productos = [
            [
                'distribuidor_id' => 1,
                'nombre' => 'Helado Vainilla 1L',
                'descripcion' => 'Helado cremoso sabor vainilla',
                'marca' => 'Cremolatti',
                'formato' => '1 Litro',
                'precio' => 2500,
                'stock_actual' => 100,
                'stock_minimo' => 20,
                'activo' => true,
            ],
            [
                'distribuidor_id' => 1,
                'nombre' => 'Helado Chocolate 1L',
                'descripcion' => 'Helado intenso sabor chocolate',
                'marca' => 'Cremolatti',
                'formato' => '1 Litro',
                'precio' => 2600,
                'stock_actual' => 85,
                'stock_minimo' => 20,
                'activo' => true,
            ],
            [
                'distribuidor_id' => 1,
                'nombre' => 'Pote de Dulce de Leche 2L',
                'descripcion' => 'Helado de dulce de leche granizado',
                'marca' => 'Grido',
                'formato' => '2 Litros',
                'precio' => 4800,
                'stock_actual' => 50,
                'stock_minimo' => 15,
                'activo' => true,
            ],
            [
                'distribuidor_id' => 2,
                'nombre' => 'Bombón Suizo 1L',
                'descripcion' => 'Helado con trozos de bombón suizo',
                'marca' => 'Freddo',
                'formato' => '1 Litro',
                'precio' => 3200,
                'stock_actual' => 40,
                'stock_minimo' => 10,
                'activo' => true,
            ],
        ];

        foreach ($productos as $producto) {
            DB::table('productos')->insert($producto);
        }

        // 6. Crear zonas logísticas
        $zonas = [
            ['distribuidor_id' => 1, 'provincia_id' => 1, 'costo_base' => 1500, 'costo_por_bulto' => 200, 'pedido_minimo' => 5000, 'tiempo_entrega_dias' => 2],
            ['distribuidor_id' => 1, 'provincia_id' => 2, 'costo_base' => 1000, 'costo_por_bulto' => 150, 'pedido_minimo' => 4000, 'tiempo_entrega_dias' => 1],
            ['distribuidor_id' => 1, 'provincia_id' => 23, 'costo_base' => 5000, 'costo_por_bulto' => 500, 'pedido_minimo' => 10000, 'tiempo_entrega_dias' => 7],
            ['distribuidor_id' => 2, 'provincia_id' => 5, 'costo_base' => 3000, 'costo_por_bulto' => 300, 'pedido_minimo' => 8000, 'tiempo_entrega_dias' => 4],
        ];

        foreach ($zonas as $zona) {
            DB::table('zonas_logisticas')->insert($zona);
        }

        echo "✅ Datos de prueba cargados exitosamente!\n";
        echo "\n=== CREDENCIALES DE PRUEBA ===\n";
        echo "Super Admin: sioy23@gmail.com / 12345678\n";
        echo "Distribuidor 1: admin@heladosdelsur.com / 12345678\n";
        echo "Distribuidor 2: admin@distribuidoranorte.com / 12345678\n";
        echo "Cliente 1: cliente1@test.com / 12345678\n";
        echo "Cliente 2: cliente2@test.com / 12345678\n";
        echo "Cliente 3: cliente3@test.com / 12345678\n";
    }
}
```

---

## 🌿 **3. ESTRATEGIA DE RAMAS GITHUB**

### Estructura:

```
main (producción)
  └── develop (testing)
       ├── feature/nueva-funcionalidad
       └── bugfix/correccion
```

### Reglas:

| Rama | Entorno | Deploy automático | Quién puede mergear |
|------|---------|-------------------|---------------------|
| `main` | `distriboo.yoisar.com` | Manual | Solo después de testing |
| `develop` | `test.distriboo.yoisar.com` | Automático | Desarrolladores |
| `feature/*` | Local | No | Pull Request a develop |
| `bugfix/*` | Local | No | Pull Request a develop |

---

## 🚀 **4. WORKFLOWS DE GITHUB ACTIONS**

### Workflow Testing: `.github/workflows/deploy-test.yml`

```yaml
name: Deploy to Testing

on:
  push:
    branches:
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup SSH key
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}
      
      - name: Deploy to Testing Server
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'EOF'
            cd /www/wwwroot/distriboo.yoisar.com
            git checkout develop
            git pull origin develop
            
            # Cargar datos de prueba
            docker exec distriboo_test_backend php artisan db:seed --class=TestDataSeeder
            
            # Reiniciar contenedores
            docker-compose -f docker-compose.test.yml down
            docker-compose -f docker-compose.test.yml up -d --build
            
            # Ejecutar migraciones
            docker exec distriboo_test_backend php artisan migrate --force
          'EOF'
      
      - name: Notify deployment
        run: |
          echo "✅ Testing deployed to https://test.distriboo.yoisar.com"
```

### Workflow Producción: `.github/workflows/deploy-prod.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup SSH key
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}
      
      - name: Deploy to Production Server
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'EOF'
            cd /www/wwwroot/distriboo.yoisar.com
            git checkout main
            git pull origin main
            
            # Limpiar datos de prueba antes de deploy
            docker exec distriboo_prod_backend php scripts/clean-production-data.php
            
            # Reiniciar contenedores
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d --build
            
            # Ejecutar migraciones
            docker exec distriboo_prod_backend php artisan migrate --force
          'EOF'
      
      - name: Notify deployment
        run: |
          echo "✅ Production deployed to https://distriboo.yoisar.com"
```

---

## 🔧 **5. SCRIPTS DE UTILIDAD**

### Reset testing con datos frescos: `scripts/reset-testing.sh`

```bash
#!/bin/bash

# ============================================
# Resetear entorno de testing con datos nuevos
# Uso: ./scripts/reset-testing.sh
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

log_warn "Esto ELIMINARÁ y RECREARÁ todos los datos de testing"
read -p "¿Continuar? (s/n): " confirm

if [ "$confirm" != "s" ]; then
    log_info "Operación cancelada."
    exit 0
fi

cd /www/wwwroot/distriboo.yoisar.com

# Detener contenedores
log_info "Deteniendo contenedores de testing..."
docker-compose -f docker-compose.test.yml down

# Eliminar volúmenes (datos limpios)
log_info "Eliminando volúmenes de testing..."
docker volume rm distriboo_test_mysql_data || true

# Levantar contenedores
log_info "Levantando contenedores..."
docker-compose -f docker-compose.test.yml up -d --build

# Esperar a que MySQL esté listo
log_info "Esperando a MySQL..."
sleep 10

# Ejecutar migraciones
log_info "Ejecutando migraciones..."
docker exec distriboo_test_backend php artisan migrate --force

# Cargar datos de prueba
log_info "Cargando datos de prueba..."
docker exec distriboo_test_backend php artisan db:seed --class=TestDataSeeder

log_info "✅ Testing reset completado!"
log_info "🌐 https://test.distriboo.yoisar.com"
```

### Script de backup producción: `scripts/backup-production.sh`

```bash
#!/bin/bash

# ============================================
# Backup de base de datos de producción
# Uso: ./scripts/backup-production.sh
# ============================================

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/www/backups/distriboo/production"

mkdir -p $BACKUP_DIR

cd /www/wwwroot/distriboo.yoisar.com

# Backup de la base de datos
docker exec distriboo_prod_mysql mysqldump \
    -u distriboo_prod_user \
    -p${PROD_DB_PASSWORD} \
    distriboo_prod > ${BACKUP_DIR}/backup_${DATE}.sql

# Comprimir
gzip ${BACKUP_DIR}/backup_${DATE}.sql

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup guardado en: ${BACKUP_DIR}/backup_${DATE}.sql.gz"
```

---

## 📋 **6. CONFIGURACIÓN DE SECRETS EN GITHUB**

### Secrets necesarios:

| Secret | Valor | Dónde obtener |
|--------|-------|---------------|
| `VPS_HOST` | IP del VPS | Proveedor VPS |
| `VPS_USER` | Usuario SSH | Configuración VPS |
| `VPS_SSH_KEY` | Clave privada SSH | `~/.ssh/id_rsa` |

### Configurar en GitHub:
1. Ir a `Settings` → `Secrets and variables` → `Actions`
2. Agregar los 3 secrets arriba

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

### GitHub:
- [ ] Crear rama `develop` desde `main`
- [ ] Configurar protección de ramas (`main` requiere PR)
- [ ] Agregar secrets en GitHub Actions
- [ ] Subir workflows a `.github/workflows/`

### VPS - Testing:
- [ ] Configurar `docker-compose.test.yml`
- [ ] Crear `.env.test` con credenciales
- [ ] Ejecutar `./scripts/reset-testing.sh`
- [ ] Verificar `https://test.distriboo.yoisar.com`

### VPS - Producción:
- [ ] Configurar `docker-compose.prod.yml`
- [ ] Crear `.env.production` con credenciales
- [ ] Ejecutar limpieza inicial
- [ ] Verificar `https://distriboo.yoisar.com`

### Datos:
- [ ] Producción: solo Super Admin
- [ ] Testing: datos de prueba cargados
- [ ] Provincias: mantenidas en ambos

---

## 📝 **COMANDOS RÁPIDOS**

```bash
# Resetear testing (datos nuevos)
./scripts/reset-testing.sh

# Limpiar producción (solo Super Admin)
./scripts/clean-production.sh

# Backup producción
./scripts/backup-production.sh

# Deploy manual testing
git checkout develop
git push origin develop
# (GitHub Actions ejecuta automáticamente)

# Deploy manual producción
git checkout main
git merge develop
git push origin main
```

---

## 🔥 **FLUJO DE TRABAJO RECOMENDADO**

```mermaid
git checkout -b feature/nueva-funcionalidad
# ... desarrollar ...
git push origin feature/nueva-funcionalidad
# Crear Pull Request a develop
# GitHub Actions → deploy automático a testing
# Probar en https://test.distriboo.yoisar.com
# Crear Pull Request a main
# GitHub Actions → deploy manual a producción
```

---

# test https://test.distriboo.yoisar.com/:
- validar revisar https://test.distriboo.yoisar.com/
- corregir revisar condig /Users/yois/projects/my-mac-portfolio/distriboo/infra/vps/nginx.cfg - para qeu apunte bien a los puertos correspondientes a testing y producción.
- corregir revisar contenedores y nginx para evitar conflictos entre testing y producción, asegurando que cada entorno tenga su propia configuración de puertos, redes y volúmenes.

## 🧪 Usuario de prueba para Testing
- Crear usuario distribuidor de prueba en el entorno de testing:
  - Nombre: `T.G Helados Proteicos` (o el nombre que indique el cliente).
  - Email: `benlive@distriboo.com` (o `benlive@distriboo.com`).
  - Password: `testing1234` (generar y guardar en el seed/DB testing).
  - Rol: `distribuidor`.
  - Empresa/Marca: `BENLIVE`.

- Crear cliente genérico asociado al distribuidor de prueba:
  - Nombre: `Cliente genérico`.
  - Email: `cliente.benlive@distriboo.com`.
  - Password: `testing1234`.
  - Rol: `cliente`.
  - Asociado a distribuidor: `T.G Helados Proteicos`.

- Verificar en el UI de testing:
  - Login con distribuidor: `benlive@distriboo.com` / `testing1234`.
  - Login con cliente: `cliente.benlive@distriboo.com` / `testing1234`.
  - El cliente ve catálogo (sin stock/precio) y puede crear pedidos.
  - El distribuidor ve sus productos, clientes y pedidos.

---

## 💬 Mensaje WhatsApp para el distribuidor

```
Hola! 👋

Ya te dejé el sistema listo para que lo puedas probar.

🌐 Accedé desde acá:
https://test.distriboo.yoisar.com/login

---

🔐 Tu acceso como DISTRIBUIDOR:
📧 Usuario: benlive@distriboo.com
🔑 Contraseña: testing1234

👤 Acceso de CLIENTE de prueba (para ver cómo lo ve tu cliente):
📧 Usuario: cliente.benlive@distriboo.com
🔑 Contraseña: testing1234

---

Con el acceso de distribuidor vas a poder ver tus productos, clientes y pedidos.
Con el de cliente podés ver cómo se ve el catálogo y armar un pedido de prueba.

Cualquier cosa que quieras cambiar, ajustar o que no te convenza, me avisás y lo resolvemos. 🙌
```

---
# critico:
https://distriboo.yoisar.com/ desactualizado la version mas actualiada es https://test.distriboo.yoisar.com/
- reconstriuor contenedor produccion con la version actualizada del codigo, para que el cliente pueda ver la version mas actualizada en produccion y no haya confusiones.
# critico - gestion de usuarios:
- los usuarios con rol de distirbuidor y cliente no pueden ver ni modificar usuarios de roles super usuarios. 

# errores varios:
- revisar y corregir erroes que aparecen en file #console.log. 

# nueos feuatures:
- permitir cargar, productos, stock, zonas, desde file csv o excel, para facilitar la carga masiva de productos y zonas logísticas.
- permitr descarga de modelo de importacion en csv o excel, para que el cliente pueda cargar los datos con el formato correcto.
- importacion/exportacon de:
- productos
- clientes
- zonas logísticas


-- 
# agregar paginados en todos los listados para mejorar la experiencia de usuario y rendimiento, especialmente en:
- catalogo
- Mis Pedidos
- productos
- clientes
- zonas logísticas
- gestion de pedidos
- usuarios
aplicar paginaod en todos las listas para mejorar la experiencia de usuario y rendimiento.

# errores en /admin/reportes:
- corregir errores que aparecen en consola al acceder a la sección de reportes en el dashboard de administración, para asegurar que los gráficos y datos se muestren correctamente sin afectar la experiencia del usuario.

# validar y testear funcionalidades:

Caso:
Existen funcionaidades y botones que no ejecutan la accion : ejeplo crear pedido: 

- validar funcionalidad de crear pedidos
- validar funcionalidad de editar pedidos
- validar funcionalidad de eliminar pedidos
- validar funcionalidad de ver detalles de pedidos
- validar funcionalidad de crear productos
- validar funcionalidad de editar productos

# generacion de pedidos de parte de un cliente /pedidos/nuevo:
 - no se puede agregar nada de parte de un cleinte
 - no exieten accion para crear pedidos, agregar productos al pedido, eliminar productos del pedido, editar cantidades, etc. 
 - validar y corregir la funcionalidad de creación de pedidos por parte de un cliente, asegurando que el cliente pueda agregar productos al pedido, editar cantidades, eliminar productos, y finalmente enviar el pedido para su procesamiento por parte del distribuidor.

# mejorar usabiliad y generacion de pedidos /pedidos/nuevo:
- debe ser mas agil y practica la seleccond de prducto dspara el pediodactualmente es incomodo e ineficiente la selecion de productos para armar un pedido, mejorar la interfaz y experiencia de usuario en la sección de creación de pedidos para que sea más ágil, práctica e intuitiva, permitiendo al cliente seleccionar productos, editar cantidades y gestionar su pedido de manera eficiente.
- modificar o mejorar la interfaz de creación de pedidos para que el cliente pueda buscar productos por nombre, filtrar por categoría o marca, y agregar productos al pedido con un solo clic, además de permitir editar cantidades y eliminar productos del pedido de manera sencilla.

# errores:
- /admin/zonas: Request URL:
http://localhost:8000/api/zonas-logisticas
en formulario Nueva Zona Logística

Failed to fetch
----
# Revisiones QA:  
---
## admin/usuarios:
- agregar buscador y paginado en admin/usuarios para facilitar la gestión de usuarios, especialmente cuando hay muchos usuarios registrados, permitiendo buscar por nombre, email o rol, y navegar fácilmente entre las páginas de usuarios.
- permiter email en misma linea de listado sin necesidad de abrir cada usuario para ver su email, para facilitar la identificación de usuarios en la lista, mostrar el email junto al nombre y rol en el listado de usuarios en la sección de administración.

## admin/cliente:
- un mismo usuario puede ser le mismo para varios distribuidores - ejemplo - cliente que compra a varios proveedores - permitir que un mismo usuario cliente pueda estar asociado a varios distribuidores, para reflejar la realidad de clientes que compran a diferentes proveedores, y permitir gestionar sus pedidos y relaciones comerciales desde una sola cuenta de cliente.
- corregir logica crud de admin/cliente y  admin/usuarios para permitir que un mismo usuario cliente pueda estar asociado a varios distribuidores, asegurando que la gestión de usuarios y clientes en el panel de administración refleje esta posibilidad sin generar conflictos o errores en la base de datos.

## corregir relaciones :
- resolver error: Tu usuario no tiene un cliente asociado. Contactá al administrador.:
- Caso : 18
yois
sioy_23@gmail.com
cliente 

- es un usuario asociado con un cliente IZQUIERDO SOUCHAY YASSEL OMAR - 
- agregar funcionalidad en formulario Nuevo Cliente - al escribir razon social se debe buscar en sistema existencia de cliente con esa razon social, si existe mostrar mensaje "Ya existe un cliente con esa razón social, traer datos sin preguntar, todos, desde raxon social hasta el cuit.

# api testing vps incorrecto - critico:
- la url de api http://localhost:8000/api/ en https://test.distriboo.yoisar.com/ no es correcta, corregir la url de la api en el entorno de testing para que apunte a la dirección correcta del backend en el VPS, asegurando que las solicitudes API se realicen correctamente y los datos se muestren en el frontend sin errores.

# ajustes busqueda de cliente http://localhost:8000/api/clientes en formulairo Nuevo Cliente:
- debe mostrar lista de coicidencias en componente de edicion 
- la busqueda debe ser de cualquier palabra no solo de la primera letra, ejemplo si escribo "super" me debe mostrar "supermercado la familia" y no solo si escribo "s" o "su" al principio.
- corregir la funcionalidad de búsqueda de clientes en el formulario de Nuevo Cliente para que muestre una lista de coincidencias en un componente de edición, y que la búsqueda sea más flexible, permitiendo encontrar clientes por cualquier palabra en su razón social, no solo por la primera letra o las primeras letras, mejorando así la usabilidad y eficiencia al asociar clientes a distribuidores.

## validacion de zona creada en formulario Nuevo Cliente:
- antes de guardar un nuevo cliente, validar que la zona logística seleccionada en el formulario Nuevo Cliente exista en el sistema, para evitar errores de datos y asegurar que los clientes estén asociados a zonas logísticas válidas, mostrando un mensaje de error si la zona logística no existe o no es válida. de lo contraroio mostrar mensaje de error "La zona logística seleccionada no existe. Por favor, selecciona una zona válida." y evitar guardar el cliente hasta que se seleccione una zona logística existente en el sistema. o invitar a cerar la zona logística si no existe.

## CONFIGURACIÓN DE APIS CON SUBDOMINIOS

## 🎯 **OBJETIVO**

Configurar entornos de API separados con subdominios dedicados:

| Entorno | URL API | Puerto Backend | Puerto Frontend |
|---------|---------|----------------|-----------------|
| **Producción** | `api.distriboo.yoisar.com` | 8001 | 3001 |
| **Testing** | `test.api.distriboo.yoisar.com` | 8002 | 3002 |

---

## 🏗️ **1. ARQUITECTURA ACTUALIZADA**

### Estructura completa de puertos:

| Servicio | Testing (test.*) | Producción (*) |
|----------|------------------|----------------|
| Frontend (Next.js) | 3002 | 3001 |
| Backend API (Laravel) | 8002 | 8001 |
| MySQL | 3308 | 3307 |

### Subdominios:

```
distriboo.yoisar.com          → Frontend Producción
api.distriboo.yoisar.com      → API Producción

test.distriboo.yoisar.com     → Frontend Testing
test.api.distriboo.yoisar.com → API Testing
```

---

## 🐳 **2. DOCKER COMPOSE ACTUALIZADO**

### `docker-compose.prod.yml` (Producción)

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: distriboo_prod_frontend
    restart: always
    ports:
      - "127.0.0.1:3001:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.distriboo.yoisar.com/api
      - NEXT_PUBLIC_APP_URL=https://distriboo.yoisar.com
    networks:
      - distriboo_prod_network
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: distriboo_prod_backend
    restart: always
    ports:
      - "127.0.0.1:8001:8000"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - APP_URL=https://api.distriboo.yoisar.com
      - APP_FRONTEND_URL=https://distriboo.yoisar.com
      - DB_HOST=mysql_prod
      - DB_PORT=3306
      - DB_DATABASE=distriboo_prod
      - DB_USERNAME=distriboo_prod_user
      - DB_PASSWORD=${PROD_DB_PASSWORD}
      - SANCTUM_STATEFUL_DOMAINS=distriboo.yoisar.com
      - SESSION_DOMAIN=.yoisar.com
    networks:
      - distriboo_prod_network
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: distriboo_prod_mysql
    restart: always
    ports:
      - "127.0.0.1:3307:3306"
    environment:
      - MYSQL_DATABASE=distriboo_prod
      - MYSQL_USER=distriboo_prod_user
      - MYSQL_PASSWORD=${PROD_DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${PROD_ROOT_PASSWORD}
    volumes:
      - mysql_prod_data:/var/lib/mysql
    networks:
      - distriboo_prod_network

networks:
  distriboo_prod_network:
    driver: bridge

volumes:
  mysql_prod_data:
```

### `docker-compose.test.yml` (Testing)

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.test
    container_name: distriboo_test_frontend
    restart: always
    ports:
      - "127.0.0.1:3002:3000"
    environment:
      - NODE_ENV=test
      - NEXT_PUBLIC_API_URL=https://test.api.distriboo.yoisar.com/api
      - NEXT_PUBLIC_APP_URL=https://test.distriboo.yoisar.com
    networks:
      - distriboo_test_network
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    container_name: distriboo_test_backend
    restart: always
    ports:
      - "127.0.0.1:8002:8000"
    environment:
      - APP_ENV=testing
      - APP_DEBUG=true
      - APP_URL=https://test.api.distriboo.yoisar.com
      - APP_FRONTEND_URL=https://test.distriboo.yoisar.com
      - DB_HOST=mysql_test
      - DB_PORT=3306
      - DB_DATABASE=distriboo_test
      - DB_USERNAME=distriboo_test_user
      - DB_PASSWORD=${TEST_DB_PASSWORD}
      - SANCTUM_STATEFUL_DOMAINS=test.distriboo.yoisar.com
      - SESSION_DOMAIN=.yoisar.com
    networks:
      - distriboo_test_network
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: distriboo_test_mysql
    restart: always
    ports:
      - "127.0.0.1:3308:3306"
    environment:
      - MYSQL_DATABASE=distriboo_test
      - MYSQL_USER=distriboo_test_user
      - MYSQL_PASSWORD=${TEST_DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${TEST_ROOT_PASSWORD}
    volumes:
      - mysql_test_data:/var/lib/mysql
    networks:
      - distriboo_test_network

networks:
  distriboo_test_network:
    driver: bridge

volumes:
  mysql_test_data:
```

---

## 🌐 **3. CONFIGURACIÓN NGINX ACTUALIZADA**

### Archivo: `infra/vps/nginx.conf`

```nginx
# /etc/nginx/conf.d/distriboo.conf
# Configuración completa para distriboo.yoisar.com

# ============================================
# PRODUCCIÓN - Frontend
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name distriboo.yoisar.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name distriboo.yoisar.com;

    # SSL Certificados
    ssl_certificate /etc/nginx/ssl/distriboo.yoisar.com.crt;
    ssl_certificate_key /etc/nginx/ssl/distriboo.yoisar.com.key;

    # Logs
    access_log /var/log/nginx/distriboo_prod_access.log;
    error_log /var/log/nginx/distriboo_prod_error.log;

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend Producción
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos
    location /storage {
        alias /www/wwwroot/distriboo.yoisar.com/backend/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# ============================================
# PRODUCCIÓN - API
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name api.distriboo.yoisar.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.distriboo.yoisar.com;

    # SSL Certificados
    ssl_certificate /etc/nginx/ssl/api.distriboo.yoisar.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.distriboo.yoisar.com.key;

    # Logs
    access_log /var/log/nginx/distriboo_prod_api_access.log;
    error_log /var/log/nginx/distriboo_prod_api_error.log;

    # CORS para API
    add_header 'Access-Control-Allow-Origin' 'https://distriboo.yoisar.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://distriboo.yoisar.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With';
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Backend API Producción
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers específicos para Laravel Sanctum
        proxy_set_header Origin $scheme://$host;
        proxy_set_header Referer $scheme://$host;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# ============================================
# TESTING - Frontend
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name test.distriboo.yoisar.com;

    # Redirigir HTTP a HTTPS (opcional para testing)
    # Para testing se puede mantener HTTP para simplificar
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ============================================
# TESTING - API
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name test.api.distriboo.yoisar.com;

    # CORS para API Testing
    add_header 'Access-Control-Allow-Origin' 'https://test.distriboo.yoisar.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://test.distriboo.yoisar.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With';
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Backend API Testing
    location / {
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers específicos para Laravel Sanctum
        proxy_set_header Origin $scheme://$host;
        proxy_set_header Referer $scheme://$host;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

## 🔧 **4. CONFIGURACIÓN DE LARAVEL (BACKEND)**

### Archivo: `backend/config/cors.php`

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        env('FRONTEND_URL', 'https://distriboo.yoisar.com'),
        env('FRONTEND_TEST_URL', 'https://test.distriboo.yoisar.com'),
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
```

### Archivo: `backend/config/sanctum.php`

```php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),
    
    'guard' => ['web'],
    
    'expiration' => null,
    
    'token_prefix' => '',
    
    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

### Archivo: `backend/.env.production`

```env
# Producción
APP_NAME=Distriboo
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.distriboo.yoisar.com
APP_FRONTEND_URL=https://distriboo.yoisar.com

# Database
DB_CONNECTION=mysql
DB_HOST=mysql_prod
DB_PORT=3306
DB_DATABASE=distriboo_prod
DB_USERNAME=distriboo_prod_user
DB_PASSWORD=your_secure_password_here

# Sanctum
SANCTUM_STATEFUL_DOMAINS=distriboo.yoisar.com
SESSION_DOMAIN=.yoisar.com

# CORS
FRONTEND_URL=https://distriboo.yoisar.com
```

### Archivo: `backend/.env.test`

```env
# Testing
APP_NAME=Distriboo-Test
APP_ENV=testing
APP_DEBUG=true
APP_URL=https://test.api.distriboo.yoisar.com
APP_FRONTEND_URL=https://test.distriboo.yoisar.com

# Database
DB_CONNECTION=mysql
DB_HOST=mysql_test
DB_PORT=3306
DB_DATABASE=distriboo_test
DB_USERNAME=distriboo_test_user
DB_PASSWORD=your_test_password_here

# Sanctum
SANCTUM_STATEFUL_DOMAINS=test.distriboo.yoisar.com
SESSION_DOMAIN=.yoisar.com

# CORS
FRONTEND_URL=https://test.distriboo.yoisar.com
```

---

## 🌐 **5. CONFIGURACIÓN DE NEXT.JS (FRONTEND)**

### Archivo: `frontend/.env.production`

```env
# Producción
NEXT_PUBLIC_API_URL=https://api.distriboo.yoisar.com/api
NEXT_PUBLIC_APP_URL=https://distriboo.yoisar.com
NEXT_PUBLIC_APP_NAME=Distriboo
```

### Archivo: `frontend/.env.test`

```env
# Testing
NEXT_PUBLIC_API_URL=https://test.api.distriboo.yoisar.com/api
NEXT_PUBLIC_APP_URL=https://test.distriboo.yoisar.com
NEXT_PUBLIC_APP_NAME=Distriboo-Test
```

### Archivo: `frontend/lib/api.ts`

```typescript
// lib/api.ts
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Cliente-side: usar variable de entorno
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Server-side: usar URL según el host
  const host = process.env.VERCEL_URL || process.env.HOSTNAME;
  if (host?.includes('test')) {
    return 'https://test.api.distriboo.yoisar.com/api';
  }
  return 'https://api.distriboo.yoisar.com/api';
};

export const API_URL = getApiUrl();

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

---

## 🔄 **6. SCRIPT DE CONFIGURACIÓN DE SSL**

### Archivo: `scripts/setup-ssl.sh`

```bash
#!/bin/bash

# ============================================
# Configurar SSL para todos los subdominios
# Uso: ./scripts/setup-ssl.sh
# ============================================

DOMAINS=(
    "distriboo.yoisar.com"
    "api.distriboo.yoisar.com"
    "test.distriboo.yoisar.com"
    "test.api.distriboo.yoisar.com"
)

for DOMAIN in "${DOMAINS[@]}"; do
    echo "Configurando SSL para $DOMAIN..."
    
    # Usar certbot para obtener certificados
    sudo certbot certonly --nginx \
        -d $DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@yoisar.com
    
    echo "✅ SSL configurado para $DOMAIN"
done

# Recargar Nginx
sudo nginx -s reload

echo "✅ Todos los SSL configurados correctamente"
```

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

### DNS (Configurar en el panel del dominio):
- [ ] `distriboo.yoisar.com` → IP del VPS
- [ ] `api.distriboo.yoisar.com` → IP del VPS
- [ ] `test.distriboo.yoisar.com` → IP del VPS
- [ ] `test.api.distriboo.yoisar.com` → IP del VPS

### Nginx:
- [ ] Configurar archivo `nginx.conf` con los 4 server blocks
- [ ] Probar configuración: `sudo nginx -t`
- [ ] Recargar Nginx: `sudo nginx -s reload`
- [ ] Configurar SSL para producción (HTTPS)
- [ ] Verificar que no hay conflictos de puertos

### Docker:
- [ ] Verificar que los puertos no están en uso: `sudo lsof -i :3001,3002,8001,8002,3307,3308`
- [ ] Levantar contenedores de producción: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Levantar contenedores de testing: `docker-compose -f docker-compose.test.yml up -d`
- [ ] Verificar logs: `docker-compose logs -f`

### Testing:
- [ ] Acceder a `https://test.distriboo.yoisar.com`
- [ ] Acceder a `https://test.api.distriboo.yoisar.com/health` (debe responder "healthy")
- [ ] Probar login desde frontend de testing
- [ ] Verificar CORS funcionando

### Producción:
- [ ] Acceder a `https://distriboo.yoisar.com`
- [ ] Acceder a `https://api.distriboo.yoisar.com/health` (debe responder "healthy")
- [ ] Probar login desde frontend de producción
- [ ] Verificar CORS funcionando

---

## 🚀 **COMANDOS DE VERIFICACIÓN**

```bash
# Verificar puertos en uso
sudo netstat -tulpn | grep -E '3001|3002|8001|8002|3307|3308'

# Verificar contenedores corriendo
docker ps --filter "name=distriboo"

# Verificar configuración Nginx
sudo nginx -t

# Verificar DNS
nslookup distriboo.yoisar.com
nslookup api.distriboo.yoisar.com
nslookup test.distriboo.yoisar.com
nslookup test.api.distriboo.yoisar.com

# Probar API localmente
curl -I http://127.0.0.1:8001/health
curl -I http://127.0.0.1:8002/health

# Probar API vía Nginx
curl -I https://api.distriboo.yoisar.com/health
curl -I http://test.api.distriboo.yoisar.com/health
```

---

## 📝 **RESUMEN EJECUTIVO**

| Entorno | Frontend | API | Puerto Backend |
|---------|----------|-----|----------------|
| **Producción** | distriboo.yoisar.com | api.distriboo.yoisar.com | 8001 |
| **Testing** | test.distriboo.yoisar.com | test.api.distriboo.yoisar.com | 8002 |

### Puertos asignados:
- Frontend Prod: 3001
- Backend Prod: 8001
- MySQL Prod: 3307
- Frontend Test: 3002
- Backend Test: 8002
- MySQL Test: 3308

### Conflictos evitados:
- ✅ Puertos diferentes para cada entorno
- ✅ Subdominios separados para frontend y API
- ✅ Contenedores con nombres distintos
- ✅ Redes Docker separadas
- ✅ Volúmenes de BD separados

---


# script para actualizar stock a distribuidor - critico:

- script .sh para actualizar stock cantidad definida en parametros a usaurio distribuidor con email - parametro email distrobudior cantidad y entorno, testing, prodccion o local
- ejemplo distribudor benlive@distriboo.com en testing stock 100 todos los productos.
- 
- mensaje de commit: "Script para actualizar stock a distribuidor


# CRITICO :
- NO MODIFCAR LOS DATOS EN TESTIG DESPUES DE CADA DEPLOY -
- LOS DATOS DE TESTING DEBEN MANTENERSE FIJOS PARA PERMITIR PRUEBAS CONSISTENTES Y EVITAR LA PÉRDIDA DE INFORMACIÓN IMPORTANTE PARA EL PROCESO DE QA, ASÍ COMO PARA FACILITAR LA IDENTIFICACIÓN DE ERRORES Y VALIDAR LAS FUNCIONALIDADES DE MANERA EFICIENTE, ASEGURANDO QUE LOS PRUEBAS SE REALICEN SOBRE UN ENTORNO CONTROLADO Y ESTABLE.
# actualziar Funcionalidades en landing page:
- analziar nuevas Funcionalidades del admmi y actualziar lista de caracetristicas en landing page para reflejar las nuevas funcionalidades y mejoras implementadas en el sistema, asegurando que la información sea clara, atractiva y destaque los beneficios clave para los usuarios potenciales.
- actualizar la sección de Funcionalidades en la landing page para incluir las nuevas funcionalidades implementadas en el sistema, como la gestión avanzada de pedidos, integración con múltiples distribuidores, y mejoras en la experiencia de usuario, utilizando un lenguaje persuasivo y visualmente atractivo para captar la atención de los visitantes y convertirlos en usuarios activos.
- mensaje de commit: "Actualizar Funcionalidades en landing page para reflejar nuevas funcionalidades"

## correciones generar pedido :
- Corregir errore de comparaciond enumeros el pedido supera el limte paro al parecer hay un problema con al comparciond e limites
- limite 190000 - pedido supera los 190000  (218.525)
- endpoint https://test.api.distriboo.yoisar.com/api/pedidos
- error: 
- {"message":"El pedido m\u00ednimo para Misiones es $190000.00"}
- payload
- {
    "cliente_id": 7,
    "items": [
        {
            "producto_id": 34,
            "cantidad": 4
        },
        {
            "producto_id": 43,
            "cantidad": 4
        },
        {
            "producto_id": 39,
            "cantidad": 4
        },
        {
            "producto_id": 45,
            "cantidad": 1
        },
        {
            "producto_id": 40,
            "cantidad": 3
        },
        {
            "producto_id": 41,
            "cantidad": 4
        },
        {
            "producto_id": 31,
            "cantidad": 4
        },
        {
            "producto_id": 36,
            "cantidad": 4
        },
        {
            "producto_id": 33,
            "cantidad": 5
        },
        {
            "producto_id": 42,
            "cantidad": 5
        }
    ],
    "observaciones": "asd asd asd"
}

# mas correcciones:
## /pedidos:
- no mostrar pedidos no generados por el cliente loguead  - actualmente se estan mostrando pedidos que no pertenecne al cliente
- el cliente no puede ver su pedido al hacer click en ver - esto no es o esperado - lo esperado es que pueda ver sus pedidos.
- corregir la funcionalidad de visualización de pedidos para que el cliente solo pueda ver los pedidos que ha generado, asegurando que no se muestren pedidos de otros clientes, y que al hacer clic en "ver" pueda acceder a los detalles de sus propios pedidos sin problemas. 

## clientes/usuario multi distribuidres:
- actualmente al agregar un cliente con mismo email genera un error, deberoa traer los datos del usuario/cleinte exisntente ya sea en la carga del cleinte o en la carga del usuario de diferente distribuidor, para permitir que un mismo cliente pueda estar asociado a varios distribuidores sin generar conflictos en la base de datos, y facilitar la gestión de clientes que compran a diferentes proveedores. corregir la lógica de creación de clientes y usuarios para que al ingresar un email ya existente, se traigan los datos del cliente/usuario asociado a ese email, permitiendo asociar el mismo cliente a múltiples distribuidores sin generar errores.

## error en validacon de limites de pedid:
- la limitacon de pedido esta funcionando mal ya que no esta tomando el total del pedido para el minomo esta : ejemplo:
Subtotal
$11.510
Logística (4 bultos)
$29.200
📦 Entrega en 6 días hábiles
Total
$40.710
Mínimo: $100.000
Faltan $88.490

- esta tomando subtotal y no el total del pedido para la validacion de limites, corregir la lógica de validación de límites de pedido para que tome en cuenta el total del pedido (incluyendo logística y otros cargos) en lugar del subtotal, asegurando que la validación sea precisa y refleje correctamente si el pedido cumple con el mínimo requerido.