const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("distriboo_token", token);
      } else {
        localStorage.removeItem("distriboo_token");
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("distriboo_token");
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("No autorizado");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ user: import("@/types").User; token: string }>(
      "/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  }

  logout() {
    return this.request("/logout", { method: "POST" });
  }

  getUser() {
    return this.request<import("@/types").User>("/user");
  }

  // Dashboard
  getDashboardStats() {
    return this.request<Record<string, number | string | null>>("/dashboard/stats");
  }

  // Productos
  getProductos(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<import("@/types").PaginatedResponse<import("@/types").Producto>>(
      `/productos${query}`
    );
  }

  getProducto(id: number) {
    return this.request<import("@/types").Producto>(`/productos/${id}`);
  }

  createProducto(data: Partial<import("@/types").Producto>) {
    return this.request<import("@/types").Producto>("/productos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateProducto(id: number, data: Partial<import("@/types").Producto>) {
    return this.request<import("@/types").Producto>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteProducto(id: number) {
    return this.request(`/productos/${id}`, { method: "DELETE" });
  }

  // Clientes
  getClientes(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<import("@/types").PaginatedResponse<import("@/types").Cliente>>(
      `/clientes${query}`
    );
  }

  createCliente(data: Partial<import("@/types").Cliente>) {
    return this.request<import("@/types").Cliente>("/clientes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateCliente(id: number, data: Partial<import("@/types").Cliente>) {
    return this.request<import("@/types").Cliente>(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteCliente(id: number) {
    return this.request(`/clientes/${id}`, { method: "DELETE" });
  }

  // Provincias
  getProvincias() {
    return this.request<import("@/types").Provincia[]>("/provincias");
  }

  // Zonas logísticas
  getZonasLogisticas(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<import("@/types").PaginatedResponse<import("@/types").ZonaLogistica>>(
      `/zonas-logisticas${query}`
    );
  }

  createZonaLogistica(data: Partial<import("@/types").ZonaLogistica>) {
    return this.request<import("@/types").ZonaLogistica>("/zonas-logisticas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateZonaLogistica(id: number, data: Partial<import("@/types").ZonaLogistica>) {
    return this.request<import("@/types").ZonaLogistica>(`/zonas-logisticas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Pedidos
  getPedidos(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<import("@/types").PaginatedResponse<import("@/types").Pedido>>(
      `/pedidos${query}`
    );
  }

  getPedido(id: number) {
    return this.request<import("@/types").Pedido>(`/pedidos/${id}`);
  }

  createPedido(data: {
    cliente_id: number;
    items: { producto_id: number; cantidad: number }[];
    observaciones?: string;
  }) {
    return this.request<import("@/types").Pedido>("/pedidos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateEstadoPedido(id: number, estado: import("@/types").EstadoPedido) {
    return this.request<import("@/types").Pedido>(`/pedidos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    });
  }

  cancelarPedido(id: number) {
    return this.request<import("@/types").Pedido>(`/pedidos/${id}/cancelar`, {
      method: "PUT",
    });
  }

  updatePedido(id: number, data: {
    items: { producto_id: number; cantidad: number }[];
    observaciones?: string;
  }) {
    return this.request<import("@/types").Pedido>(`/pedidos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // PDF
  async downloadPedidoPdf(id: number) {
    const token = this.getToken();
    const response = await fetch(`${API_URL}/pedidos/${id}/pdf`, {
      headers: {
        Accept: "application/pdf",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedido-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  // Reportes
  getReportePedidosPorProvincia() {
    return this.request("/reportes/pedidos-por-provincia");
  }

  getReporteProductosMasVendidos() {
    return this.request("/reportes/productos-mas-vendidos");
  }

  getReporteClientesTop() {
    return this.request("/reportes/clientes-top");
  }

  getReporteStockBajo() {
    return this.request<import("@/types").Producto[]>("/reportes/stock-bajo");
  }

  getReportePedidosPorMes() {
    return this.request<{ mes: string; total_pedidos: number; monto_total: number }[]>("/reportes/pedidos-por-mes");
  }

  // Usuarios
  getUsers(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<import("@/types").PaginatedResponse<import("@/types").User>>(
      `/users${query}`
    );
  }

  createUser(data: { name: string; email: string; password: string; role: string; cliente_id?: number | null }) {
    return this.request<import("@/types").User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateUser(id: number, data: Partial<{ name: string; email: string; password: string; role: string; cliente_id: number | null }>) {
    return this.request<import("@/types").User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteUser(id: number) {
    return this.request(`/users/${id}`, { method: "DELETE" });
  }

  // Distribuidores (super_admin)
  getDistribuidores(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<import("@/types").PaginatedResponse<import("@/types").Distribuidor>>(
      `/distribuidores${query}`
    );
  }

  getDistribuidor(id: number) {
    return this.request<import("@/types").Distribuidor>(`/distribuidores/${id}`);
  }

  createDistribuidor(data: Partial<import("@/types").Distribuidor>) {
    return this.request<import("@/types").Distribuidor>("/distribuidores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateDistribuidor(id: number, data: Partial<import("@/types").Distribuidor>) {
    return this.request<import("@/types").Distribuidor>(`/distribuidores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteDistribuidor(id: number) {
    return this.request(`/distribuidores/${id}`, { method: "DELETE" });
  }

  // ── Importación CSV ───────────────────────────────────────────────────────

  async importarProductos(archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const token = this.getToken();
    const response = await fetch(`${API_URL}/importar/productos`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }
    return response.json() as Promise<{ message: string; creados: number; actualizados: number; errores: string[] }>;
  }

  async importarClientes(archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const token = this.getToken();
    const response = await fetch(`${API_URL}/importar/clientes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }
    return response.json() as Promise<{ message: string; creados: number; actualizados: number; errores: string[] }>;
  }

  async importarZonas(archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const token = this.getToken();
    const response = await fetch(`${API_URL}/importar/zonas`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }
    return response.json() as Promise<{ message: string; creados: number; actualizados: number; errores: string[] }>;
  }

  async descargarPlantilla(tipo: "productos" | "clientes" | "zonas") {
    const token = this.getToken();
    const response = await fetch(`${API_URL}/importar/plantilla/${tipo}`, {
      headers: {
        Accept: "text/csv",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_${tipo}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const api = new ApiClient();
