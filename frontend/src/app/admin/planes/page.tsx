"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import type { Plan } from "@/types";

export default function AdminPlanesPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    slug: "",
    precio_mensual: "",
    setup_inicial: "0",
    max_productos: "",
    max_clientes: "",
    multi_vendedor: false,
    integraciones: false,
    reportes: false,
    orden: "0",
    activo: true,
    caracteristicas: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role === "super_admin") loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getPlanes();
      setPlanes(res);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", slug: "", precio_mensual: "", setup_inicial: "0", max_productos: "", max_clientes: "", multi_vendedor: false, integraciones: false, reportes: false, orden: "0", activo: true, caracteristicas: "" });
    setShowForm(true);
  }

  function openEdit(p: Plan) {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      slug: p.slug,
      precio_mensual: String(p.precio_mensual),
      setup_inicial: String(p.setup_inicial),
      max_productos: String(p.max_productos ?? ""),
      max_clientes: String(p.max_clientes ?? ""),
      multi_vendedor: p.multi_vendedor,
      integraciones: p.integraciones,
      reportes: p.reportes,
      orden: String(p.orden),
      activo: p.activo,
      caracteristicas: Array.isArray(p.caracteristicas) ? p.caracteristicas.join("\n") : "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      precio_mensual: Number(form.precio_mensual),
      setup_inicial: Number(form.setup_inicial),
      max_productos: form.max_productos ? Number(form.max_productos) : null,
      max_clientes: form.max_clientes ? Number(form.max_clientes) : null,
      orden: Number(form.orden),
      caracteristicas: form.caracteristicas.split("\n").filter(Boolean),
    };
    try {
      if (editing) {
        await api.updatePlan(editing.id, data);
        toast("Plan actualizado", "success");
      } else {
        await api.createPlan(data);
        toast("Plan creado", "success");
      }
      setShowForm(false);
      loadData();
    } catch {
      toast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este plan?")) return;
    try {
      await api.deletePlan(id);
      toast("Plan eliminado", "success");
      loadData();
    } catch {
      toast("Error al eliminar", "error");
    }
  }

  if (authLoading) return <Loading />;
  if (!user || user.role !== "super_admin") return null;

  return (
    <AppLayout user={user} title="Gestión de Planes" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">{planes.length} planes</p>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Nuevo Plan
          </button>
        </div>

        {loading ? <Loading /> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planes.map((p) => (
              <div key={p.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-6 ${p.activo ? "border-gray-200 dark:border-gray-700" : "border-red-200 dark:border-red-800 opacity-60"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{p.nombre}</h3>
                    <p className="text-sm text-gray-500 font-mono">{p.slug}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.activo ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700"}`}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  ${Number(p.precio_mensual).toLocaleString("es-AR")}<span className="text-sm font-normal text-gray-500">/mes</span>
                </p>
                {p.setup_inicial > 0 && (
                  <p className="text-sm text-gray-500 mb-2">Setup: ${Number(p.setup_inicial).toLocaleString("es-AR")}</p>
                )}
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                  <li>Max productos: {p.max_productos ?? "Ilimitado"}</li>
                  <li>Max clientes: {p.max_clientes ?? "Ilimitado"}</li>
                  <li>Multi-vendedor: {p.multi_vendedor ? "Sí" : "No"}</li>
                  <li>Integraciones: {p.integraciones ? "Sí" : "No"}</li>
                  <li>Reportes: {p.reportes ? "Sí" : "No"}</li>
                </ul>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar Plan" : "Nuevo Plan"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Mensual</label>
                <input type="number" required value={form.precio_mensual} onChange={(e) => setForm({ ...form, precio_mensual: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setup Inicial</label>
                <input type="number" value={form.setup_inicial} onChange={(e) => setForm({ ...form, setup_inicial: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Productos</label>
                <input type="number" value={form.max_productos} onChange={(e) => setForm({ ...form, max_productos: e.target.value })} placeholder="Vacío = ilimitado"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Clientes</label>
                <input type="number" value={form.max_clientes} onChange={(e) => setForm({ ...form, max_clientes: e.target.value })} placeholder="Vacío = ilimitado"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={form.multi_vendedor} onChange={(e) => setForm({ ...form, multi_vendedor: e.target.checked })} />
                Multi-vendedor
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={form.integraciones} onChange={(e) => setForm({ ...form, integraciones: e.target.checked })} />
                Integraciones
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Activo
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reportes</label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-2">
                <input type="checkbox" checked={form.reportes} onChange={(e) => setForm({ ...form, reportes: e.target.checked })} />
                Incluir reportes
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Características (una por línea)</label>
              <textarea rows={4} value={form.caracteristicas} onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
