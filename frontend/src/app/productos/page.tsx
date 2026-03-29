"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import AppHeader from "@/app/components/AppHeader";
import Pagination from "@/app/components/Pagination";
import type { Producto } from "@/types";

export default function ProductosPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Catálogo de Productos" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : productos.length === 0 ? (
          <p className="text-gray-500">No se encontraron productos.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">
                    {p.nombre}
                  </h3>
                  {p.marca && (
                    <p className="text-xs text-gray-400 mb-1">{p.marca}</p>
                  )}
                  {p.formato && (
                    <p className="text-xs text-gray-400 mb-2">{p.formato}</p>
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
      </main>
    </div>
  );
}
