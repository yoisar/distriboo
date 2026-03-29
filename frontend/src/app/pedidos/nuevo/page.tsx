"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { Producto, CartItem, ZonaLogistica } from "@/types";

export default function NuevoPedidoPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [zona, setZona] = useState<ZonaLogistica | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState<string>("todas");

  useEffect(() => {
    if (authLoading || !user) return;

    Promise.all([
      api.getProductos({ per_page: "200", activo: "1" }),
      api.getZonasLogisticas({ per_page: "100" }),
    ])
      .then(([prodData, zonasRes]) => {
        setProductos(prodData.data.filter((p) => p.activo && Number(p.stock ?? 0) > 0));
        if (user.cliente?.provincia_id) {
          const z = zonasRes.data.find(
            (z) => z.provincia_id === user.cliente?.provincia_id
          );
          if (z) setZona(z);
        }
      })
      .catch(() => setError("Error al cargar el catálogo. Intentá recargar la página."))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  const marcas = useMemo(() => {
    const set = new Set(productos.map((p) => p.marca).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchSearch = search.trim() === "" ||
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.marca ?? "").toLowerCase().includes(search.toLowerCase());
      const matchMarca = marcaFiltro === "todas" || p.marca === marcaFiltro;
      return matchSearch && matchMarca;
    });
  }, [productos, search, marcaFiltro]);

  function addToCart(producto: Producto) {
    setCart((prev) => {
      const existing = prev.find((c) => c.producto.id === producto.id);
      if (existing) {
        return prev.map((c) =>
          c.producto.id === producto.id
            ? { ...c, cantidad: Math.min(c.cantidad + 1, producto.stock) }
            : c
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function updateQuantity(productoId: number, cantidad: number) {
    if (cantidad <= 0) {
      setCart((prev) => prev.filter((c) => c.producto.id !== productoId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.producto.id === productoId
          ? { ...c, cantidad: Math.min(cantidad, c.producto.stock) }
          : c
      )
    );
  }

  function removeFromCart(productoId: number) {
    setCart((prev) => prev.filter((c) => c.producto.id !== productoId));
  }

  const subtotal = cart.reduce(
    (sum, c) => sum + Number(c.producto.precio) * c.cantidad,
    0
  );
  const totalBultos = cart.reduce((sum, c) => sum + c.cantidad, 0);
  const costoLogistico = zona
    ? Number(zona.costo_base) + Number(zona.costo_por_bulto) * totalBultos
    : 0;
  const total = subtotal + costoLogistico;
  const pedidoMinimo = Number(zona?.pedido_minimo ?? 0);
  const cumpleMinimo = pedidoMinimo === 0 || subtotal >= pedidoMinimo;
  const progresoMinimo = pedidoMinimo > 0
    ? Math.min((subtotal / pedidoMinimo) * 100, 100)
    : 100;

  async function handleSubmit() {
    if (!user?.cliente_id) {
      setError("Tu usuario no tiene un cliente asociado. Contactá al administrador.");
      return;
    }
    if (cart.length === 0) return;
    if (!cumpleMinimo) {
      setError(
        `El pedido mínimo para tu zona es $${pedidoMinimo.toLocaleString("es-AR")}`
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.createPedido({
        cliente_id: user.cliente_id,
        items: cart.map((c) => ({
          producto_id: c.producto.id,
          cantidad: c.cantidad,
        })),
        observaciones: observaciones || undefined,
      });
      toast("Pedido realizado con éxito", "success");
      setCart([]);
      setTimeout(() => router.push("/pedidos"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear pedido");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading)
    return <Loading />;

  return (
    <AppLayout user={user} title="Nuevo Pedido" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Catálogo ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Buscador + filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex gap-3 mb-3">
                {/* Buscador */}
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar producto o marca…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Chips de marca */}
              {marcas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMarcaFiltro("todas")}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      marcaFiltro === "todas"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    Todas
                  </button>
                  {marcas.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarcaFiltro(marcaFiltro === m ? "todas" : m)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        marcaFiltro === m
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resultados */}
            <p className="text-xs text-gray-500 dark:text-gray-400 -mb-2 px-1">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}
              {search || marcaFiltro !== "todas" ? " encontrados" : " disponibles"}
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Grid de productos */}
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
                <p className="text-sm">No hay productos para tu búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {productosFiltrados.map((p) => {
                  const inCart = cart.find((c) => c.producto.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm flex flex-col transition-all ${
                        inCart
                          ? "border-blue-500 ring-1 ring-blue-500/25"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="p-4 flex-1">
                        {/* Marca */}
                        {p.marca && (
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400 mb-1">
                            {p.marca}
                          </span>
                        )}
                        {/* Nombre */}
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug text-sm">
                          {p.nombre}
                        </h3>
                        {/* Formato */}
                        {p.formato && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.formato}</p>
                        )}
                        {/* Precio + stock */}
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                            ${Number(p.precio ?? 0).toLocaleString("es-AR")}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {p.stock} en stock
                          </span>
                        </div>
                      </div>

                      {/* Control */}
                      <div className="px-4 pb-4">
                        {inCart ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(p.id, inCart.cantidad - 1)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-medium"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={p.stock}
                              value={inCart.cantidad}
                              onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v)) updateQuantity(p.id, v);
                              }}
                              className="flex-1 h-9 text-center text-sm font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => updateQuantity(p.id, inCart.cantidad + 1)}
                              disabled={inCart.cantidad >= p.stock}
                              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-medium disabled:opacity-40"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(p.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                              title="Quitar del pedido"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(p)}
                            className="w-full h-9 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Resumen del pedido ── */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-20">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-gray-100">
                  Mi pedido
                </h2>
                {cart.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.reduce((s, c) => s + c.cantidad, 0)} items
                  </span>
                )}
              </div>

              <div className="px-5 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Seleccioná productos del catálogo
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Items del carrito */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.producto.id}
                          className="flex items-center gap-2 text-sm group"
                        >
                          {/* Qty control compacto */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-base leading-none"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={item.producto.stock}
                              value={item.cantidad}
                              onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v)) updateQuantity(item.producto.id, v);
                              }}
                              className="w-10 h-6 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.producto.stock}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-base leading-none disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          {/* Nombre + precio */}
                          <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">
                            {item.producto.nombre}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 shrink-0">
                            ${(Number(item.producto.precio) * item.cantidad).toLocaleString("es-AR")}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.producto.id)}
                            className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 shrink-0"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Totales */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                        <span className="text-gray-800 dark:text-gray-200">${subtotal.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Logística ({totalBultos} bulto{totalBultos !== 1 ? "s" : ""})
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">${costoLogistico.toLocaleString("es-AR")}</span>
                      </div>
                      {zona && (
                        <div className="text-xs text-gray-400">
                          📦 Entrega en {zona.tiempo_entrega_dias} días hábiles
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                        <span className="text-gray-900 dark:text-gray-100">Total</span>
                        <span className="text-gray-900 dark:text-gray-100">${total.toLocaleString("es-AR")}</span>
                      </div>
                    </div>

                    {/* Progreso pedido mínimo */}
                    {pedidoMinimo > 0 && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={cumpleMinimo ? "text-green-600 dark:text-green-400 font-medium" : "text-amber-600 dark:text-amber-400"}>
                            {cumpleMinimo ? "✓ Pedido mínimo alcanzado" : `Mínimo: $${pedidoMinimo.toLocaleString("es-AR")}`}
                          </span>
                          {!cumpleMinimo && (
                            <span className="text-amber-600 dark:text-amber-400">
                              Faltan ${(pedidoMinimo - subtotal).toLocaleString("es-AR")}
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              cumpleMinimo ? "bg-green-500" : "bg-amber-400"
                            }`}
                            style={{ width: `${progresoMinimo}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    <textarea
                      placeholder="Observaciones (opcional)"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !cumpleMinimo || cart.length === 0}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Enviando…
                        </span>
                      ) : "Confirmar Pedido"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
