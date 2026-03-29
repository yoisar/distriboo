"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { ZonaLogistica, Provincia } from "@/types";

export default function AdminZonasPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [zonas, setZonas] = useState<ZonaLogistica[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, page]);

  async function loadData() {
    setLoading(true);
    try {
      const [zonasRes, provinciasRes] = await Promise.all([
        api.getZonasLogisticas({ page: String(page) }),
        api.getProvincias(),
      ]);
      setZonas(zonasRes.data);
      setLastPage(zonasRes.last_page);
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
    setFormErrors({});
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
    setFormErrors({});
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.provincia_id) errors.provincia_id = "Seleccioná una provincia";
    if (!form.costo_base || isNaN(Number(form.costo_base))) errors.costo_base = "Ingresá un costo base válido";
    if (!form.costo_por_bulto || isNaN(Number(form.costo_por_bulto))) errors.costo_por_bulto = "Ingresá un costo por bulto válido";
    if (!form.pedido_minimo || isNaN(Number(form.pedido_minimo))) errors.pedido_minimo = "Ingresá un pedido mínimo válido";
    if (!form.tiempo_entrega_dias || isNaN(Number(form.tiempo_entrega_dias))) errors.tiempo_entrega_dias = "Ingresá días de entrega válidos";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;
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
        toast("Zona actualizada", "success");
      } else {
        await api.createZonaLogistica(data);
        toast("Zona creada", "success");
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

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <AppLayout user={user} title="Zonas Logísticas" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Zonas Logísticas</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nueva Zona
          </button>
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nueva"} Zona Logística`}>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <div>
                  <select value={form.provincia_id} onChange={(e) => setForm({ ...form, provincia_id: e.target.value })} className={inputClass}>
                    <option value="">Seleccionar provincia *</option>
                    {provincias.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  {formErrors.provincia_id && <p className="text-red-500 text-xs mt-1">{formErrors.provincia_id}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="number" placeholder="Costo base ($) *" value={form.costo_base} onChange={(e) => setForm({ ...form, costo_base: e.target.value })} className={inputClass} />
                    {formErrors.costo_base && <p className="text-red-500 text-xs mt-1">{formErrors.costo_base}</p>}
                  </div>
                  <div>
                    <input type="number" placeholder="Costo por bulto ($) *" value={form.costo_por_bulto} onChange={(e) => setForm({ ...form, costo_por_bulto: e.target.value })} className={inputClass} />
                    {formErrors.costo_por_bulto && <p className="text-red-500 text-xs mt-1">{formErrors.costo_por_bulto}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="number" placeholder="Pedido mínimo ($) *" value={form.pedido_minimo} onChange={(e) => setForm({ ...form, pedido_minimo: e.target.value })} className={inputClass} />
                    {formErrors.pedido_minimo && <p className="text-red-500 text-xs mt-1">{formErrors.pedido_minimo}</p>}
                  </div>
                  <div>
                    <input type="number" placeholder="Días entrega *" value={form.tiempo_entrega_dias} onChange={(e) => setForm({ ...form, tiempo_entrega_dias: e.target.value })} className={inputClass} />
                    {formErrors.tiempo_entrega_dias && <p className="text-red-500 text-xs mt-1">{formErrors.tiempo_entrega_dias}</p>}
                  </div>
                </div>
                <textarea placeholder="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className={inputClass} rows={2} />
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
        </Modal>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Desktop: Tabla */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Provincia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Costo Base</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">$/Bulto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mínimo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Días</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {zonas.map((z) => (
                    <tr key={z.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{getProvinciaName(z.provincia_id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${z.costo_base.toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${z.costo_por_bulto.toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${z.pedido_minimo.toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{z.tiempo_entrega_dias}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${z.activo ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
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
            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </div>

          {/* Mobile: Tarjetas */}
          <div className="md:hidden space-y-3">
            {zonas.map((z) => (
              <div key={z.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{getProvinciaName(z.provincia_id)}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${z.activo ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                    {z.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Costo Base</span><span className="text-gray-700 dark:text-gray-300">${z.costo_base.toLocaleString("es-AR")}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">$/Bulto</span><span className="text-gray-700 dark:text-gray-300">${z.costo_por_bulto.toLocaleString("es-AR")}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Mínimo</span><span className="text-gray-700 dark:text-gray-300">${z.pedido_minimo.toLocaleString("es-AR")}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Días entrega</span><span className="text-gray-700 dark:text-gray-300">{z.tiempo_entrega_dias}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => openEdit(z)} className="w-full text-center text-sm text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Editar</button>
                </div>
              </div>
            ))}
            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
