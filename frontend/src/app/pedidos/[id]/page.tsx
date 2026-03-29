"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppHeader from "@/app/components/AppHeader";
import Loading from "@/app/components/Loading";
import EstadoBadge from "@/app/components/EstadoBadge";
import Link from "next/link";
import type { Pedido } from "@/types";

export default function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, logout } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && user && id) loadPedido();
  }, [authLoading, user, id]);

  async function loadPedido() {
    setLoading(true);
    try {
      const data = await api.getPedido(Number(id));
      setPedido(data);
    } catch {
      setError("No se pudo cargar el pedido.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} title={`Pedido #${id}`} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : pedido ? (
          <>
            {/* Cabecera */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Pedido #{pedido.id}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(pedido.created_at).toLocaleDateString("es-AR", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <EstadoBadge estado={pedido.estado} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Cliente</span>
                  <p className="font-medium">{pedido.cliente?.razon_social || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Provincia</span>
                  <p className="font-medium">{pedido.cliente?.provincia?.nombre || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Entrega estimada</span>
                  <p className="font-medium">
                    {pedido.fecha_estimada_entrega
                      ? new Date(pedido.fecha_estimada_entrega).toLocaleDateString("es-AR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Observaciones</span>
                  <p className="font-medium">{pedido.observaciones || "-"}</p>
                </div>
              </div>
            </div>

            {/* Detalle de ítems */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pedido.detalles?.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{d.producto?.nombre || `Producto #${d.producto_id}`}</td>
                      <td className="px-4 py-3 text-sm text-right">${Number(d.precio_unitario).toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3 text-sm text-right">{d.cantidad}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">${Number(d.subtotal).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${Number(pedido.subtotal).toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Costo logístico</span>
                  <span>${Number(pedido.costo_logistico).toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${Number(pedido.total).toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <a href="/pedidos" className="text-blue-600 hover:underline text-sm">&larr; Volver a pedidos</a>
              {pedido.estado === "pendiente" && (
                <Link
                  href={`/pedidos/${pedido.id}/editar`}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600"
                >
                  Editar Pedido
                </Link>
              )}
              {pedido.estado === "pendiente" && (
                <button
                  disabled={cancelling}
                  onClick={async () => {
                    if (!confirm("¿Estás seguro de cancelar este pedido?")) return;
                    setCancelling(true);
                    try {
                      const updated = await api.cancelarPedido(pedido.id);
                      setPedido(updated);
                    } catch {
                      alert("No se pudo cancelar el pedido");
                    } finally {
                      setCancelling(false);
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  {cancelling ? "Cancelando..." : "Cancelar Pedido"}
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    await api.downloadPedidoPdf(pedido.id);
                  } catch {
                    alert("No se pudo descargar el PDF");
                  }
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
              >
                Descargar PDF
              </button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
