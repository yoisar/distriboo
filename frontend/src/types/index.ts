// Tipos base del sistema Distriboo

export interface User {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "distribuidor" | "cliente" | "revendedor";
  cliente_id: number | null;
  distribuidor_id: number | null;
  /** Relación legada (compat) */
  cliente?: Cliente;
  /** Relación multi-distribuidor: lista de clientes asociados */
  clientes?: Cliente[];
  distribuidor?: Distribuidor;
}

export interface Distribuidor {
  id: number;
  nombre_comercial: string;
  razon_social: string | null;
  email_contacto: string | null;
  telefono: string | null;
  direccion: string | null;
  activo: boolean;
  created_at?: string;
}

export interface Provincia {
  id: number;
  nombre: string;
  activo: boolean;
  zona_logistica?: ZonaLogistica;
}

export interface ZonaLogistica {
  id: number;
  provincia_id: number;
  distribuidor_id?: number;
  costo_base: number;
  costo_por_bulto: number;
  pedido_minimo: number;
  tiempo_entrega_dias: number;
  observaciones: string | null;
  activo: boolean;
  provincia?: Provincia;
}

export interface Cliente {
  id: number;
  distribuidor_id?: number;
  razon_social: string;
  email: string;
  telefono: string | null;
  provincia_id: number;
  direccion: string | null;
  cuit: string | null;
  activo: boolean;
  provincia?: Provincia;
  distribuidor?: Distribuidor;
}

export interface Producto {
  id: number;
  distribuidor_id?: number;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  formato: string | null;
  precio: number;
  stock: number;
  activo: boolean;
}

export interface PedidoDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  subtotal: number;
  costo_logistico: number;
  total: number;
  estado: EstadoPedido;
  fecha_estimada_entrega: string | null;
  observaciones: string | null;
  created_at: string;
  cliente?: Cliente;
  detalles?: PedidoDetalle[];
}

export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "en_proceso"
  | "enviado"
  | "entregado"
  | "cancelado";

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

// ── Planes, Suscripciones, Revendedores, Comisiones ──

export interface Plan {
  id: number;
  nombre: string;
  slug: string;
  precio_mensual: number;
  setup_inicial: number;
  caracteristicas: string[];
  max_productos: number | null;
  max_clientes: number | null;
  multi_vendedor: boolean;
  integraciones: boolean;
  reportes: boolean;
  orden: number;
  activo: boolean;
}

export interface Revendedor {
  id: number;
  user_id: number;
  codigo_referido: string;
  porcentaje_base: number;
  cbu: string | null;
  cvu: string | null;
  alias_bancario: string | null;
  banco: string | null;
  titular_cuenta: string | null;
  cuit: string | null;
  activo: boolean;
  user?: User;
  clientes_activos?: number;
  porcentaje_vigente?: number;
}

export interface Suscripcion {
  id: number;
  distribuidor_id: number;
  plan_id: number;
  revendedor_id: number | null;
  plazo_meses: number;
  descuento_porcentaje: number;
  precio_final_mensual: number;
  setup_pagado: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "activa" | "cancelada" | "vencida" | "pendiente";
  distribuidor?: Distribuidor;
  plan?: Plan;
  revendedor?: Revendedor;
}

export interface Comision {
  id: number;
  revendedor_id: number;
  suscripcion_id: number;
  tipo: "mensual" | "setup";
  monto_base: number;
  porcentaje_aplicado: number;
  monto_comision: number;
  mes: number;
  anio: number;
  estado: "pendiente" | "pagada";
  fecha_pago: string | null;
  observaciones: string | null;
  revendedor?: Revendedor;
  suscripcion?: Suscripcion;
}

export interface PagoRevendedor {
  id: number;
  revendedor_id: number;
  monto_total: number;
  periodo: string;
  fecha_pago: string;
  comprobante: string | null;
  observaciones: string | null;
  revendedor?: Revendedor;
}

export interface ConfiguracionComision {
  id: number;
  clave: string;
  valor: string;
  descripcion: string | null;
}

export interface DashboardRevendedor {
  clientes_activos: number;
  comisiones_acumuladas: number;
  comisiones_pendientes: number;
  porcentaje_vigente: number;
}

export interface ProyeccionRevendedor {
  clientes_activos: number;
  porcentaje_actual: number;
  ingreso_mensual_actual: number;
  proyecciones: {
    clientes_extra: number;
    total_clientes: number;
    porcentaje: number;
  }[];
}
