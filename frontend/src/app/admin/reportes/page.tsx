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
  total_facturado: number;
}

interface ProductoMasVendido {
  producto: string;
  total_vendido: number;
  total_facturado: number;
}

interface ClienteTop {
  cliente: string;
  total_pedidos: number;
  total_facturado: number;
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
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Reportes</h2>

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-blue-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (data as unknown[]).length === 0 ? (
          <p className="text-gray-400">Sin datos para mostrar.</p>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {activeTab === "provincias" && (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Provincia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pedidos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(data as PedidosPorProvincia[]).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-200">{d.provincia}</td>
                      <td className="px-4 py-3 text-sm">{d.total_pedidos}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">${Number(d.total_facturado).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "productos" && (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Unidades</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(data as ProductoMasVendido[]).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-200">{d.producto}</td>
                      <td className="px-4 py-3 text-sm">{d.total_vendido}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">${Number(d.total_facturado).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "clientes" && (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pedidos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(data as ClienteTop[]).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-200">{d.cliente}</td>
                      <td className="px-4 py-3 text-sm">{d.total_pedidos}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">${Number(d.total_facturado).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "stock" && (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(data as Producto[]).map((d) => (
                    <tr key={d.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-200">{d.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${d.stock <= 5 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {d.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">${d.precio.toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
