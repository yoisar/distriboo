// Tipos base del sistema Distriboo

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "cliente";
  cliente_id: number | null;
  cliente?: Cliente;
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
  razon_social: string;
  email: string;
  telefono: string | null;
  provincia_id: number;
  direccion: string | null;
  cuit: string | null;
  activo: boolean;
  provincia?: Provincia;
}

export interface Producto {
  id: number;
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
