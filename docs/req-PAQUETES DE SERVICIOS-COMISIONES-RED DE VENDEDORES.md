# PAQUETES DE SERVICIOS, COMISIONES Y RED DE VENDEDORES

## 🎯 OBJETIVO

Implementar un sistema de comercialización de `distriboo` como SaaS con:
1. **Planes de suscripción** visibles en landing page
2. **Sistema de comisiones** para referidos (amigos/conocidos)
3. **Panel de revendedor** para gestionar sus clientes y comisiones
4. **Gestión exclusiva por Super Admin** de toda la estructura de comisiones y revendedores

---

## 🧱 1. PLANES DE SERVICIO (PÚBLICOS EN LANDING PAGE)

### Visualización en Landing Page

La landing page debe mostrar **tres planes** con diseño claro y comparativo:

| Plan | Precio Mensual | Características | Target |
|------|----------------|-----------------|--------|
| **BASIC** | $60.000 ARS | • Hasta 50 productos<br>• Hasta 30 clientes<br>• Pedidos online<br>• Panel básico | Distribuidores chicos |
| **PRO** | $90.000 ARS | • Hasta 200 productos<br>• Hasta 100 clientes<br>• Zonas/provincias<br>• Reportes | Distribuidores medianos (ancla de ventas) |
| **FULL** | $120.000 ARS | • Productos ilimitados<br>• Clientes ilimitados<br>• Multi vendedor<br>• Integraciones/exportaciones | Distribuidores grandes |

### Descuentos por Plazo

Los descuentos deben aplicarse al momento de contratar:

| Plazo | Descuento |
|-------|-----------|
| 3 meses | 10% |
| 6 meses | 20% |
| 12 meses | 30% |

### Setup Inicial (Comisionable)

- Setup inicial: entre $60.000 y $120.000 ARS (según plan elegido)
- Este monto también es comisionable para el referidor

### UX/UI Requerida

- Tarjetas de planes con precios destacados
- Tabla comparativa de características
- Selector de plazo (3/6/12 meses) que actualice precio final
- Botón de "Contratar" que inicie flujo de registro del distribuidor
- Campo opcional: "Código de referido" (para asignar comisión)

---

## 👥 2. SISTEMA DE COMISIONES

### Estructura de Comisiones

| Tipo | Porcentaje | Condición |
|------|------------|-----------|
| **Base** | 20% mensual recurrente | Por cada cliente activo |
| **Bonus Nivel 1** | 25% | Si el revendedor tiene 3 clientes activos |
| **Bonus Nivel 2** | 30% | Si el revendedor tiene 5 o más clientes activos |

### Aplicación de Comisiones

- **Mensual recurrente:** Sobre el valor del plan contratado (post descuento si aplica)
- **Setup inicial:** Sobre el cargo único de instalación (comisión igual al porcentaje vigente)
- **Pago:** Se calcula automáticamente cada mes y queda registrado en el sistema

### Reglas de Negocio

- Las comisiones se calculan sobre el **pago efectivamente recibido** (descuentos aplicados)
- El porcentaje de comisión se actualiza automáticamente según la cantidad de clientes activos del revendedor
- Si un cliente cancela, la comisión deja de pagarse
- Si un cliente cambia de plan, la comisión se recalcula automáticamente

---

## 👤 3. ROL DE REVENDEDOR

### Definición

El **Revendedor** es un rol especial que:
- Solo puede ser creado por el **Super Admin**
- No tiene acceso a la configuración de la plataforma (productos, clientes, etc.)
- Solo ve su panel de comisiones y sus clientes referidos

### Acceso y Autenticación

- Login con email y contraseña (creado por Super Admin)
- URL de acceso: `revendedor.distriboo.yoisar.com` o ruta `/revendedor/login`

### Panel del Revendedor

El panel debe mostrar:

