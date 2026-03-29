"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Pagination from "@/app/components/Pagination";
import EstadoBadge from "@/app/components/EstadoBadge";
import Link from "next/link";
import type { Pedido } from "@/types";

export default function PedidosPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!authLoading && user) loadPedidos();
  }, [page, authLoading, user]);

  async function loadPedidos() {
    setLoading(true);
    try {
      const res = await api.getPedidos({ page: String(page) });
      setPedidos(res.data);
      setLastPage(res.last_page);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={user} title="Mis Pedidos" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No tenés pedidos aún.</p>
            <a
              href="/pedidos/nuevo"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Crear primer pedido
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Logística</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entrega Est.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {pedidos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{p.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(p.created_at).toLocaleDateString("es-AR")}</td>
                        <td className="px-6 py-4"><EstadoBadge estado={p.estado} /></td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${p.subtotal.toLocaleString("es-AR")}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${p.costo_logistico.toLocaleString("es-AR")}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">${p.total.toLocaleString("es-AR")}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {p.fecha_estimada_entrega ? new Date(p.fecha_estimada_entrega).toLocaleDateString("es-AR") : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link href={`/pedidos/${p.id}`} className="text-blue-600 hover:underline">Ver</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                {pedidos.map((p) => (
                  <Link key={p.id} href={`/pedidos/${p.id}`} className="block p-4 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Pedido #{p.id}</span>
                      <EstadoBadge estado={p.estado} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{new Date(p.created_at).toLocaleDateString("es-AR")}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">${p.total.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Sub: ${p.subtotal.toLocaleString("es-AR")} + Log: ${p.costo_logistico.toLocaleString("es-AR")}</span>
                      <span>{p.fecha_estimada_entrega ? new Date(p.fecha_estimada_entrega).toLocaleDateString("es-AR") : ""}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
