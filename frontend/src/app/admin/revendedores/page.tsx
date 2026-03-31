"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { Revendedor } from "@/types";

export default function AdminRevendedoresPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Revendedor | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    porcentaje_base: "20",
    banco: "",
    cbu: "",
    alias_bancario: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role === "super_admin") loadData();
  }, [authLoading, user, page]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getRevendedores(page);
      setRevendedores(res.data);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", porcentaje_base: "20", banco: "", cbu: "", alias_bancario: "" });
    setShowForm(true);
  }

  function openEdit(r: Revendedor) {
    setEditing(r);
    setForm({
      name: r.user?.name || "",
      email: r.user?.email || "",
      password: "",
      porcentaje_base: String(r.porcentaje_base),
      banco: r.banco || "",
      cbu: r.cbu || "",
      alias_bancario: r.alias_bancario || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateRevendedor(editing.id, form);
        toast("Revendedor actualizado", "success");
      } else {
        await api.createRevendedor(form);
        toast("Revendedor creado", "success");
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
    if (!confirm("¿Eliminar este revendedor?")) return;
    try {
      await api.deleteRevendedor(id);
      toast("Revendedor eliminado", "success");
      loadData();
    } catch {
      toast("Error al eliminar", "error");
    }
  }

  if (authLoading) return <Loading />;
  if (!user || user.role !== "super_admin") return null;

  return (
    <AppLayout user={user} title="Gestión de Revendedores" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">{revendedores.length} revendedores</p>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Nuevo Revendedor
          </button>
        </div>

        {loading ? <Loading /> : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Código</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">% Base</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {revendedores.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.user?.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.user?.email}</td>
                      <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">{r.codigo_referido}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{r.porcentaje_base}%</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3">Editar</button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />

        <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar Revendedor" : "Nuevo Revendedor"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">% Comisión Base</label>
              <input type="number" required min="1" max="100" value={form.porcentaje_base} onChange={(e) => setForm({ ...form, porcentaje_base: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</label>
                <input type="text" value={form.banco} onChange={(e) => setForm({ ...form, banco: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CBU</label>
                <input type="text" value={form.cbu} onChange={(e) => setForm({ ...form, cbu: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
              </div>
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
