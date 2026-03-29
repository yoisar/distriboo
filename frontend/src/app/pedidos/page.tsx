"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppHeader from "@/app/components/AppHeader";
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} title="Mis Pedidos" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No tenés pedidos aún.</p>
            <a
              href="/pedidos/nuevo"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Crear primer pedido
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Logística
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entrega Est.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {p.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(p.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge estado={p.estado} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ${p.subtotal.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ${p.costo_logistico.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ${p.total.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {p.fecha_estimada_entrega
                          ? new Date(
                              p.fecha_estimada_entrega
                            ).toLocaleDateString("es-AR")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
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
