#  PERSONALIZACIÓN COMERCIAL Y SIMPLIFICACIÓN DE COMPRA B2B

## 🎯 OBJETIVO GENERAL

Permitir que cada comercio cliente realice pedidos de forma rápida y simple desde celular o PC, viendo únicamente sus precios, condiciones y costos logísticos, según su zona y acuerdo comercial.

**Resultado esperado:** Migrar pedidos de WhatsApp al sistema sin aumentar fricción, mejorando orden, control comercial y escalabilidad.

---

## 👥 1. ACCESO SIMPLE PARA CLIENTES

### Objetivo
Que comprar sea más fácil que mandar WhatsApp.

### Requerimientos Funcionales

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| ACC-01 | Login simple | Email + contraseña para clientes mayoristas |
| ACC-02 | Link mágico | Opción de acceso rápido por email sin contraseña |
| ACC-03 | Recordarme | Persistencia de sesión para evitar login repetido |
| ACC-04 | Invitación por distribuidor | Distribuidor crea cliente y envía invitación con acceso preparado |
| ACC-05 | Primer ingreso guiado | Pasos mínimos: datos comercio → confirmar zona → ver catálogo → primer pedido |
| ACC-06 | Catálogo optimizado | Buscador, categorías, botón rápido "agregar" |
| ACC-07 | Carrito persistente | Si el cliente sale, el carrito se guarda |
| ACC-08 | Recompra rápida | Desde pedido anterior, replicar con un clic |
| ACC-09 | Mobile first | Toda la experiencia optimizada para celular |

### Criterio de Éxito
- Un cliente nuevo debe poder hacer su primer pedido en **menos de 3 minutos**

---

## 💰 2. PRECIOS POR CLIENTE, ZONA Y CONDICIÓN COMERCIAL

### Objetivo
Personalizar sin exponer estrategia comercial.

### Requerimientos Funcionales

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| PRE-01 | Motor de precios por prioridad | 1. Precio específico por cliente<br>2. Precio por lista comercial<br>3. Precio por zona<br>4. Precio general |
| PRE-02 | Asignaciones por cliente | Lista de precios, descuento fijo/porcentual, condiciones por volumen, condiciones por forma de pago |
| PRE-03 | Visibilidad restringida | Cada cliente solo ve sus precios, promociones y condiciones |
| PRE-04 | Bloqueo comparativo | Imposibilidad de ver condiciones de otros clientes |
| PRE-05 | Auditoría | Historial de cambios de precios por cliente |
| PRE-06 | Vigencia temporaria | Promociones o acuerdos con fecha desde/hasta |

### Criterio de Éxito
- Ningún cliente debe visualizar precios o acuerdos de otro cliente

---

## 🚚 3. LOGÍSTICA POR ZONA VISIBLE ANTES DE CONFIRMAR

### Objetivo
Que el costo de envío no aparezca como sorpresa.

### Requerimientos Funcionales

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| LOG-01 | Asignación de zona | Cada cliente tiene una zona logística asignada |
| LOG-02 | Configuración por zona | Costo logístico, pedido mínimo, tiempo estimado, días de reparto |
| LOG-03 | Visualización en checkout | Subtotal productos + costo logístico + total final + fecha estimada |
| LOG-04 | Reglas especiales | Envío bonificado desde cierto monto, costo variable por volumen/peso, retiro en depósito |
| LOG-05 | Mensajes comerciales | "En tu zona, entregamos martes y jueves", "Superando $X, el envío es bonificado" |

### Criterio de Éxito
- El cliente debe ver el costo logístico **antes de confirmar el pedido**

---

## 📊 4. GESTIÓN COMERCIAL DE CLIENTES

### Objetivo
Que el distribuidor pueda negociar distinto sin caos operativo.

### Requerimientos Funcionales

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| CLI-01 | Ficha de cliente | Razón social, zona, lista de precios, condición de pago, límite de crédito, observaciones |
| CLI-02 | Segmentos | Minorista, mayorista, autoservicio, supermercado, cliente estratégico |
| CLI-03 | Reglas por segmento | Acelerar alta masiva |
| CLI-04 | Importación masiva | CSV/Excel con clientes, precios, zonas y condiciones |

---

## 🛒 5. EXPERIENCIA DE PEDIDO PARA COMERCIOS CON MUCHOS PROVEEDORES

### Objetivo
Competir contra la costumbre del WhatsApp y contra el poco tiempo del cliente.

### Requerimientos Funcionales

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| EXP-01 | Home optimizada | Acceso directo a: productos frecuentes, último pedido, promos vigentes, productos con stock |
| EXP-02 | Carga de pedido múltiple | Desde catálogo, desde pedido anterior, por lista rápida por código |
| EXP-03 | Suma rápida | Botón "sumar cantidades" sin entrar al detalle del producto |
| EXP-04 | Confirmación simple | Revisar cantidades → revisar total → revisar logística → enviar |
| EXP-05 | Estado visible | Recibido → en preparación → despachado → entregado |

### Mi opinión
Esto es lo más importante de todo. Si pedir no es más rápido que WhatsApp, el cliente no cambia el hábito.

