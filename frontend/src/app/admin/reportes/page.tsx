"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppHeader from "@/app/components/AppHeader";
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} title="Admin / Reportes" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportes</h2>

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (data as unknown[]).length === 0 ? (
          <p className="text-gray-500">Sin datos para mostrar.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {activeTab === "provincias" && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data as PedidosPorProvincia[]).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{d.provincia}</td>
                      <td className="px-4 py-3 text-sm">{d.total_pedidos}</td>
                      <td className="px-4 py-3 text-sm">${Number(d.total_facturado).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "productos" && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data as ProductoMasVendido[]).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{d.producto}</td>
                      <td className="px-4 py-3 text-sm">{d.total_vendido}</td>
                      <td className="px-4 py-3 text-sm">${Number(d.total_facturado).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "clientes" && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data as ClienteTop[]).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{d.cliente}</td>
                      <td className="px-4 py-3 text-sm">{d.total_pedidos}</td>
                      <td className="px-4 py-3 text-sm">${Number(d.total_facturado).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "stock" && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data as Producto[]).map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{d.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${d.stock <= 5 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {d.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">${d.precio.toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
