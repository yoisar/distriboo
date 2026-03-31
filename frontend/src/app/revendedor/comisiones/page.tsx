"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Pagination from "@/app/components/Pagination";
import type { Comision } from "@/types";

export default function RevendedorComisionesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "revendedor") return;
      loadData();
    }
  }, [authLoading, user, page, filtroEstado]);

  async function loadData() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (filtroEstado) params.estado = filtroEstado;
      const res = await api.getRevendedorComisiones(params);
      setComisiones(res.data);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <Loading />;
  if (!user || user.role !== "revendedor") return null;

  return (
    <AppLayout user={user} title="Mis Comisiones" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagada">Pagadas</option>
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : comisiones.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No hay comisiones registradas.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Mes/Año</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tipo</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Base</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">%</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Comisión</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {comisiones.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{c.mes}/{c.anio}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.tipo === "setup" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}>
                          {c.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">${Number(c.monto_base).toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{c.porcentaje_aplicado}%</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">${Number(c.monto_comision).toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.estado === "pagada" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}>
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
      </div>
    </AppLayout>
  );
}
