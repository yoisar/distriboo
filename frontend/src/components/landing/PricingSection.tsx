"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Plan } from "@/types";

const DESCUENTOS: Record<number, number> = { 3: 10, 6: 20, 12: 30 };

export default function PricingSection() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [plazo, setPlazo] = useState<number>(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlanes().then(setPlanes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const descuento = DESCUENTOS[plazo] || 0;

  const calcPrecio = (precio: number) => {
    return Math.round(precio * (1 - descuento / 100));
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <section id="planes" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-4" />
        </div>
      </section>
    );
  }

  return (
    <section id="planes" className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Elegí tu Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Planes flexibles que se adaptan al tamaño de tu distribución.
            Cuanto más largo el plazo, mayor el descuento.
          </p>
        </div>

        {/* Selector de plazo */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {[3, 6, 12].map((p) => (
              <button
                key={p}
                onClick={() => setPlazo(p)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  plazo === p
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {p} meses
                {DESCUENTOS[p] > 0 && (
                  <span className={`ml-1.5 text-xs ${plazo === p ? "text-blue-200" : "text-green-600 dark:text-green-400"}`}>
                    -{DESCUENTOS[p]}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planes.map((plan, i) => {
            const isPopular = i === 1; // PRO es el ancla
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all ${
                  isPopular
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105 border-2 border-blue-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${isPopular ? "" : "text-gray-900 dark:text-white"}`}>
                    {plan.nombre}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${isPopular ? "" : "text-gray-900 dark:text-white"}`}>
                      {formatPrice(calcPrecio(plan.precio_mensual))}
                    </span>
                    <span className={`text-sm ${isPopular ? "text-blue-200" : "text-gray-500"}`}>/mes</span>
                  </div>
                  {descuento > 0 && (
                    <p className={`text-sm mt-1 line-through ${isPopular ? "text-blue-300" : "text-gray-400"}`}>
                      {formatPrice(plan.precio_mensual)}/mes
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.caracteristicas.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <svg
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isPopular ? "text-blue-200" : "text-green-500"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${isPopular ? "text-blue-100" : "text-gray-600 dark:text-gray-300"}`}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`/contratar?plan=${plan.slug}&plazo=${plazo}`}
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors ${
                    isPopular
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Contratar {plan.nombre}
                </a>

                <p className={`text-xs text-center mt-3 ${isPopular ? "text-blue-200" : "text-gray-400"}`}>
                  Setup inicial: {formatPrice(plan.setup_inicial)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sección para revendedores */}
        <div className="mt-16 text-center">
          <div className="max-w-xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¿Querés ganar dinero con Distriboo?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Convertite en revendedor y ganá comisiones recurrentes por cada cliente que traigas.
              Hasta un 30% de comisión mensual.
            </p>
            <a
              href="mailto:contacto@yoisar.com?subject=Quiero ser revendedor de Distriboo"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Contactanos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
