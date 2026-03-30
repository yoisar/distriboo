"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { User, Cliente, Distribuidor } from "@/types";

export default function AdminUsuariosPage() {
  const { user: currentUser, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cliente" as string,
    cliente_ids: [] as number[],
    distribuidor_id: "" as string,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && currentUser) {
      loadUsers();
      loadClientes();
      if (currentUser.role === "super_admin") loadDistribuidores();
    }
  }, [authLoading, currentUser, page, search, roleFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.getUsers(params);
      setUsers(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
      setPerPage(res.per_page);
    } finally {
      setLoading(false);
    }
  }

  async function loadClientes() {
    try {
      const res = await api.getClientes({ per_page: "200" });
      setClientes(res.data);
    } catch {
      // silently fail
    }
  }

  async function loadDistribuidores() {
    try {
      const res = await api.getDistribuidores({ per_page: "100" });
      setDistribuidores(res.data);
    } catch {
      // silently fail
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "cliente", cliente_ids: [], distribuidor_id: "" });
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
      cliente_ids: u.clientes?.map((c) => c.id) ?? [],
      distribuidor_id: u.distribuidor_id ? String(u.distribuidor_id) : "",
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
          cliente_ids: form.role === "cliente" ? form.cliente_ids : [],
          distribuidor_id: form.distribuidor_id ? parseInt(form.distribuidor_id) : null,
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
          cliente_ids: form.role === "cliente" ? form.cliente_ids : [],
          distribuidor_id: form.distribuidor_id ? parseInt(form.distribuidor_id) : null,
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Usuarios</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 sm:w-52 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="cliente">Cliente</option>
              <option value="distribuidor">Distribuidor</option>
              {currentUser?.role === "super_admin" && <option value="super_admin">Super Admin</option>}
            </select>
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap">
              + Nuevo
            </button>
          </div>
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
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Clientes asociados <span className="italic">(puede asociar a varios distribuidores)</span>
                </p>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-700 divide-y divide-gray-100 dark:divide-gray-600">
                  {clientes.length === 0 ? (
                    <p className="p-2 text-xs text-gray-400 dark:text-gray-500">No hay clientes registrados</p>
                  ) : (
                    clientes.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.cliente_ids.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, cliente_ids: [...form.cliente_ids, c.id] });
                            } else {
                              setForm({ ...form, cliente_ids: form.cliente_ids.filter((id) => id !== c.id) });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-500"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">{c.razon_social}</span>
                        {c.distribuidor && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{c.distribuidor.nombre_comercial}</span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
            {form.role === "distribuidor" && currentUser?.role === "super_admin" && (
              <select value={form.distribuidor_id} onChange={(e) => setForm({ ...form, distribuidor_id: e.target.value })} className={inputClass}>
                <option value="">Sin distribuidor asociado</option>
                {distribuidores.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre_comercial}</option>
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
          <>
            {/* Desktop: Tabla */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clientes</th>
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
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {u.clientes && u.clientes.length > 0
                          ? u.clientes.map((c) => c.razon_social).join(", ")
                          : u.cliente?.razon_social || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        {(currentUser?.role === 'super_admin' || u.role !== 'super_admin') && (
                          <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline">Editar</button>
                        )}
                        {u.id !== currentUser?.id && (currentUser?.role === 'super_admin' || u.role !== 'super_admin') && (
                          <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Eliminar</button>
                        )}
                        {u.role === 'super_admin' && currentUser?.role !== 'super_admin' && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Protegido</span>
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
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Clientes</span><span className="text-gray-700 dark:text-gray-300 text-right ml-2">{u.clientes && u.clientes.length > 0 ? u.clientes.map((c) => c.razon_social).join(", ") : u.cliente?.razon_social || "-"}</span></div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {(currentUser?.role === 'super_admin' || u.role !== 'super_admin') && (
                    <button onClick={() => openEdit(u)} className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Editar</button>
                  )}
                  {u.id !== currentUser?.id && (currentUser?.role === 'super_admin' || u.role !== 'super_admin') && (
                    <button onClick={() => handleDelete(u.id)} className="flex-1 text-center text-sm text-red-600 dark:text-red-400 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
                  )}
                  {u.role === 'super_admin' && currentUser?.role !== 'super_admin' && (
                    <span className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500 italic py-2">Protegido</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          </>
        )}

        <Pagination page={page} lastPage={lastPage} onPageChange={setPage} total={total} perPage={perPage} />
      </div>
    </AppLayout>
  );
}
