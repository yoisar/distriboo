"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppHeader from "@/app/components/AppHeader";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import type { Producto } from "@/types";

export default function AdminProductosPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadProductos();
  }, [authLoading, user, search]);

  async function loadProductos() {
    setLoading(true);
    try {
      const params: Record<string, string> = { per_page: "100" };
      if (search) params.search = search;
      const res = await api.getProductos(params);
      setProductos(res.data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", marca: "", formato: "", precio: "", stock: "", activo: true });
    setShowForm(true);
    setError("");
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
  }

  async function handleSave() {
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
      } else {
        await api.createProducto(data);
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
      loadProductos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  if (authLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} title="Admin / Productos" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Producto
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Editar" : "Nuevo"} Producto`}>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <input placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <input placeholder="Formato (ej: 2.5L)" value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="px-3 py-2 border rounded-lg" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
        </Modal>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {productos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.marca || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.formato || "-"}</td>
                    <td className="px-4 py-3 text-sm">${p.precio.toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${p.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
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
        )}
      </main>
    </div>
  );
}
