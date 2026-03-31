"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";

interface ClienteReferido {
  id: number;
  nombre_comercial: string;
  plan: string;
  estado: string;
  fecha_alta: string;
  comision_mensual: number;
}

export default function RevendedorMisClientesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [clientes, setClientes] = useState<ClienteReferido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "revendedor") return;
      api.getRevendedorClientes()
        .then((data) => setClientes(data as ClienteReferido[]))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  if (authLoading) return <Loading />;
  if (!user || user.role !== "revendedor") return null;

  return (
    <AppLayout user={user} title="Mis Clientes" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Loading />
        ) : clientes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aún no tienes clientes referidos.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Comparte tu código de referido para empezar a ganar comisiones.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Distribuidor</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Plan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Fecha Alta</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Comisión Mensual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{c.nombre_comercial}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.plan}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.estado === "activa" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.fecha_alta}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                        ${Number(c.comision_mensual).toLocaleString("es-AR")}
                      </td>
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
