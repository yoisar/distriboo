"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Pagination from "@/app/components/Pagination";
import EstadoBadge from "@/app/components/EstadoBadge";
import Link from "next/link";
import type { Pedido, EstadoPedido } from "@/types";

const estadoFlow: EstadoPedido[] = [
  "pendiente",
  "confirmado",
  "en_proceso",
  "enviado",
  "entregado",
];

export default function AdminPedidosPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadPedidos();
  }, [page, authLoading, user, filtroEstado]);

  async function loadPedidos() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (filtroEstado) params.estado = filtroEstado;
      const res = await api.getPedidos(params);
      setPedidos(res.data);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  }

  async function handleEstadoChange(pedidoId: number, estado: EstadoPedido) {
    setUpdating(pedidoId);
    try {
      await api.updateEstadoPedido(pedidoId, estado);
      toast("Estado actualizado", "success");
      loadPedidos();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al actualizar", "error");
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={user} title="Gestión de Pedidos" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Gestión de Pedidos</h2>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["", "pendiente", "confirmado", "en_proceso", "enviado", "entregado", "cancelado"].map((e) => (
            <button
              key={e}
              onClick={() => { setFiltroEstado(e); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === e ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {e ? e.replace("_", " ") : "Todos"}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : pedidos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay pedidos.</p>
        ) : (
          <>
            {/* Desktop: Tabla */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cambiar Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {pedidos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{p.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.cliente?.razon_social || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(p.created_at).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">${p.total.toLocaleString("es-AR")}</td>
                        <td className="px-4 py-3">
                          <EstadoBadge estado={p.estado} />
                        </td>
                        <td className="px-4 py-3">
                          {p.estado !== "entregado" && p.estado !== "cancelado" ? (
                            <div className="flex gap-1">
                              {estadoFlow
                                .filter((_, i) => i > estadoFlow.indexOf(p.estado))
                                .slice(0, 1)
                                .map((next) => (
                                  <button
                                    key={next}
                                    onClick={() => handleEstadoChange(p.id, next)}
                                    disabled={updating === p.id}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {updating === p.id ? "..." : `→ ${next.replace("_", " ")}`}
                                  </button>
                                ))}
                              <button
                                onClick={() => handleEstadoChange(p.id, "cancelado")}
                                disabled={updating === p.id}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Final</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/pedidos/${p.id}`} className="text-blue-600 hover:underline">Ver</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Tarjetas */}
            <div className="md:hidden space-y-3">
              {pedidos.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">#{p.id}</span>
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.cliente?.razon_social || "-"}</h3>
                    </div>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Fecha</span><span className="text-gray-700 dark:text-gray-300">{new Date(p.created_at).toLocaleDateString("es-AR")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total</span><span className="font-medium text-gray-900 dark:text-gray-100">${p.total.toLocaleString("es-AR")}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {p.estado !== "entregado" && p.estado !== "cancelado" ? (
                      <>
                        {estadoFlow
                          .filter((_, i) => i > estadoFlow.indexOf(p.estado))
                          .slice(0, 1)
                          .map((next) => (
                            <button
                              key={next}
                              onClick={() => handleEstadoChange(p.id, next)}
                              disabled={updating === p.id}
                              className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updating === p.id ? "..." : `→ ${next.replace("_", " ")}`}
                            </button>
                          ))}
                        <button
                          onClick={() => handleEstadoChange(p.id, "cancelado")}
                          disabled={updating === p.id}
                          className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Estado final</span>
                    )}
                    <Link href={`/pedidos/${p.id}`} className="text-xs text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 ml-auto">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
