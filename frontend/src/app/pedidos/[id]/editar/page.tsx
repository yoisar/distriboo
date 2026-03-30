"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { Pedido, Producto, CartItem, ZonaLogistica } from "@/types";

export default function EditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [zona, setZona] = useState<ZonaLogistica | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user || !id) return;

    Promise.all([
      api.getPedido(Number(id)),
      api.getProductos({ per_page: "100" }),
      api.getZonasLogisticas({ per_page: "100" }),
    ])
      .then(([pedidoData, prodData, zonasRes]) => {
        if (pedidoData.estado !== "pendiente") {
          router.replace(`/pedidos/${id}`);
          return;
        }
        setPedido(pedidoData);
        setProductos(prodData.data.filter((p) => p.activo));
        setObservaciones(pedidoData.observaciones || "");

        // Reconstruir carrito desde los detalles del pedido
        const cartItems: CartItem[] = (pedidoData.detalles || []).map((d) => ({
          producto: d.producto || { id: d.producto_id, nombre: "", precio: d.precio_unitario, stock: 999, activo: true } as Producto,
          cantidad: d.cantidad,
        }));
        setCart(cartItems);

        if (user.cliente?.provincia_id) {
          const z = zonasRes.data.find((z) => z.provincia_id === user.cliente?.provincia_id);
          if (z) setZona(z);
        }
      })
      .catch(() => setError("No se pudo cargar el pedido."))
      .finally(() => setLoading(false));
  }, [authLoading, user, id]);

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

  const subtotal = cart.reduce((sum, c) => sum + Number(c.producto.precio) * c.cantidad, 0);
  const totalBultos = cart.reduce((sum, c) => sum + c.cantidad, 0);
  const costoLogistico = zona ? Number(zona.costo_base) + Number(zona.costo_por_bulto) * totalBultos : 0;
  const total = subtotal + costoLogistico;
  const pedidoMinimo = Number(zona?.pedido_minimo ?? 0);
  const cumpleMinimo = subtotal >= pedidoMinimo;

  async function handleSubmit() {
    if (cart.length === 0) return;
    if (!cumpleMinimo) {
      setError(`El pedido mínimo para tu zona es $${pedidoMinimo.toLocaleString("es-AR")}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.updatePedido(Number(id), {
        items: cart.map((c) => ({ producto_id: c.producto.id, cantidad: c.cantidad })),
        observaciones: observaciones || undefined,
      });
      toast("Pedido actualizado", "success");
      router.push(`/pedidos/${id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al actualizar el pedido", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <Loading />;

  if (!pedido) {
    return (
      <AppLayout user={user} title="Editar Pedido" onLogout={logout}>
        <div className="max-w-6xl mx-auto">
          <p className="text-red-500 dark:text-red-400">{error || "Pedido no encontrado"}</p>
        </div>
      </AppLayout>
    );
  }

  // Productos disponibles que no estén ya en el carrito
  const productosDisponibles = productos.filter(
    (p) => p.stock > 0 && !cart.find((c) => c.producto.id === p.id)
  );

  return (
    <AppLayout user={user} title={`Editar Pedido #${id}`} onLogout={logout}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Catálogo */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Agregar productos</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {productosDisponibles.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.marca} {p.formato && `· ${p.formato}`}</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">${Number(p.precio).toLocaleString("es-AR")}</p>
                    <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                  </div>
                  <button onClick={() => addToCart(p)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700">
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Carrito */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pedido actual</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4 shadow-sm">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">El carrito está vacío</p>
              ) : (
                cart.map((item) => (
                  <div key={item.producto.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-gray-800 dark:text-gray-200">{item.producto.nombre}</p>
                      <p className="text-xs text-gray-500">${Number(item.producto.precio).toLocaleString("es-AR")} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)} className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">-</button>
                      <span className="w-8 text-center text-gray-800 dark:text-gray-200">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)} className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.producto.id)} className="text-red-500 hover:text-red-600 text-xs"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))
              )}

              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                rows={2}
              />

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="text-gray-800 dark:text-gray-200">${subtotal.toLocaleString("es-AR")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Logística</span><span className="text-gray-800 dark:text-gray-200">${costoLogistico.toLocaleString("es-AR")}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2"><span className="text-gray-900 dark:text-gray-100">Total</span><span className="text-gray-900 dark:text-gray-100">${total.toLocaleString("es-AR")}</span></div>
                {!cumpleMinimo && pedidoMinimo > 0 && (
                  <p className="text-xs text-red-500">Mínimo: ${pedidoMinimo.toLocaleString("es-AR")}</p>
                )}
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0 || !cumpleMinimo}
                className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </button>

              <a href={`/pedidos/${id}`} className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                Cancelar
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
