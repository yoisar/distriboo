"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { Producto } from "@/types";

export default function AdminProductosPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    marca: "",
    formato: "",
    precio: "",
    stock: "",
    activo: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadProductos();
  }, [authLoading, user, search, page]);

  async function loadProductos() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      const res = await api.getProductos(params);
      setProductos(res.data);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", marca: "", formato: "", precio: "", stock: "", activo: true });
    setShowForm(true);
    setError("");
    setFormErrors({});
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      marca: p.marca || "",
      formato: p.formato || "",
      precio: String(p.precio),
      stock: String(p.stock),
      activo: p.activo,
    });
    setShowForm(true);
    setError("");
    setFormErrors({});
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) <= 0) errors.precio = "Ingresá un precio válido";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) errors.stock = "Ingresá un stock válido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;
    setSaving(true);
    setError("");
    try {
      const data = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        marca: form.marca || null,
        formato: form.formato || null,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        activo: form.activo,
      };
      if (editing) {
        await api.updateProducto(editing.id, data);
        toast("Producto actualizado", "success");
      } else {
        await api.createProducto(data);
        toast("Producto creado", "success");
      }
      setShowForm(false);
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await api.deleteProducto(id);
      toast("Producto eliminado", "success");
      loadProductos();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al eliminar", "error");
    }
  }

  if (authLoading) return <Loading />;

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <AppLayout user={user} title="Productos" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Productos</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Producto
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-md px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Producto`}>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <div>
                  <input placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
                  {formErrors.nombre && <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>}
                </div>
                <input placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className={inputClass} />
                <input placeholder="Formato (ej: 2.5L)" value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })} className={inputClass} />
                <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={inputClass} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="number" placeholder="Precio *" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className={inputClass} />
                    {formErrors.precio && <p className="text-red-500 text-xs mt-1">{formErrors.precio}</p>}
                  </div>
                  <div>
                    <input type="number" placeholder="Stock *" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
                    {formErrors.stock && <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>}
                  </div>
                </div>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Marca</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Formato</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {productos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.marca || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.formato || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${p.precio.toLocaleString("es-AR")}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${p.activo ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                            {p.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Tarjetas */}
            <div className="md:hidden space-y-3">
              {productos.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.nombre}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${p.activo ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Marca</span><span className="text-gray-700 dark:text-gray-300">{p.marca || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Formato</span><span className="text-gray-700 dark:text-gray-300">{p.formato || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Precio</span><span className="font-medium text-gray-700 dark:text-gray-300">${p.precio.toLocaleString("es-AR")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Stock</span><span className="text-gray-700 dark:text-gray-300">{p.stock}</span></div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => openEdit(p)} className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="flex-1 text-center text-sm text-red-600 dark:text-red-400 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
