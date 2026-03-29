"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import type { Distribuidor } from "@/types";

export default function AdminDistribuidoresPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Distribuidor | null>(null);
  const [form, setForm] = useState({
    nombre_comercial: "",
    razon_social: "",
    email_contacto: "",
    telefono: "",
    direccion: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "super_admin") return;
      loadData();
    }
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getDistribuidores({ per_page: "100" });
      setDistribuidores(res.data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ nombre_comercial: "", razon_social: "", email_contacto: "", telefono: "", direccion: "", activo: true });
    setShowForm(true);
    setError("");
  }

  function openEdit(d: Distribuidor) {
    setEditing(d);
    setForm({
      nombre_comercial: d.nombre_comercial,
      razon_social: d.razon_social || "",
      email_contacto: d.email_contacto || "",
      telefono: d.telefono || "",
      direccion: d.direccion || "",
      activo: d.activo,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const data = {
        nombre_comercial: form.nombre_comercial,
        razon_social: form.razon_social || null,
        email_contacto: form.email_contacto || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        activo: form.activo,
      };
      if (editing) {
        await api.updateDistribuidor(editing.id, data);
      } else {
        await api.createDistribuidor(data);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este distribuidor? Se perderán todos sus datos asociados.")) return;
    try {
      await api.deleteDistribuidor(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  if (authLoading) return <Loading />;
  if (!user || user.role !== "super_admin") return null;

  return (
    <AppLayout user={user} title="Distribuidores" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Distribuidores</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Distribuidor
          </button>
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Distribuidor`}>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <input placeholder="Nombre Comercial *" value={form.nombre_comercial} onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <input placeholder="Razón Social" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <input placeholder="Email de Contacto" type="email" value={form.email_contacto} onChange={(e) => setForm({ ...form, email_contacto: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <input placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="rounded" />
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre Comercial</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Razón Social</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {distribuidores.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">{d.nombre_comercial}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{d.razon_social || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{d.email_contacto || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{d.telefono || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${d.activo ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}>
                        {d.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button onClick={() => openEdit(d)} className="text-blue-400 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {distribuidores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay distribuidores registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
