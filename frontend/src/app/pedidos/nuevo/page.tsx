"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (authLoading || !user) return;

    Promise.all([
      api.getProductos({ per_page: "100" }),
      api.getZonasLogisticas({ per_page: "100" }),
    ])
      .then(([prodData, zonasRes]) => {
        setProductos(prodData.data.filter((p) => p.activo && p.stock > 0));
        if (user.cliente?.provincia_id) {
          const z = zonasRes.data.find(
            (z) => z.provincia_id === user.cliente?.provincia_id
          );
          if (z) setZona(z);
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

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
    (sum, c) => sum + c.producto.precio * c.cantidad,
    0
  );
  const totalBultos = cart.reduce((sum, c) => sum + c.cantidad, 0);
  const costoLogistico = zona
    ? zona.costo_base + zona.costo_por_bulto * totalBultos
    : 0;
  const total = subtotal + costoLogistico;
  const pedidoMinimo = zona?.pedido_minimo || 0;
  const cumpleMinimo = subtotal >= pedidoMinimo;

  async function handleSubmit() {
    if (!user?.cliente_id || cart.length === 0) return;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Catálogo */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Seleccioná productos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productos.map((p) => {
                const inCart = cart.find((c) => c.producto.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm ${inCart ? "border-blue-500 ring-1 ring-blue-500/30" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {p.nombre}
                        </h3>
                        {p.formato && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.formato}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        ${p.precio.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Stock: {p.stock}
                      </span>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(p.id, inCart.cantidad - 1)
                            }
                            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            -
                          </button>
                          <span className="font-medium w-8 text-center text-gray-800 dark:text-gray-200">
                            {inCart.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(p.id, inCart.cantidad + 1)
                            }
                            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(p.id)}
                            className="text-red-500 text-sm ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Resumen del Pedido
              </h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Agregá productos al pedido
                </p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.producto.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.producto.nombre} x{item.cantidad}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          $
                          {(
                            item.producto.precio * item.cantidad
                          ).toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-800 dark:text-gray-200">${subtotal.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Costo logístico ({totalBultos} bultos)
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">${costoLogistico.toLocaleString("es-AR")}</span>
                    </div>
                    {zona && (
                      <div className="text-xs text-gray-500">
                        Entrega estimada: {zona.tiempo_entrega_dias} días
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span className="text-gray-900 dark:text-gray-100">Total</span>
                      <span className="text-gray-900 dark:text-gray-100">${total.toLocaleString("es-AR")}</span>
                    </div>
                  </div>

                  {!cumpleMinimo && (
                    <p className="text-red-500 text-xs mt-2">
                      Pedido mínimo: ${pedidoMinimo.toLocaleString("es-AR")}
                    </p>
                  )}

                  <div className="mt-4">
                    <textarea
                      placeholder="Observaciones (opcional)"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !cumpleMinimo}
                    className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Enviando..." : "Confirmar Pedido"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
