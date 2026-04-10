"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import type { ListaPrecio, Producto } from "@/types";

export default function AdminListasPreciosPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [listas, setListas] = useState<ListaPrecio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListaPrecio | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
    precios: [] as { producto_id: number; precio: number }[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, page]);

  async function loadData() {
    try {
      setLoading(true);
      const [listasRes, productosRes] = await Promise.all([
        api.getListasPrecios({ page: String(page) }),
        api.getProductos({ per_page: "200" }),
      ]);
      setListas(listasRes.data);
      setLastPage(listasRes.last_page);
      setTotal(listasRes.total);
      setProductos(productosRes.data);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", activo: true, precios: [] });
    setShowForm(true);
  }

  async function openEdit(lista: ListaPrecio) {
    try {
      const full = await api.getListaPrecio(lista.id);
      setEditing(full);
      setForm({
        nombre: full.nombre,
        descripcion: full.descripcion || "",
        activo: full.activo,
        precios: (full.precios_productos || []).map((pp) => ({
          producto_id: pp.producto_id,
          precio: pp.precio,
        })),
      });
      setShowForm(true);
    } catch {
      toast("Error al cargar lista", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateListaPrecio(editing.id, form);
        toast("Lista actualizada", "success");
      } else {
        await api.createListaPrecio(form);
        toast("Lista creada", "success");
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta lista de precios?")) return;
    try {
      await api.deleteListaPrecio(id);
      toast("Lista eliminada", "success");
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al eliminar", "error");
    }
  }

  function updatePrecioProducto(productoId: number, precio: string) {
    const value = parseFloat(precio);
    setForm((prev) => {
      const existing = prev.precios.findIndex((p) => p.producto_id === productoId);
      const newPrecios = [...prev.precios];

      if (isNaN(value) || precio === "") {
        // Remover si vacío
        if (existing >= 0) newPrecios.splice(existing, 1);
      } else if (existing >= 0) {
        newPrecios[existing] = { producto_id: productoId, precio: value };
      } else {
        newPrecios.push({ producto_id: productoId, precio: value });
      }

      return { ...prev, precios: newPrecios };
    });
  }

  function getPrecioProducto(productoId: number): string {
    const p = form.precios.find((p) => p.producto_id === productoId);
    return p ? String(p.precio) : "";
  }

  if (authLoading || !user) return <Loading />;

  return (
    <AppLayout user={user} onLogout={logout}>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listas de Precios</h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} {total === 1 ? "lista" : "listas"} · Gestione precios personalizados por grupo de clientes
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Nueva Lista
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        {loading ? (
          <Loading />
        ) : listas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No hay listas de precios</p>
            <p className="text-sm">Cree una lista para asignar precios diferenciados a grupos de clientes</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Descripción</th>
                    <th className="px-4 py-3 text-center">Clientes</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {listas.map((lista) => (
                    <tr key={lista.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {lista.nombre}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {lista.descripcion || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {lista.clientes_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            lista.activo
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {lista.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(lista)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(lista.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </>
        )}

        {/* Modal: Crear/Editar Lista de Precios */}
        <Modal open={showForm} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? "Editar Lista" : "Nueva Lista de Precios"}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="activo" className="text-sm text-gray-700 dark:text-gray-300">
                Activa
              </label>
            </div>

            {/* Precios por producto */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Precios por Producto
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Deje vacío para usar el precio general del producto
              </p>
              <div className="max-h-64 overflow-y-auto border rounded-lg dark:border-gray-600">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs">Producto</th>
                      <th className="px-3 py-2 text-right text-xs">P. General</th>
                      <th className="px-3 py-2 text-right text-xs w-32">P. Lista</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {productos.map((prod) => (
                      <tr key={prod.id}>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">
                          {prod.nombre}
                          {prod.marca && (
                            <span className="text-gray-400 ml-1">({prod.marca})</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-500">
                          ${Number(prod.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="—"
                            value={getPrecioProducto(prod.id)}
                            onChange={(e) => updatePrecioProducto(prod.id, e.target.value)}
                            className="w-full text-right border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
