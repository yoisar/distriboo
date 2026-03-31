"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { DashboardRevendedor, Revendedor } from "@/types";

export default function RevendedorDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardRevendedor | null>(null);
  const [perfil, setPerfil] = useState<Revendedor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "revendedor") return;
      Promise.all([
        api.getRevendedorDashboard().then(setDashboard),
        api.getRevendedorPerfil().then(setPerfil),
      ]).catch(() => {}).finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  if (authLoading) return <Loading />;
  if (!user || user.role !== "revendedor") return null;

  return (
    <AppLayout user={user} title="Dashboard Revendedor" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Loading />
        ) : dashboard ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Clientes Activos" value={dashboard.clientes_activos} color="blue" />
              <StatCard label="Comisiones Pendientes" value={`$${Number(dashboard.comisiones_pendientes).toLocaleString("es-AR")}`} color="yellow" />
              <StatCard label="Acumuladas" value={`$${Number(dashboard.comisiones_acumuladas).toLocaleString("es-AR")}`} color="green" />
              <StatCard label="% Comisión Actual" value={`${dashboard.porcentaje_vigente}%`} color="purple" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Tu Código de Referido</h3>
              <div className="flex items-center gap-4">
                <code className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-lg font-mono text-blue-600 dark:text-blue-400">
                  {perfil?.codigo_referido}
                </code>
                <button
                  onClick={() => perfil && navigator.clipboard.writeText(perfil.codigo_referido)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Copiar
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Comparte este código con nuevos distribuidores para ganar comisiones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickLink href="/revendedor/mis-clientes" title="Mis Clientes" desc="Ver distribuidores referidos y su estado" />
              <QuickLink href="/revendedor/comisiones" title="Comisiones" desc="Historial de comisiones generadas" />
              <QuickLink href="/revendedor/liquidaciones" title="Liquidaciones" desc="Pagos recibidos y pendientes" />
            </div>
          </>
        ) : (
          <p className="text-gray-500">No se pudieron cargar los datos.</p>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    green: "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300",
    yellow: "bg-yellow-50 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300",
    purple: "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
    </a>
  );
}