| Sección | Contenido |
|---------|-----------|
| **Dashboard** | Resumen: clientes activos, comisiones acumuladas, comisiones pendientes de pago |
| **Mis Clientes** | Lista de distribuidores que contrataron con su código de referido. Mostrar: nombre, plan, fecha de alta, estado (activo/cancelado) |
| **Comisiones** | Historial de comisiones generadas (mes a mes). Mostrar: cliente, plan, monto base, porcentaje aplicado, comisión, fecha, estado (pendiente/pagada) |
| **Liquidaciones** | Resumen por período. Posibilidad de ver comprobante de pago (cuando Super Admin marca como pagado) |
| **Mi Perfil** | Datos personales, CBU/CVU para pagos, contacto |

### Acciones del Revendedor

- Ver en tiempo real sus clientes activos
- Ver comisiones generadas mes a mes
- No puede modificar ni ver datos de otros revendedores
- No puede acceder a la plataforma de distribución (productos, pedidos, etc.)

---

## 👑 4. GESTIÓN EXCLUSIVA POR SUPER ADMIN

### Módulo de Revendedores (Solo Super Admin)

| Funcionalidad | Descripción |
|---------------|-------------|
| **Listar Revendedores** | Tabla con todos los revendedores registrados |
| **Crear Revendedor** | Formulario: nombre, email, contraseña, porcentaje base (opcional, default 20%) |
| **Editar Revendedor** | Modificar datos, activar/desactivar, cambiar porcentaje base |
| **Ver Detalle** | Acceso al mismo panel que el revendedor (vista Super Admin) |
| **Eliminar** | Desactivar revendedor (soft delete) |

### Módulo de Comisiones (Solo Super Admin)

| Funcionalidad | Descripción |
|---------------|-------------|
| **Listar Comisiones** | Tabla con todas las comisiones generadas (filtro por revendedor, mes, estado) |
| **Marcar como Pagada** | Cambiar estado de comisiones (individual o por lote) |
| **Generar Liquidación** | Exportar comisiones de un período a Excel/PDF |
| **Configurar Porcentajes** | Modificar porcentajes base y bonos (20%/25%/30%) |
| **Registrar Pagos Externos** | Si se paga por fuera del sistema, registrar comprobante |

### Módulo de Clientes (Relación con Revendedor)

- Al crear un nuevo distribuidor (cliente de la plataforma), Super Admin debe poder asignar:
  - Plan contratado
  - Plazo (3/6/12 meses)
  - Código de referido (revendedor que lo trajo)
- Los clientes creados por Super Admin **no generan comisión automática** si no tienen referido

---

## 🔄 5. FLUJOS COMPLETOS

### Flujo de Contratación (Con Referido)

```
1. Visitante llega a landing page
2. Selecciona plan y plazo
3. Completa formulario de registro (distribuidor)
4. Ingresa código de referido (opcional)
5. Sistema valida código y asigna revendedor
6. Super Admin recibe notificación de nuevo cliente
7. Super Admin activa cuenta y confirma plan
8. Comienza ciclo de facturación y comisiones
```

### Flujo de Comisión Mensual

```
1. Sistema detecta inicio de nuevo mes
2. Por cada cliente activo:
   - Calcula monto del plan (post descuento)
   - Obtiene porcentaje vigente del revendedor (según # clientes)
   - Genera registro de comisión (estado: pendiente)
3. Super Admin revisa comisiones en su panel
4. Super Admin marca como pagadas cuando realiza transferencia
5. Revendedor ve actualización en su panel
```

### Flujo de Cancelación

```
1. Cliente cancela servicio
2. Sistema detecta cancelación
3. Deja de generar comisiones mensuales
4. Revendedor ve cliente marcado como "inactivo"
5. Porcentaje de comisión se recalcula (menos clientes activos)
```

---

## 📊 6. DATOS A ALMACENAR (ESTRUCTURA CONCEPTUAL)

### Tablas Nuevas Requeridas

| Tabla | Propósito |
|-------|-----------|
| `planes` | Planes de suscripción (nombre, precio, características en JSON, orden) |
| `suscripciones` | Relación distribuidor - plan (fecha inicio, fecha fin, plazo, descuento, revendedor_id) |
| `revendedores` | Datos del revendedor (user_id relacionado, porcentaje_base, cbu, datos bancarios) |
| `comisiones` | Registro de comisiones generadas (monto, porcentaje_aplicado, mes, año, estado, fecha_pago) |
| `pagos_revendedores` | Liquidaciones realizadas (monto total, período, comprobante) |
| `configuracion_comisiones` | Configuración global (porcentajes por nivel, condiciones) |

