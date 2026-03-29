"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppHeader from "@/app/components/AppHeader";
import Loading from "@/app/components/Loading";
import type { Pedido, Producto, CartItem, ZonaLogistica } from "@/types";

export default function EditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
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
      api.getZonasLogisticas(),
    ])
      .then(([pedidoData, prodData, zonas]) => {
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
          const z = zonas.find((z) => z.provincia_id === user.cliente?.provincia_id);
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

  const subtotal = cart.reduce((sum, c) => sum + c.producto.precio * c.cantidad, 0);
  const totalBultos = cart.reduce((sum, c) => sum + c.cantidad, 0);
  const costoLogistico = zona ? zona.costo_base + zona.costo_por_bulto * totalBultos : 0;
  const total = subtotal + costoLogistico;
  const pedidoMinimo = zona?.pedido_minimo || 0;
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
      router.push(`/pedidos/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el pedido");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <Loading />;

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} title="Editar Pedido" onLogout={logout} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-red-500">{error || "Pedido no encontrado"}</p>
        </main>
      </div>
    );
  }

  // Productos disponibles que no estén ya en el carrito
  const productosDisponibles = productos.filter(
    (p) => p.stock > 0 && !cart.find((c) => c.producto.id === p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} title={`Editar Pedido #${id}`} onLogout={logout} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Catálogo */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Agregar productos</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {productosDisponibles.map((p) => (
                <div key={p.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.marca} {p.formato && `· ${p.formato}`}</p>
                    <p className="text-sm font-semibold text-green-600">${Number(p.precio).toLocaleString("es-AR")}</p>
                    <p className="text-xs text-gray-400">Stock: {p.stock}</p>
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
            <h3 className="text-lg font-semibold mb-4">Pedido actual</h3>
            <div className="bg-white border rounded-xl p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">El carrito está vacío</p>
              ) : (
                cart.map((item) => (
                  <div key={item.producto.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.producto.nombre}</p>
                      <p className="text-xs text-gray-500">${Number(item.producto.precio).toLocaleString("es-AR")} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)} className="w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">-</button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)} className="w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.producto.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))
              )}

              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones..."
                className="w-full border rounded-lg p-2 text-sm"
                rows={2}
              />

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toLocaleString("es-AR")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Logística</span><span>${costoLogistico.toLocaleString("es-AR")}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>${total.toLocaleString("es-AR")}</span></div>
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

              <a href={`/pedidos/${id}`} className="block text-center text-sm text-gray-500 hover:text-gray-700">
                Cancelar
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
