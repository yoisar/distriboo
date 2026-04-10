"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import Modal from "@/app/components/Modal";
import Pagination from "@/app/components/Pagination";
import ImportModal from "@/components/ImportModal";
import type { Cliente, Provincia, ListaPrecio } from "@/types";

export default function AdminClientesPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [listasPrecios, setListasPrecios] = useState<ListaPrecio[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
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
    segmento: "mayorista",
    lista_precio_id: "",
    condicion_pago: "",
    limite_credito: "",
    observaciones: "",
    descuento_porcentaje: "0",
    descuento_fijo: "0",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [razonSocialMatch, setRazonSocialMatch] = useState<Cliente | null>(null);

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, search, page]);

  // Autocomplete razón social: busca clientes existentes al tipear (solo en creación)
  useEffect(() => {
    if (editing || form.razon_social.trim().length < 3) {
      setRazonSocialMatch(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getClientes({ search: form.razon_social.trim(), per_page: "5" });
        const match = res.data.find((c) =>
          c.razon_social.toLowerCase().includes(form.razon_social.trim().toLowerCase())
        );
        setRazonSocialMatch(match ?? null);
      } catch {
        setRazonSocialMatch(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.razon_social, editing]);

  async function loadData() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      const [clientesRes, provinciasRes, listasRes] = await Promise.all([
        api.getClientes(params),
        api.getProvincias(),
        api.getListasPrecios({ per_page: "100" }),
      ]);
      setClientes(clientesRes.data);
      setLastPage(clientesRes.last_page);
      setTotal(clientesRes.total);
      setPerPage(clientesRes.per_page);
      setProvincias(provinciasRes);
      setListasPrecios(listasRes.data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ razon_social: "", email: "", telefono: "", provincia_id: "", direccion: "", cuit: "", activo: true, segmento: "mayorista", lista_precio_id: "", condicion_pago: "", limite_credito: "", observaciones: "", descuento_porcentaje: "0", descuento_fijo: "0" });
    setShowForm(true);
    setError("");
    setFormErrors({});
    setRazonSocialMatch(null);
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
      segmento: c.segmento || "mayorista",
      lista_precio_id: c.lista_precio_id ? String(c.lista_precio_id) : "",
      condicion_pago: c.condicion_pago || "",
      limite_credito: c.limite_credito != null ? String(c.limite_credito) : "",
      observaciones: c.observaciones || "",
      descuento_porcentaje: String(c.descuento_porcentaje ?? 0),
      descuento_fijo: String(c.descuento_fijo ?? 0),
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
        segmento: form.segmento as Cliente["segmento"],
        lista_precio_id: form.lista_precio_id ? parseInt(form.lista_precio_id) : null,
        condicion_pago: form.condicion_pago || null,
        limite_credito: form.limite_credito ? parseFloat(form.limite_credito) : null,
        observaciones: form.observaciones || null,
        descuento_porcentaje: parseFloat(form.descuento_porcentaje) || 0,
        descuento_fijo: parseFloat(form.descuento_fijo) || 0,
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

  function importarDesdeMatch() {
    if (!razonSocialMatch) return;
    setForm({
      razon_social: razonSocialMatch.razon_social,
      email: razonSocialMatch.email,
      telefono: razonSocialMatch.telefono || "",
      provincia_id: String(razonSocialMatch.provincia_id),
      direccion: razonSocialMatch.direccion || "",
      cuit: razonSocialMatch.cuit || "",
      activo: razonSocialMatch.activo,
      segmento: razonSocialMatch.segmento || "mayorista",
      lista_precio_id: razonSocialMatch.lista_precio_id ? String(razonSocialMatch.lista_precio_id) : "",
      condicion_pago: razonSocialMatch.condicion_pago || "",
      limite_credito: razonSocialMatch.limite_credito != null ? String(razonSocialMatch.limite_credito) : "",
      observaciones: razonSocialMatch.observaciones || "",
      descuento_porcentaje: String(razonSocialMatch.descuento_porcentaje ?? 0),
      descuento_fijo: String(razonSocialMatch.descuento_fijo ?? 0),
    });
    setRazonSocialMatch(null);
  }

  if (authLoading) return <Loading />;

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <AppLayout user={user} title="Clientes" onLogout={logout}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
              Importar CSV
            </button>
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Nuevo Cliente
            </button>
          </div>
        </div>

        <ImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          tipo="clientes"
          onSuccess={loadData}
        />

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
                  {!editing && razonSocialMatch && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
                      <span className="text-yellow-800 dark:text-yellow-300 flex-1">
                        Ya existe: <strong>{razonSocialMatch.razon_social}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={importarDesdeMatch}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold whitespace-nowrap"
                      >
                        Importar datos
                      </button>
                    </div>
                  )}
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

                {/* Campos comerciales */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Condiciones comerciales</p>
                </div>
                <select value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value })} className={inputClass}>
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="autoservicio">Autoservicio</option>
                  <option value="supermercado">Supermercado</option>
                  <option value="estrategico">Cliente Estratégico</option>
                </select>
                <select value={form.lista_precio_id} onChange={(e) => setForm({ ...form, lista_precio_id: e.target.value })} className={inputClass}>
                  <option value="">Sin lista de precios (precio general)</option>
                  {listasPrecios.map((lp) => (
                    <option key={lp.id} value={lp.id}>{lp.nombre}</option>
                  ))}
                </select>
                <input type="text" placeholder="Condición de pago (ej: 30 días)" value={form.condicion_pago} onChange={(e) => setForm({ ...form, condicion_pago: e.target.value })} className={inputClass} />
                <input type="number" step="0.01" min="0" placeholder="Límite de crédito" value={form.limite_credito} onChange={(e) => setForm({ ...form, limite_credito: e.target.value })} className={inputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Descuento %</label>
                    <input type="number" step="0.01" min="0" max="100" value={form.descuento_porcentaje} onChange={(e) => setForm({ ...form, descuento_porcentaje: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Descuento fijo $</label>
                    <input type="number" step="0.01" min="0" value={form.descuento_fijo} onChange={(e) => setForm({ ...form, descuento_fijo: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <textarea placeholder="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} rows={2} className={inputClass} />
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Razón Social</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Provincia</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Segmento</th>
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
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 capitalize">
                            {c.segmento || "mayorista"}
                          </span>
                        </td>
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
            </div>

            {/* Mobile: Tarjetas */}
            <div className="md:hidden space-y-3">
              {clientes.map((c) => (
                <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.razon_social}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${c.activo ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Email</span><span className="text-gray-700 dark:text-gray-300 truncate ml-2">{c.email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Provincia</span><span className="text-gray-700 dark:text-gray-300">{c.provincia?.nombre || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">CUIT</span><span className="text-gray-700 dark:text-gray-300">{c.cuit || "-"}</span></div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => openEdit(c)} className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="flex-1 text-center text-sm text-red-600 dark:text-red-400 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} total={total} perPage={perPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
