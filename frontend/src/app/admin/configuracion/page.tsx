"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import AppLayout from "@/app/components/AppLayout";
import Loading from "@/app/components/Loading";
import type { ConfiguracionComision } from "@/types";

export default function AdminConfiguracionPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const toast = useToast();
  const [configs, setConfigs] = useState<ConfiguracionComision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && user?.role === "super_admin") loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await api.getConfiguracionComisiones();
      setConfigs(data);
      const vals: Record<string, string> = {};
      data.forEach((c) => (vals[c.clave] = c.valor));
      setEditedValues(vals);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const configuraciones = Object.entries(editedValues).map(([clave, valor]) => ({ clave, valor }));
      await api.updateConfiguracionComisiones(configuraciones);
      toast("Configuración guardada", "success");
      loadData();
    } catch {
      toast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <Loading />;
  if (!user || user.role !== "super_admin") return null;

  return (
    <AppLayout user={user} title="Configuración de Comisiones" onLogout={logout}>
      <div className="max-w-3xl mx-auto">
        {loading ? <Loading /> : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {configs.map((c) => (
                <div key={c.clave} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{c.clave}</label>
                    {c.descripcion && <p className="text-xs text-gray-500 mt-0.5">{c.descripcion}</p>}
                  </div>
                  <input
                    type="text"
                    value={editedValues[c.clave] || ""}
                    onChange={(e) => setEditedValues({ ...editedValues, [c.clave]: e.target.value })}
                    className="w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-right"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
