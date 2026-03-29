"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import type { ZonaLogistica, Provincia } from "@/types";

export default function AdminZonasPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const [zonas, setZonas] = useState<ZonaLogistica[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ZonaLogistica | null>(null);
  const [form, setForm] = useState({
    provincia_id: "",
    costo_base: "",
    costo_por_bulto: "",
    pedido_minimo: "",
    tiempo_entrega_dias: "",
    observaciones: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [zonasRes, provinciasRes] = await Promise.all([
        api.getZonasLogisticas(),
        api.getProvincias(),
      ]);
      setZonas(zonasRes);
      setProvincias(provinciasRes);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ provincia_id: "", costo_base: "", costo_por_bulto: "", pedido_minimo: "", tiempo_entrega_dias: "", observaciones: "", activo: true });
    setShowForm(true);
    setError("");
  }

  function openEdit(z: ZonaLogistica) {
    setEditing(z);
    setForm({
      provincia_id: String(z.provincia_id),
      costo_base: String(z.costo_base),
      costo_por_bulto: String(z.costo_por_bulto),
      pedido_minimo: String(z.pedido_minimo),
      tiempo_entrega_dias: String(z.tiempo_entrega_dias),
      observaciones: z.observaciones || "",
      activo: z.activo,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const data = {
        provincia_id: parseInt(form.provincia_id),
        costo_base: parseFloat(form.costo_base),
        costo_por_bulto: parseFloat(form.costo_por_bulto),
        pedido_minimo: parseFloat(form.pedido_minimo),
        tiempo_entrega_dias: parseInt(form.tiempo_entrega_dias),
        observaciones: form.observaciones || null,
        activo: form.activo,
      };
      if (editing) {
        await api.updateZonaLogistica(editing.id, data);
      } else {
        await api.createZonaLogistica(data);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function getProvinciaName(id: number) {
    return provincias.find((p) => p.id === id)?.nombre || "-";
  }

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={user} title="Zonas Logísticas" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Zonas Logísticas</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nueva Zona
          </button>
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nueva"} Zona Logística`}>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <select value={form.provincia_id} onChange={(e) => setForm({ ...form, provincia_id: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500">
                  <option value="">Seleccionar provincia</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Costo base ($)" value={form.costo_base} onChange={(e) => setForm({ ...form, costo_base: e.target.value })} className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                  <input type="number" placeholder="Costo por bulto ($)" value={form.costo_por_bulto} onChange={(e) => setForm({ ...form, costo_por_bulto: e.target.value })} className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Pedido mínimo ($)" value={form.pedido_minimo} onChange={(e) => setForm({ ...form, pedido_minimo: e.target.value })} className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                  <input type="number" placeholder="Días entrega" value={form.tiempo_entrega_dias} onChange={(e) => setForm({ ...form, tiempo_entrega_dias: e.target.value })} className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                </div>
                <textarea placeholder="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" rows={2} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
        </Modal>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Provincia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Base</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">$/Bulto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mínimo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Días</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {zonas.map((z) => (
                  <tr key={z.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">{getProvinciaName(z.provincia_id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${z.costo_base.toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${z.costo_por_bulto.toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${z.pedido_minimo.toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{z.tiempo_entrega_dias}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${z.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                        {z.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => openEdit(z)} className="text-blue-600 hover:underline">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
