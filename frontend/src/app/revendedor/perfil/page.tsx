"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { Revendedor } from "@/types";

export default function RevendedorPerfilPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const [revendedor, setRevendedor] = useState<Revendedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    banco: "",
    titular_cuenta: "",
    cbu: "",
    alias_bancario: "",
    cuit: "",
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "revendedor") return;
      api.getRevendedorPerfil()
        .then((data) => {
          setRevendedor(data);
          setForm({
            banco: data.banco || "",
            titular_cuenta: data.titular_cuenta || "",
            cbu: data.cbu || "",
            alias_bancario: data.alias_bancario || "",
            cuit: data.cuit || "",
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateRevendedorPerfil(form);
      setRevendedor(updated);
      toast("Datos bancarios actualizados", "success");
    } catch {
      toast("Error al guardar los datos", "error");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <Loading />;
  if (!user || user.role !== "revendedor") return null;

  return (
    <AppLayout user={user} title="Mi Perfil" onLogout={logout}>
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <Loading />
        ) : revendedor ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Código de Referido</p>
                  <p className="font-mono text-blue-600 dark:text-blue-400 font-medium">{revendedor.codigo_referido}</p>
                </div>
                <div>
                  <p className="text-gray-500">% Comisión Base</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{revendedor.porcentaje_base}%</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos Bancarios</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</label>
                  <input
                    type="text"
                    value={form.banco}
                    onChange={(e) => setForm({ ...form, banco: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titular de Cuenta</label>
                    <input
                      type="text"
                      value={form.titular_cuenta}
                      onChange={(e) => setForm({ ...form, titular_cuenta: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CUIT</label>
                    <input
                      type="text"
                      value={form.cuit}
                      onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CBU</label>
                  <input
                    type="text"
                    value={form.cbu}
                    onChange={(e) => setForm({ ...form, cbu: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alias Bancario</label>
                  <input
                    type="text"
                    value={form.alias_bancario}
                    onChange={(e) => setForm({ ...form, alias_bancario: e.target.value })}                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-gray-500">No se pudo cargar el perfil.</p>
        )}
      </div>
    </AppLayout>
  );
}
