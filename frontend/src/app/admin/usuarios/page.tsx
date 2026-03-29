"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { User, Cliente } from "@/types";

export default function AdminUsuariosPage() {
  const { user: currentUser, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    setFormErrors({});
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
    setFormErrors({});
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "El nombre es obligatorio";
    if (!form.email.trim()) errors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email inválido";
    if (!editing && !form.password) errors.password = "La contraseña es obligatoria";
    else if (form.password && form.password.length < 6) errors.password = "Mínimo 6 caracteres";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;
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
        toast("Usuario actualizado", "success");
      } else {
        await api.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          cliente_id: form.cliente_id ? parseInt(form.cliente_id) : null,
        });
        toast("Usuario creado", "success");
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
      toast("Usuario eliminado", "success");
      loadUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al eliminar", "error");
    }
  }

  if (authLoading) return <Loading />;

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <AppLayout user={currentUser} title="Usuarios" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Usuarios</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Usuario
          </button>
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Usuario`}>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <div>
              <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <input placeholder={editing ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="cliente">Cliente</option>
              {currentUser?.role === "super_admin" && (
                <>
                  <option value="distribuidor">Distribuidor</option>
                  <option value="super_admin">Super Admin</option>
                </>
              )}
            </select>
            {form.role === "cliente" && (
              <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} className={inputClass}>
                <option value="">Sin cliente asociado</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razon_social}</option>
                ))}
              </select>
            )}
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
          {/* Desktop: Tabla */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          u.role === "super_admin" ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" :
                          u.role === "distribuidor" ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" :
                          "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        }`}>
                          {u.role === "super_admin" ? "Super Admin" : u.role === "distribuidor" ? "Distribuidor" : "Cliente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{u.cliente?.razon_social || "-"}</td>
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
          </div>

          {/* Mobile: Tarjetas */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    u.role === "super_admin" ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" :
                    u.role === "distribuidor" ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" :
                    "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                  }`}>
                    {u.role === "super_admin" ? "Super Admin" : u.role === "distribuidor" ? "Distribuidor" : "Cliente"}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Email</span><span className="text-gray-700 dark:text-gray-300 truncate ml-2">{u.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Cliente</span><span className="text-gray-700 dark:text-gray-300">{u.cliente?.razon_social || "-"}</span></div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => openEdit(u)} className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Editar</button>
                  {u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id)} className="flex-1 text-center text-sm text-red-600 dark:text-red-400 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
      </div>
    </AppLayout>
  );
}
