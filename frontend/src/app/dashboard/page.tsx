"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<Record<string, number | string | null> | null>(null);

  useEffect(() => {
    if (!loading && user) {
      api.getDashboardStats().then(setStats).catch(() => {});
    }
  }, [loading, user]);

  if (loading) return <Loading />;
  if (!user) return null;

  const isAdmin = user.role === "super_admin" || user.role === "distribuidor";

  return (
    <AppLayout user={user} title={isAdmin ? "Panel de Administración" : "Panel de Cliente"} onLogout={logout}>
      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {isAdmin ? (
              <>
                <StatCard label="Total Pedidos" value={stats.total_pedidos} color="blue" />
                <StatCard label="Pendientes" value={stats.pedidos_pendientes} color="yellow" />
                <StatCard label="Ventas del Mes" value={`$${Number(stats.ventas_mes || 0).toLocaleString("es-AR")}`} color="green" />
                <StatCard label="Clientes Activos" value={stats.total_clientes} color="purple" />
                <StatCard label="Productos Activos" value={stats.total_productos} color="blue" />
                <StatCard label="Stock Bajo" value={stats.stock_bajo} color={Number(stats.stock_bajo) > 0 ? "red" : "green"} />
              </>
            ) : (
              <>
                <StatCard label="Mis Pedidos" value={stats.mis_pedidos} color="blue" />
                <StatCard label="Pendientes" value={stats.pendientes} color="yellow" />
                <StatCard label="En Camino" value={stats.en_camino} color="green" />
                <StatCard label="Último Pedido" value={stats.ultimo_pedido || "—"} color="purple" />
              </>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.role !== "super_admin" && (
            <>
              <QuickLink href="/productos" title="Catálogo de Productos" desc="Ver productos disponibles con stock y precios" />
              <QuickLink href="/pedidos/nuevo" title="Nuevo Pedido" desc="Armar un nuevo pedido con cálculo logístico" />
              <QuickLink href="/pedidos" title="Mis Pedidos" desc="Historial y seguimiento de pedidos" />
            </>
          )}

          {isAdmin && (
            <>
              <QuickLink href="/admin/productos" title="Gestionar Productos" desc="ABM de productos y gestión de stock" accent="blue" />
              <QuickLink href="/admin/clientes" title="Gestionar Clientes" desc="ABM de clientes mayoristas" accent="blue" />
              <QuickLink href="/admin/zonas" title="Zonas Logísticas" desc="Configurar costos y tiempos por provincia" accent="blue" />
              <QuickLink href="/admin/pedidos" title="Gestionar Pedidos" desc="Ver y cambiar estado de pedidos" accent="blue" />
              <QuickLink href="/admin/reportes" title="Reportes" desc="Estadísticas de ventas, clientes y stock" accent="green" />
              <QuickLink href="/admin/usuarios" title="Usuarios" desc="Gestionar usuarios y permisos del sistema" accent="purple" />
            </>
          )}

          {user.role === "super_admin" && (
            <QuickLink href="/admin/distribuidores" title="Distribuidores" desc="Gestión de distribuidores de la plataforma" accent="purple" />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string | null; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/40 border-blue-700 text-blue-300",
    green: "bg-green-900/40 border-green-700 text-green-300",
    yellow: "bg-yellow-900/40 border-yellow-700 text-yellow-300",
    red: "bg-red-900/40 border-red-700 text-red-300",
    purple: "bg-purple-900/40 border-purple-700 text-purple-300",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value ?? "—"}</p>
    </div>
  );
}

function QuickLink({ href, title, desc, accent }: { href: string; title: string; desc: string; accent?: string }) {
  const borders: Record<string, string> = { blue: "border-l-4 border-l-blue-500", green: "border-l-4 border-l-green-500", purple: "border-l-4 border-l-purple-500" };
  const border = accent ? borders[accent] || "" : "";
  return (
    <a href={href} className={`bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-700/70 transition-colors ${border}`}>
      <h3 className="text-lg font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </a>
  );
}
