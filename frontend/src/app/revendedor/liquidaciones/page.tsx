"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { PagoRevendedor } from "@/types";

export default function RevendedorLiquidacionesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [liquidaciones, setLiquidaciones] = useState<PagoRevendedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "revendedor") return;
      api.getRevendedorLiquidaciones()
        .then((res) => setLiquidaciones(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  if (authLoading) return <Loading />;
  if (!user || user.role !== "revendedor") return null;

  return (
    <AppLayout user={user} title="Liquidaciones" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Loading />
        ) : liquidaciones.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No hay liquidaciones registradas aún.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Período</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Monto Total</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Fecha de Pago</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {liquidaciones.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{l.periodo}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                        ${Number(l.monto_total).toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.fecha_pago}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.comprobante || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
