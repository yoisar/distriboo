"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PedidosMes {
  mes: string;
  total_pedidos: number;
  monto_total: number;
}

interface PedidosProvincia {
  provincia: string;
  total_pedidos: number;
  monto_total: number;
}

interface ProductoTop {
  nombre: string;
  total_vendido: number;
  monto_total: number;
}

export default function DashboardCharts() {
  const [pedidosMes, setPedidosMes] = useState<PedidosMes[]>([]);
  const [pedidosProv, setPedidosProv] = useState<PedidosProvincia[]>([]);
  const [topProductos, setTopProductos] = useState<ProductoTop[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getReportePedidosPorMes().catch(() => []),
      api.getReportePedidosPorProvincia().catch(() => []),
      api.getReporteProductosMasVendidos().catch(() => []),
    ]).then(([mes, prov, prod]) => {
      setPedidosMes(mes as PedidosMes[]);
      setPedidosProv((prov as PedidosProvincia[]).slice(0, 8));
      setTopProductos((prod as ProductoTop[]).slice(0, 5));
      setLoadingCharts(false);
    });
  }, []);

  if (loadingCharts) {
    return (
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const mesLabels: Record<string, string> = {
    "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
  };

  const chartMes = pedidosMes.map((d) => ({
    ...d,
    label: mesLabels[d.mes.split("-")[1]] || d.mes,
  }));

  return (
    <div className="space-y-6 mb-8">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pedidos por Mes - Area Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Pedidos por Mes
          </h3>
          {chartMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartMes}>
                <defs>
                  <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total_pedidos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorPedidos)"
                  name="Pedidos"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="Sin datos de pedidos mensuales" />
          )}
        </div>

        {/* Pedidos por Provincia - Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Pedidos por Provincia
          </h3>
          {pedidosProv.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pedidosProv}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="provincia"
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total_pedidos" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="Sin datos de pedidos por provincia" />
          )}
        </div>
      </div>

      {/* Top Productos */}
      {topProductos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Productos Más Vendidos
            </h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unidades</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {topProductos.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{p.nombre}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600 dark:text-gray-300">{Number(p.total_vendido).toLocaleString("es-AR")}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600 dark:text-gray-300">${Number(p.monto_total).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
      <div className="h-62.5 bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse" />
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-62.5 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
      {text}
    </div>
  );
}
