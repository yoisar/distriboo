"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { Producto } from "@/types";

interface PedidosPorProvincia {
  provincia: string;
  total_pedidos: number;
  monto_total: number;
}

interface ProductoMasVendido {
  nombre: string;
  total_vendido: number;
  monto_total: number;
}

interface ClienteTop {
  razon_social: string;
  total_pedidos: number;
  monto_total: number;
}

export default function AdminReportesPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const [activeTab, setActiveTab] = useState<"provincias" | "productos" | "clientes" | "stock">("provincias");
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) loadReport();
  }, [authLoading, user, activeTab]);

  async function loadReport() {
    setLoading(true);
    try {
      let result;
      switch (activeTab) {
        case "provincias":
          result = await api.getReportePedidosPorProvincia();
          break;
        case "productos":
          result = await api.getReporteProductosMasVendidos();
          break;
        case "clientes":
          result = await api.getReporteClientesTop();
          break;
        case "stock":
          result = await api.getReporteStockBajo();
          break;
      }
      setData(result as unknown[]);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { key: "provincias" as const, label: "Por Provincia" },
    { key: "productos" as const, label: "Productos Top" },
    { key: "clientes" as const, label: "Clientes Top" },
    { key: "stock" as const, label: "Stock Bajo" },
  ];

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={user} title="Reportes" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Reportes</h2>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : (data as unknown[]).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Sin datos para mostrar.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {activeTab === "provincias" && (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Provincia</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pedidos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Facturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(data as PedidosPorProvincia[]).map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{d.provincia}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{d.total_pedidos}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${Number(d.monto_total ?? 0).toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {(data as PedidosPorProvincia[]).map((d, i) => (
                    <div key={i} className="p-4 space-y-1">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{d.provincia}</h3>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Pedidos</span><span className="text-gray-700 dark:text-gray-300">{d.total_pedidos}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Facturado</span><span className="font-medium text-gray-700 dark:text-gray-300">${Number(d.monto_total ?? 0).toLocaleString("es-AR")}</span></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "productos" && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unidades</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Facturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(data as ProductoMasVendido[]).map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{d.nombre}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{d.total_vendido}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${Number(d.monto_total ?? 0).toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {(data as ProductoMasVendido[]).map((d, i) => (
                    <div key={i} className="p-4 space-y-1">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{d.nombre}</h3>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Unidades</span><span className="text-gray-700 dark:text-gray-300">{d.total_vendido}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Facturado</span><span className="font-medium text-gray-700 dark:text-gray-300">${Number(d.monto_total ?? 0).toLocaleString("es-AR")}</span></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "clientes" && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pedidos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Facturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(data as ClienteTop[]).map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{d.razon_social}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{d.total_pedidos}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${Number(d.monto_total ?? 0).toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {(data as ClienteTop[]).map((d, i) => (
                    <div key={i} className="p-4 space-y-1">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{d.razon_social}</h3>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Pedidos</span><span className="text-gray-700 dark:text-gray-300">{d.total_pedidos}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Facturado</span><span className="font-medium text-gray-700 dark:text-gray-300">${Number(d.monto_total ?? 0).toLocaleString("es-AR")}</span></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "stock" && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(data as Producto[]).map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{d.nombre}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${d.stock <= 5 ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300" : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"}`}>
                              {d.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${Number(d.precio ?? 0).toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {(data as Producto[]).map((d) => (
                    <div key={d.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{d.nombre}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">${Number(d.precio ?? 0).toLocaleString("es-AR")}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${d.stock <= 5 ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300" : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"}`}>
                        Stock: {d.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
