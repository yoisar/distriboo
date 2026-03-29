"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppHeader from "@/app/components/AppHeader";
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
      loadPedidos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} title="Admin / Pedidos" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Pedidos</h2>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["", "pendiente", "confirmado", "en_proceso", "enviado", "entregado", "cancelado"].map((e) => (
            <button
              key={e}
              onClick={() => { setFiltroEstado(e); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === e ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {e ? e.replace("_", " ") : "Todos"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-gray-500">No hay pedidos.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cambiar Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{p.id}</td>
                      <td className="px-4 py-3 text-sm">{p.cliente?.razon_social || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(p.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">${p.total.toLocaleString("es-AR")}</td>
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
                          <span className="text-xs text-gray-400">Final</span>
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

            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  );
}