### Relaciones Clave

- `users` → se extiende con rol `revendedor`
- `distribuidores` → tiene `revendedor_id` (opcional, si vino por referido)
- `suscripciones` → relaciona `distribuidor_id` con `plan_id`
- `comisiones` → relaciona `revendedor_id` con `suscripcion_id`

---

## 🎨 7. UX/UI ESPECÍFICAS

### Landing Page (Nuevas Secciones)

- **Sección de Planes:** Tarjetas con precios, características, selector de plazo
- **Sección para Revendedores:** Call to action: "¿Querés ganar dinero con Distriboo?" con link a formulario de contacto (no acceso directo)
- **Footer:** Mantener crédito Yoisar

### Panel de Revendedor (Diseño)

- Mismo estilo que dashboard de distriboo (Tailwind Admin)
- Sidebar reducido (solo secciones de su interés)
- Gráficos simples: evolución de comisiones, cantidad de clientes
- Tablas con exportación a Excel

### Panel Super Admin (Nuevas Secciones)

- Módulo "Revendedores" en sidebar
- Módulo "Comisiones" en sidebar
- Módulo "Planes" para editar precios y características

---

## 🔒 8. RESTRICCIONES Y PERMISOS

| Rol | Acceso a Planes | Acceso a Revendedores | Acceso a Comisiones |
|-----|-----------------|----------------------|---------------------|
| **Super Admin** | CRUD completo | CRUD completo, ver todo | CRUD completo, marcar pagos |
| **Revendedor** | Solo lectura (ver planes) | Solo ver sus clientes | Solo ver sus comisiones |
| **Distribuidor** | No ve | No ve | No ve |
| **Cliente** | No ve | No ve | No ve |

---

## 📈 9. REPORTES EXCLUSIVOS

### Para Super Admin

- Comisiones por revendedor (mensual, anual)
- Clientes por plan
- Ingresos recurrentes mensuales (MRR)
- Tasa de retención de clientes
- Ranking de revendedores por ventas

### Para Revendedor

- Mis comisiones por mes
- Mis clientes activos vs inactivos
- Proyección: si consigo X clientes más, cuánto ganaría

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear tablas: `planes`, `suscripciones`, `revendedores`, `comisiones`, `pagos_revendedores`, `configuracion_comisiones`
- [ ] Extender `users` con campo `revendedor_id` en `distribuidores`
- [ ] Implementar lógica de cálculo automático de comisiones (cron job mensual)
- [ ] Crear endpoints para panel revendedor
- [ ] Crear endpoints para gestión super admin

### Frontend
- [ ] Landing page: sección de planes con selector de plazo
- [ ] Landing page: campo "código de referido" en formulario de contratación
- [ ] Panel revendedor: dashboard, mis clientes, comisiones, liquidaciones
- [ ] Panel super admin: módulo revendedores, módulo comisiones, módulo planes
- [ ] Rutas protegidas por rol

### Configuración
- [ ] Crear subdominio o ruta para revendedores: `revendedor.distriboo.yoisar.com`
- [ ] Configurar cron job para cálculo mensual de comisiones
- [ ] Configurar sistema de notificaciones (email) para nuevos clientes referidos

---

## 📝 RESUMEN EJECUTIVO

| Componente | Descripción |
|------------|-------------|
| **Planes** | 3 planes (Basic $60k, Pro $90k, Full $120k) con descuentos por plazo |
| **Comisiones** | 20% base, hasta 30% con bonos por volumen (3/5 clientes) |
| **Revendedores** | Rol especial creado solo por Super Admin, panel exclusivo |
| **Landing Page** | Muestra planes, campo de código de referido |
| **Super Admin** | Gestión completa de revendedores, comisiones y planes |

---


