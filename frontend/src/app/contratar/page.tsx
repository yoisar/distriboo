"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Plan } from "@/types";

export default function ContratarPage() {
  const searchParams = useSearchParams();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [plazo, setPlazo] = useState(1);
  const [codigoReferido, setCodigoReferido] = useState(searchParams.get("ref") || "");
  const [referidoValido, setReferidoValido] = useState<boolean | null>(null);
  const [validando, setValidando] = useState(false);
  const [form, setForm] = useState({
    nombre_comercial: "",
    razon_social: "",
    email_contacto: "",
    telefono: "",
    direccion: "",
    nombre_usuario: "",
    email_usuario: "",
    password: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPlanes().then((data) => {
      setPlanes(data);
      const planParam = searchParams.get("plan");
      if (planParam) {
        const found = data.find((p: Plan) => p.slug === planParam);
        if (found) setSelectedPlan(found.id);
      }
    }).finally(() => setLoading(false));

    const plazoParam = searchParams.get("plazo");
    if (plazoParam) setPlazo(Number(plazoParam));
  }, [searchParams]);

  async function validarCodigo() {
    if (!codigoReferido.trim()) return;
    setValidando(true);
    try {
      const res = await api.validarReferido(codigoReferido.trim());
      setReferidoValido((res as { valido: boolean }).valido);
    } catch {
      setReferidoValido(false);
    } finally {
      setValidando(false);
    }
  }

  const planSeleccionado = planes.find((p) => p.id === selectedPlan);
  const descuento = plazo >= 12 ? 30 : plazo >= 6 ? 20 : plazo >= 3 ? 10 : 0;
  const precioFinal = planSeleccionado ? planSeleccionado.precio_mensual * (1 - descuento / 100) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setEnviando(true);
    setError("");
    try {
      await api.createSuscripcionPublica({
        ...form,
        plan_id: selectedPlan,
        plazo_meses: plazo,
        codigo_referido: codigoReferido.trim() || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Solicitud Recibida!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Nos pondremos en contacto contigo para activar tu cuenta de distribuidor.</p>
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">Volver al inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-blue-600 tracking-wide">distriboo</a>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Contratar Plan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Elige tu plan y completa tus datos para empezar.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando planes...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Plan Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">1. Elige tu plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {planes.filter((p) => p.activo).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      selectedPlan === p.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300"
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white">{p.nombre}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      ${Number(p.precio_mensual).toLocaleString("es-AR")}<span className="text-sm font-normal text-gray-500">/mes</span>
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {Array.isArray(p.caracteristicas) && p.caracteristicas.slice(0, 3).map((c, i) => (
                        <li key={i}>✓ {c}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {/* Plazo */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">2. Plazo de contratación</h2>
              <div className="flex gap-3">
                {[{ m: 1, label: "Mensual" }, { m: 3, label: "3 meses", d: 10 }, { m: 6, label: "6 meses", d: 20 }, { m: 12, label: "12 meses", d: 30 }].map(({ m, label, d }) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPlazo(m)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      plazo === m
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {label}
                    {d && <span className="ml-1 text-xs opacity-80">(-{d}%)</span>}
                  </button>
                ))}
              </div>
              {planSeleccionado && descuento > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Precio final: ${Number(precioFinal).toLocaleString("es-AR")}/mes (ahorrás {descuento}%)
                </p>
              )}
            </div>

            {/* Código de referido */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">3. Código de referido (opcional)</h2>
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  value={codigoReferido}
                  onChange={(e) => { setCodigoReferido(e.target.value); setReferidoValido(null); }}
                  placeholder="Ingresa el código"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={validarCodigo}
                  disabled={validando || !codigoReferido.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 disabled:opacity-50"
                >
                  {validando ? "..." : "Validar"}
                </button>
              </div>
              {referidoValido === true && <p className="text-sm text-green-600 mt-1">✓ Código válido</p>}
              {referidoValido === false && <p className="text-sm text-red-600 mt-1">✗ Código inválido</p>}
            </div>

            {/* Datos del distribuidor */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">4. Datos del distribuidor</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Comercial *</label>
                    <input type="text" required value={form.nombre_comercial} onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razón Social</label>
                    <input type="text" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Contacto *</label>
                    <input type="email" required value={form.email_contacto} onChange={(e) => setForm({ ...form, email_contacto: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                    <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                  <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />
                <p className="text-sm font-medium text-gray-500">Datos de acceso del usuario administrador</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                    <input type="text" required value={form.nombre_usuario} onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input type="email" required value={form.email_usuario} onChange={(e) => setForm({ ...form, email_usuario: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
                  <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={enviando || !selectedPlan}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {enviando ? "Procesando..." : "Enviar Solicitud"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
