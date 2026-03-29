"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import type { Cliente, Provincia } from "@/types";

export default function AdminClientesPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({
    razon_social: "",
    email: "",
    telefono: "",
    provincia_id: "",
    direccion: "",
    cuit: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, search]);

  async function loadData() {
    setLoading(true);
    try {
      const params: Record<string, string> = { per_page: "100" };
      if (search) params.search = search;
      const [clientesRes, provinciasRes] = await Promise.all([
        api.getClientes(params),
        api.getProvincias(),
      ]);
      setClientes(clientesRes.data);
      setProvincias(provinciasRes);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ razon_social: "", email: "", telefono: "", provincia_id: "", direccion: "", cuit: "", activo: true });
    setShowForm(true);
    setError("");
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      razon_social: c.razon_social,
      email: c.email,
      telefono: c.telefono || "",
      provincia_id: String(c.provincia_id),
      direccion: c.direccion || "",
      cuit: c.cuit || "",
      activo: c.activo,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const data = {
        razon_social: form.razon_social,
        email: form.email,
        telefono: form.telefono || null,
        provincia_id: parseInt(form.provincia_id),
        direccion: form.direccion || null,
        cuit: form.cuit || null,
        activo: form.activo,
      };
      if (editing) {
        await api.updateCliente(editing.id, data);
      } else {
        await api.createCliente(data);
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
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await api.deleteCliente(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={user} title="Clientes" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Clientes</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Cliente
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por razón social, email o CUIT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Cliente`}>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <input placeholder="Razón Social" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                <select value={form.provincia_id} onChange={(e) => setForm({ ...form, provincia_id: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500">
                  <option value="">Seleccionar provincia</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                <input placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
                <input placeholder="CUIT" value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Razón Social</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Provincia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CUIT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">{c.razon_social}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{c.provincia?.nombre || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{c.cuit || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${c.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Eliminar</button>
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