# 📋 REQUERIMIENTO: TESTING CON PLAYWRIGHT - ESCENARIOS COMPLETOS

## 🎯 OBJETIVO

Implementar suite de pruebas automatizadas con **Playwright** que cubran todos los escenarios críticos del sistema distriboo, incluyendo:
- Registro de distribuidores con planes y referidos
- Validación de notificaciones (email, panel)
- Flujos de usuario (Super Admin, Distribuidor, Revendedor, Cliente)
- Verificación de correos en MailHog (http://localhost:8025)

---

## 🧪 1. ENTORNO DE TESTING

### Configuración Base

| Componente | Configuración |
|------------|---------------|
| **URL Frontend Testing** | https://test.distriboo.yoisar.com o http://localhost:3002 |
| **URL API Testing** | https://test.api.distriboo.yoisar.com o http://localhost:8002 |
| **MailHog (email testing)** | http://localhost:8025 |
| **Base de datos Testing** | distriboo_test (independiente) |
| **Browser** | Chromium, Firefox, WebKit (cross-browser) |

### Variables de Entorno para Testing

```
BASE_URL=http://localhost:3002
API_URL=http://localhost:8002/api
MAILHOG_URL=http://localhost:8025
TEST_SUPER_ADMIN_EMAIL=sioy23@gmail.com
TEST_SUPER_ADMIN_PASSWORD=12345678
```

---

## 📁 2. ESTRUCTURA DE PRUEBAS

```
tests/
├── playwright.config.ts
├── fixtures/
│   ├── auth.fixture.ts
│   ├── database.fixture.ts
│   └── mailhog.fixture.ts
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   └── password-reset.spec.ts
│   ├── landing/
│   │   ├── plans-display.spec.ts
│   │   ├── referral-code.spec.ts
│   │   └── pricing.spec.ts
│   ├── distributor/
│   │   ├── onboarding.spec.ts
│   │   ├── subscription.spec.ts
│   │   └── notifications.spec.ts
│   ├── revendedor/
│   │   ├── dashboard.spec.ts
│   │   ├── commissions.spec.ts
│   │   └── clients.spec.ts
│   ├── super-admin/
│   │   ├── revendedor-management.spec.ts
│   │   ├── commission-management.spec.ts
│   │   └── plan-management.spec.ts
│   └── client/
│       ├── catalog.spec.ts
│       ├── orders.spec.ts
│       └── history.spec.ts
├── scenarios/
│   ├── complete-purchase-flow.spec.ts
│   ├── referral-bonus-flow.spec.ts
│   └── commission-calculation.spec.ts
└── utils/
    ├── db-cleaner.ts
    ├── test-data.ts
    └── email-verification.ts
```

---

## 🧪 3. ESCENARIOS DE PRUEBA POR ROL

### 3.1. SUPER ADMIN

| ID | Escenario | Descripción | Validaciones |
|----|-----------|-------------|--------------|
| SA-01 | Login Super Admin | Acceder con credenciales sioy23@gmail.com / 12345678 | Redirige a dashboard admin, muestra módulos correctos |
| SA-02 | Crear Revendedor | Desde panel Super Admin, crear nuevo revendedor | Revendedor aparece en listado, recibe email de bienvenida |
| SA-03 | Editar Revendedor | Modificar datos, porcentaje base, activar/desactivar | Cambios persisten en BD, reflejan en panel revendedor |
| SA-04 | Ver Comisiones Generadas | Listar comisiones por revendedor, filtrar por mes | Datos coinciden con cálculos, totales correctos |
| SA-05 | Marcar Comisión como Pagada | Seleccionar comisión pendiente, marcar pagada | Estado cambia, revendedor ve actualización |
| SA-06 | Liquidación Masiva | Seleccionar múltiples comisiones, pagar lote | Todas cambian estado, se genera comprobante |
| SA-07 | Configurar Porcentajes | Modificar 20%/25%/30% a otros valores | Nuevos clientes usan nuevos porcentajes |
| SA-08 | Crear Plan Nuevo | Agregar plan con precio y características | Aparece en landing page, disponible para contratar |
| SA-09 | Ver Reportes | Acceder a reportes de ingresos, comisiones, clientes | Datos consistentes, gráficos visibles |

### 3.2. REVENDEDOR

| ID | Escenario | Descripción | Validaciones |
|----|-----------|-------------|--------------|
| RE-01 | Login Revendedor | Acceder con credenciales creadas por SA | Redirige a panel revendedor, no muestra opciones admin |
| RE-02 | Ver Dashboard | Ver resumen: clientes activos, comisiones acumuladas | Números correctos según datos de prueba |
| RE-03 | Ver Mis Clientes | Lista de distribuidores referidos con sus planes | Muestra nombre, plan, fecha alta, estado |
| RE-04 | Ver Comisiones Generadas | Historial de comisiones por mes | Montos calculados según porcentaje vigente |
| RE-05 | Ver Liquidaciones | Comisiones marcadas como pagadas | Muestra fecha pago, comprobante disponible |
| RE-06 | Actualizar Datos Bancarios | Modificar CBU/CVU, datos de contacto | Cambios guardados, visibles para SA |
| RE-07 | Ver Proyección | Simular: si consigo X clientes más, cuánto gano | Cálculo se actualiza dinámicamente |

### 3.3. DISTRIBUIDOR (Cliente de la plataforma)

| ID | Escenario | Descripción | Validaciones |
|----|-----------|-------------|--------------|
| DI-01 | Ver Landing Page Planes | Visualizar 3 planes con precios | Tarjetas correctas, precios visibles |
| DI-02 | Seleccionar Plan con Plazo | Elegir plan PRO, plazo 6 meses (20% descuento) | Precio final calculado correctamente |
| DI-03 | Completar Registro con Referido | Ingresar código de referido válido | Registro exitoso, revendedor asociado |
| DI-04 | Completar Registro sin Referido | No ingresar código | Registro exitoso, sin revendedor asociado |
| DI-05 | Recibir Email Confirmación | Después de registro | Email llega a MailHog, contiene datos correctos |
| DI-06 | Activar Cuenta por SA | SA activa cuenta desde panel | Distribuidor puede hacer login |
| DI-07 | Login Distribuidor | Acceder con credenciales | Redirige a dashboard distribuidor |
| DI-08 | Ver Productos (CRUD) | Crear, editar, eliminar productos | Operaciones exitosas, stock actualizado |
| DI-09 | Ver Clientes (CRUD) | Crear, editar, eliminar clientes | Operaciones exitosas, clientes asociados |
| DI-10 | Configurar Zonas Logísticas | Crear zona con costos y tiempos | Configuración guardada, afecta pedidos |
| DI-11 | Recibir Notificación Nuevo Pedido | Cliente hace pedido | Email notifica, panel muestra pedido |
| DI-12 | Cambiar Estado Pedido | Confirmar, enviar, entregar | Estado cambia, cliente ve actualización |

### 3.4. CLIENTE (Mayorista)

| ID | Escenario | Descripción | Validaciones |
|----|-----------|-------------|--------------|
| CL-01 | Login Cliente | Acceder con credenciales | Redirige a panel cliente (sin stock/precios) |
| CL-02 | Ver Catálogo | Lista de productos | No muestra stock, no muestra precios |
| CL-03 | Armar Pedido | Agregar productos al carrito | Sí muestra precios al armar |
| CL-04 | Ver Costo Logístico | Según provincia del cliente | Cálculo automático visible |
| CL-05 | Ver Tiempo Entrega | Estimación según provincia | Días correctos según zona |
| CL-06 | Confirmar Pedido | Enviar pedido | Pedido registrado, estado "pendiente" |
| CL-07 | Ver Historial Pedidos | Lista de pedidos anteriores | Fechas, estados, montos correctos |
| CL-08 | Recibir Notificación Estado | Pedido confirmado por distribuidor | Email notifica, panel actualizado |

---

## 📧 4. VALIDACIÓN DE EMAILS (MAILHOG)

### Configuración MailHog

MailHog debe estar corriendo en `http://localhost:8025` para interceptar emails.

### Escenarios de Email a Validar

| Email | Destinatario | Disparador | Validar Contenido |
|-------|--------------|------------|-------------------|
| **Bienvenida Revendedor** | Revendedor | SA crea revendedor | Credenciales, link acceso, % comisión |
| **Bienvenida Distribuidor** | Distribuidor | Registro completado | Link activación, datos plan, referido (si aplica) |
| **Confirmación Registro** | Distribuidor | SA activa cuenta | Credenciales, link login |
| **Nuevo Cliente Referido** | Revendedor | Distribuidor registra con su código | Nombre cliente, plan, comisión estimada |
| **Comisión Generada** | Revendedor | Inicio de mes (cron) | Clientes activos, monto comisión, total |
| **Pago Comisión** | Revendedor | SA marca como pagada | Monto, período, comprobante |
| **Nuevo Pedido** | Distribuidor | Cliente confirma pedido | Datos pedido, cliente, total |
| **Estado Pedido** | Cliente | Distribuidor cambia estado | Nuevo estado, fecha estimada |
| **Recordatorio Pago** | Distribuidor | 5 días antes de vencimiento | Plan, monto, link pago |
| **Cancelación Servicio** | Distribuidor | Distribuidor cancela | Fecha fin, datos contacto |

### Funciones de Validación Email

```typescript
// utils/email-verification.ts - funciones a implementar
- getLatestEmail(to: string): Promise<Email>
- getEmailsBySubject(subject: string): Promise<Email[]>
- verifyEmailContent(email: Email, expected: { subject, bodyContains, from }): boolean
- extractLinkFromEmail(email: Email, linkText: string): string
- waitForEmail(to: string, timeout: number): Promise<Email>
```

---

## 🗄️ 5. PREPARACIÓN DE DATOS DE PRUEBA

### Data Fixtures

```typescript
// fixtures/test-data.ts
export const testData = {
  // Usuarios base
  superAdmin: {
    email: 'sioy23@gmail.com',
    password: '12345678',
    role: 'super_admin'
  },
  
  // Revendedores de prueba
  revendedores: [
    { name: 'Juan Perez', email: 'juan@test.com', password: '12345678', porcentaje_base: 20 },
    { name: 'Maria Lopez', email: 'maria@test.com', password: '12345678', porcentaje_base: 20 }
  ],
  
  // Planes
  planes: [
    { nombre: 'BASIC', precio: 60000, productos_max: 50, clientes_max: 30 },
    { nombre: 'PRO', precio: 90000, productos_max: 200, clientes_max: 100 },
    { nombre: 'FULL', precio: 120000, productos_max: 999999, clientes_max: 999999 }
  ],
  
  // Distribuidores (clientes de la plataforma)
  distribuidores: [
    { 
      razon_social: 'Helados del Sur', 
      email: 'distribuidor1@test.com',
      plan: 'PRO',
      plazo: 6,
      codigo_referido: null
    },
    { 
      razon_social: 'Distribuidora Norte', 
      email: 'distribuidor2@test.com',
      plan: 'BASIC',
      plazo: 12,
      codigo_referido: 'JUAN2024'
    }
  ],
  
  // Clientes mayoristas
  clientes: [
    { razon_social: 'Kiosco El Centro', email: 'cliente1@test.com', provincia: 'Buenos Aires' },
    { razon_social: 'Supermercado La Familia', email: 'cliente2@test.com', provincia: 'Córdoba' }
  ],
  
  // Productos
  productos: [
    { nombre: 'Helado Vainilla 1L', precio: 2500, stock: 100 },
    { nombre: 'Helado Chocolate 1L', precio: 2600, stock: 85 }
  ]
};
```

### Database Cleaner

```typescript
// utils/db-cleaner.ts - funciones a implementar
- truncateAllTables(): Promise<void>
- resetSequences(): Promise<void>
- loadFixtures(fixtures: object): Promise<void>
- backupDatabase(): Promise<string>
- restoreDatabase(backupId: string): Promise<void>
```

---

## 🔄 6. FLUJOS COMPLETOS (END-TO-END)

### Escenario 1: Registro Completo con Referido y Comisión

```
1. [SA] Login Super Admin
2. [SA] Crear revendedor "Juan Perez" (email: juan@test.com)
3. [SA] Verificar que Juan recibe email de bienvenida en MailHog
4. [REV] Login como Juan Perez
5. [REV] Ver dashboard: 0 clientes, 0 comisiones
6. [LANDING] Visitante anónimo ve landing page
7. [LANDING] Selecciona plan PRO, plazo 6 meses
8. [LANDING] Completa registro con código referido de Juan
9. [LANDING] Recibe email de confirmación
10. [SA] Login, activa cuenta del nuevo distribuidor
11. [REV] Ver panel: aparece nuevo cliente en "Mis Clientes"
12. [REV] Ver comisión pendiente (setup inicial + proyección mensual)
13. [CRON] Simular ejecución de cron de fin de mes
14. [REV] Ver comisión mensual generada (estado pendiente)
15. [SA] Ver comisiones en panel, marcar como pagada
16. [REV] Ver comisión marcada como pagada en liquidaciones
```

### Escenario 2: Pedido Completo desde Cliente

```
1. [DIST] Login distribuidor "Helados del Sur"
2. [DIST] Crear producto "Helado Vainilla"
3. [DIST] Crear cliente "Kiosco El Centro"
4. [DIST] Configurar zona logística "Buenos Aires" con costo $1500
5. [CLI] Login como cliente "Kiosco El Centro"
6. [CLI] Ver catálogo (sin precios, sin stock)
7. [CLI] Armar pedido: 10 unidades de Helado Vainilla
8. [CLI] Ver resumen: subtotal $25.000, logística $1.500, total $26.500
9. [CLI] Confirmar pedido
10. [DIST] Ver notificación en dashboard (nuevo pedido)
11. [DIST] Recibir email de nuevo pedido
12. [DIST] Cambiar estado pedido a "confirmado"
13. [CLI] Recibir email de confirmación de pedido
14. [CLI] Ver pedido en historial con estado actualizado
```

### Escenario 3: Bonus de Comisión por Volumen

```
1. [SA] Crear revendedor "Maria Lopez"
2. [REV] Login Maria, ver porcentaje base 20%
3. [LANDING] Registrar 3 distribuidores con código de Maria
4. [REV] Ver dashboard: 3 clientes activos
5. [CRON] Ejecutar cálculo de comisiones
6. [REV] Ver que comisiones se calculan con 25% (bonus nivel 1)
7. [LANDING] Registrar 2 distribuidores más (total 5)
8. [REV] Ver dashboard: 5 clientes activos
9. [CRON] Ejecutar cálculo de comisiones
10. [REV] Ver que comisiones se calculan con 30% (bonus nivel 2)
```

### Escenario 4: Cancelación de Servicio

```
1. [DIST] Login distribuidor con plan PRO
2. [DIST] Solicitar cancelación desde panel
3. [SA] Recibir notificación de cancelación
4. [SA] Confirmar cancelación
5. [REV] Ver que cliente desaparece de "Mis Clientes" activos
6. [CRON] Ejecutar cálculo de comisiones
7. [REV] Ver que ya no genera comisión por ese cliente
8. [SA] Ver reporte de cancelaciones
```

---

## ⚙️ 7. CONFIGURACIÓN PLAYWRIGHT

### playwright.config.ts

```typescript
// Configuración base
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFolder: 'test-results' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### hooks/global-setup.ts

```typescript
// Limpiar BD antes de pruebas
globalSetup = async () => {
  await cleanDatabase();
  await loadFixtures();
  await clearMailHog();
};
```

---

## ✅ 8. CHECKLIST DE PRUEBAS

### Configuración
- [ ] Playwright instalado y configurado
- [ ] MailHog corriendo en localhost:8025
- [ ] Base de datos testing limpia
- [ ] Variables de entorno configuradas
- [ ] Fixtures de datos cargados

### Pruebas por Escenario
- [ ] SA-01 a SA-09 (Super Admin)
- [ ] RE-01 a RE-07 (Revendedor)
- [ ] DI-01 a DI-12 (Distribuidor)
- [ ] CL-01 a CL-08 (Cliente)
- [ ] Escenario 1 (Registro + Referido + Comisión)
- [ ] Escenario 2 (Pedido completo)
- [ ] Escenario 3 (Bonus por volumen)
- [ ] Escenario 4 (Cancelación)

### Validaciones de Email
- [ ] Todos los emails llegan a MailHog
- [ ] Contenido de emails validado
- [ ] Links de activación funcionan
- [ ] Sin emails no deseados

### Reportes
- [ ] HTML report generado
- [ ] JSON report generado
- [ ] Screenshots en fallos
- [ ] Videos en fallos (opcional)

---

## 📝 9. COMANDOS DE EJECUCIÓN

```bash
# Instalar dependencias
npm install -D @playwright/test
npx playwright install

# Ejecutar todas las pruebas
npm run test:e2e

# Ejecutar pruebas por rol
npm run test:super-admin
npm run test:revendedor
npm run test:distribuidor
npm run test:cliente

# Ejecutar escenarios completos
npm run test:scenarios

# Ejecutar con UI
npm run test:ui

# Ver reporte
npm run test:report

# Debug
npm run test:debug
```

---

## 📋 10. INTEGRACIÓN CON CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: E2E Tests
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mailhog:
        image: mailhog/mailhog
        ports:
          - 8025:8025
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 RESUMEN EJECUTIVO

| Área | Cantidad de Escenarios |
|------|------------------------|
| Super Admin | 9 |
| Revendedor | 7 |
| Distribuidor | 12 |
| Cliente | 8 |
| Flujos completos | 4 |
| Validaciones email | 10 |
| **Total** | **50+ escenarios** |

### Entornos Validados
- ✅ Frontend Testing (test.distriboo.yoisar.com)
- ✅ API Testing (test.api.distriboo.yoisar.com)
- ✅ MailHog (localhost:8025)
- ✅ Base de datos testing independiente

### Cobertura
- ✅ Registro con referidos
- ✅ Cálculo de comisiones
- ✅ Bonos por volumen
- ✅ Notificaciones por email
- ✅ Flujo de pedidos completo
- ✅ Cancelaciones
- ✅ Multi-rol (SA, Revendedor, Distribuidor, Cliente)

---


# acceso rapid, facil y ordenado a los planes :
- - agrgear link en landing page al incio o en el menu acceso a los planes - hacerlo en un lugar visible para que le suario lo vea al entrar a la pagina
- - agregar un boton de "ver planes" o "contratar ahora" que redirija a una seccion de la misma pagina donde se muestren los planes de servicio con sus caracteristicas y precios
- - agregar una seccion de "planes" en el menu principal que redirija a la seccion de planes en la misma pagina o a una pagina dedicada a los planes de servicio
- - agregar un banner o una seccion destacada en la landing page que invite a los usuarios a conocer los planes de servicio y sus beneficios
# vista movil como https://tailwindadmin-reactjs-dark.netlify.app/frontend-pages/homepage:
- la landig page debe respetar la vista movil usada en la palntilla acutalmente no se ve n los menus en lvista movil. debe n aparecer los menus haburguesa u mas compnentes demenius que aparecen en # vista movil como https://tailwindadmin-reactjs-dark.netlify.app/frontend-pages/homepage 0 vista movil

# test completo 
- ejecutar test completo playwright para validar que todo el flujo de contratación, comisiones, panel de revendedor y gestión por super admin funciona correctamentese, incluyendo la validación de emails en MailHog y la correcta asignación de comisiones según los planes contratados y los referidos asociados.



# COMANDOS DE EJECUCIÓN DE PRUEBAS

npm run test:e2e           # Todas las pruebas
npm run test:e2e:ui        # Con interfaz visual
npm run test:super-admin   # Solo Super Admin
npm run test:revendedor    # Solo Revendedor
npm run test:scenarios     # Flujos completos