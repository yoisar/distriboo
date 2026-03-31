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