---

## ⚙️ 6. REQUERIMIENTOS NO FUNCIONALES

| ID | Requerimiento | Especificación |
|----|---------------|----------------|
| RNF-01 | Mobile first | Toda la interfaz optimizada para celular |
| RNF-02 | Rendimiento | Tiempo de carga bajo en catálogo y carrito |
| RNF-03 | Simplicidad | Máximo 3 pasos hasta confirmar pedido |
| RNF-04 | Seguridad | Roles y visibilidad estricta por cliente |
| RNF-05 | Autonomía | Backoffice simple para que el distribuidor cargue productos, clientes y precios sin desarrollador |

---

## 📅 7. FASES DE IMPLEMENTACIÓN

### Fase 1 — Imprescindible (MVP+)

| ID | Funcionalidad | Prioridad |
|----|---------------|-----------|
| 1.1 | Alta de clientes con usuario | Crítica |
| 1.2 | Listas de precios por cliente | Crítica |
| 1.3 | Zonas logísticas con costo visible | Crítica |
| 1.4 | Catálogo simple + carrito + checkout rápido | Crítica |
| 1.5 | Recompra desde pedido anterior | Alta |

### Fase 2 — Muy valioso

| ID | Funcionalidad | Prioridad |
|----|---------------|-----------|
| 2.1 | Reglas por volumen | Media |
| 2.2 | Reglas por forma de pago | Media |
| 2.3 | Promociones temporales | Media |
| 2.4 | Pedido mínimo por zona | Media |
| 2.5 | Envío bonificado por monto | Media |

### Fase 3 — Diferencial fuerte

| ID | Funcionalidad | Prioridad |
|----|---------------|-----------|
| 3.1 | Acceso rápido sin fricción (link mágico) | Baja |
| 3.2 | Carga rápida por código de producto | Baja |
| 3.3 | Analytics por cliente/zona/producto | Baja |
| 3.4 | Sugerencias automáticas de recompra | Baja |

---

## ✅ 8. CHECKLIST DE IMPLEMENTACIÓN

### Acceso y UX
- [ ] Login email + contraseña para clientes
- [ ] Link mágico de acceso rápido
- [ ] Sesión persistente ("recordarme")
- [ ] Invitación por email desde distribuidor
- [ ] Primer ingreso guiado (4 pasos)
- [ ] Carrito persistente
- [ ] Recompra desde pedido anterior

### Precios y condiciones
- [ ] Motor de precios por prioridad (4 niveles)
- [ ] Asignación de lista de precios por cliente
- [ ] Descuentos fijos y porcentuales
- [ ] Reglas por volumen de compra
- [ ] Reglas por forma de pago
- [ ] Promociones con vigencia
- [ ] Historial de cambios de precios
- [ ] Importación CSV/Excel de clientes con precios

### Logística
- [ ] Asignación cliente → zona
- [ ] Configuración por zona (costo, mínimo, tiempo, días)
- [ ] Visualización clara en checkout
- [ ] Envío bonificado por monto
- [ ] Mensajes comerciales personalizados por zona

### Backoffice distribuidor
- [ ] Ficha completa de cliente
- [ ] Segmentos de clientes
- [ ] Reglas por segmento
- [ ] Importación masiva de clientes

### Frontend cliente
- [ ] Home optimizada (frecuentes, último pedido, promos, stock)
- [ ] Catálogo con búsqueda y categorías
- [ ] Suma rápida sin entrar a detalle
- [ ] Confirmación en 3 pasos
- [ ] Estados de pedido visibles

---

## 📝 9. RESUMEN EJECUTIVO

| Área | Funcionalidades Clave |
|------|----------------------|
| **Acceso** | Login simple, link mágico, invitación, primer ingreso guiado |
| **Precios** | Motor por prioridad, descuentos, promociones, auditoría |
| **Logística** | Zonas, costos visibles, envío bonificado, mensajes comerciales |
| **Backoffice** | Ficha cliente, segmentos, importación masiva |
| **Experiencia** | Home optimizada, suma rápida, recompra, estados visibles |

### Tiempos estimados por fase

| Fase | Duración estimada |
|------|-------------------|
| Fase 1 (Imprescindible) | 3-4 semanas |
| Fase 2 (Muy valioso) | 2-3 semanas |
| Fase 3 (Diferencial) | 2 semanas |

---

## 💼 10. NOTA SOBRE MODELO COMERCIAL

Comercialmente ya tenés publicado "desde $60.000/mes". Se recomienda separar:

| Concepto | Descripción |
|----------|-------------|
| **Implementación inicial** | Setup, parametrización, carga/importación inicial, personalización de precios y zonas, soporte inicial |
| **Abono mensual** | Uso de la plataforma |

Esto permite:
- Cobrar por el trabajo de adaptación comercial
- Mantener ingresos recurrentes
- Justificar el valor de la personalización

---

**¿Necesitas que genere el código de los componentes específicos para alguna de estas funcionalidades (motor de precios, checkout rápido, recompra, etc.)?** 🚀