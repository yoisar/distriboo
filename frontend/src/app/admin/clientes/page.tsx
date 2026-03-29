"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { Cliente, Provincia } from "@/types";

export default function AdminClientesPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, search, page]);

  async function loadData() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      const [clientesRes, provinciasRes] = await Promise.all([
        api.getClientes(params),
        api.getProvincias(),
      ]);
      setClientes(clientesRes.data);
      setLastPage(clientesRes.last_page);
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
    setFormErrors({});
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
    setFormErrors({});
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.razon_social.trim()) errors.razon_social = "La razón social es obligatoria";
    if (!form.email.trim()) errors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email inválido";
    if (!form.provincia_id) errors.provincia_id = "Seleccioná una provincia";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;
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
        toast("Cliente actualizado", "success");
      } else {
        await api.createCliente(data);
        toast("Cliente creado", "success");
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
      toast("Cliente eliminado", "success");
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al eliminar", "error");
    }
  }

  if (authLoading) return <Loading />;

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <AppLayout user={user} title="Clientes" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Cliente
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por razón social, email o CUIT..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-md px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Cliente`}>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <div>
                  <input placeholder="Razón Social *" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} className={inputClass} />
                  {formErrors.razon_social && <p className="text-red-500 text-xs mt-1">{formErrors.razon_social}</p>}
                </div>
                <div>
                  <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputClass} />
                <div>
                  <select value={form.provincia_id} onChange={(e) => setForm({ ...form, provincia_id: e.target.value })} className={inputClass}>
                    <option value="">Seleccionar provincia *</option>
                    {provincias.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  {formErrors.provincia_id && <p className="text-red-500 text-xs mt-1">{formErrors.provincia_id}</p>}
                </div>
                <input placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className={inputClass} />
                <input placeholder="CUIT" value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} className={inputClass} />
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Razón Social</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Provincia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CUIT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{c.razon_social}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.provincia?.nombre || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.cuit || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${c.activo ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
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
            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
