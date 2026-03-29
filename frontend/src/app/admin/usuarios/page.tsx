"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { User, Cliente } from "@/types";

export default function AdminUsuariosPage() {
  const { user: currentUser, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const [users, setUsers] = useState<User[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cliente" as string,
    cliente_id: "" as string,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && currentUser) {
      loadUsers();
      loadClientes();
    }
  }, [authLoading, currentUser, page]);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await api.getUsers({ page: String(page) });
      setUsers(res.data);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  }

  async function loadClientes() {
    try {
      const res = await api.getClientes({ per_page: "100" });
      setClientes(res.data);
    } catch {
      // silently fail
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "cliente", cliente_id: "" });
    setShowForm(true);
    setError("");
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      cliente_id: u.cliente_id ? String(u.cliente_id) : "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        const data: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          cliente_id: form.cliente_id ? parseInt(form.cliente_id) : null,
        };
        if (form.password) data.password = form.password;
        await api.updateUser(editing.id, data as Parameters<typeof api.updateUser>[1]);
      } else {
        await api.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          cliente_id: form.cliente_id ? parseInt(form.cliente_id) : null,
        });
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={currentUser} title="Usuarios" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Usuarios</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Usuario
          </button>
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Usuario`}>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <input placeholder={editing ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500">
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
            </select>
            {form.role === "cliente" && (
              <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder:text-gray-500">
                <option value="">Sin cliente asociado</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razon_social}</option>
                ))}
              </select>
            )}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.cliente?.razon_social || "-"}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline">Editar</button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Eliminar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
      </div>
    </AppLayout>
  );
}
