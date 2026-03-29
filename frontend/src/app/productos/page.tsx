"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Pagination from "@/app/components/Pagination";
import type { Producto } from "@/types";

export default function ProductosPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    loadProductos();
  }, [page, search]);

  async function loadProductos() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      const res = await api.getProductos(params);
      setProductos(res.data);
      setLastPage(res.last_page);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <Loading />;

  return (
    <AppLayout user={user} title="Catálogo de Productos" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : productos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No se encontraron productos.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                    {p.nombre}
                  </h3>
                  {p.marca && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{p.marca}</p>
                  )}
                  {p.formato && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{p.formato}</p>
                  )}
                  {p.descripcion && (
                    <p className="text-sm text-gray-500 mb-3">
                      {p.descripcion}
                    </p>
                  )}
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-blue-600">
                      ${p.precio.toLocaleString("es-AR")}
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        p.stock > 10
                          ? "bg-green-100 text-green-800"
                          : p.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      Stock: {p.stock}
                    </span>
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
