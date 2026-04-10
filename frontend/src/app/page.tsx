"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PricingSection from "@/components/landing/PricingSection";
import {
  CubeIcon,
  TruckIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  GlobeIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  ClipboardListIcon,
  UsersIcon,
  DocumentTextIcon,
  TrendingUpIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon,
  BanknotesIcon,
  UserGroupIcon,
  TagIcon,
} from "@/components/ui/Icons";

export default function Home() {
  const [dark, setDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("distriboo_theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("distriboo_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  const features = [
    { icon: CubeIcon, title: "Stock en Tiempo Real", desc: "Control total del inventario: tus clientes ven disponibilidad actualizada al instante, sin sorpresas ni pedidos imposibles.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
    { icon: ClipboardListIcon, title: "Gestión de Pedidos Completa", desc: "Creá, editá y seguí el estado de cada pedido. Flujo completo desde el alta hasta el despacho, con historial y detalles.", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/40" },
    { icon: BanknotesIcon, title: "Precios Personalizados por Cliente", desc: "Motor de precios B2B con 4 niveles de prioridad: precio específico por cliente, lista comercial, zona y precio general. Cada cliente ve solo sus condiciones.", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    { icon: TagIcon, title: "Listas de Precios Comerciales", desc: "Creá listas de precios diferenciadas para segmentos, canales o campañas. Asignar una lista a un cliente actualiza todos sus precios automáticamente.", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/40" },
    { icon: UserGroupIcon, title: "Segmentación Comercial", desc: "Clasificá tus clientes por segmento (minorista, mayorista, autoservicio, supermercado, estratégico) con condiciones de pago, límite de crédito y descuentos propios.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
    { icon: ShoppingCartIcon, title: "Pedidos Online 24/7", desc: "Tus clientes arman pedidos cuando quieran, desde cualquier dispositivo, sin llamadas ni WhatsApp.", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/40" },
    { icon: DocumentTextIcon, title: "Importación CSV / Excel", desc: "Cargá productos, clientes y zonas logísticas masivamente desde archivos CSV o Excel. Rápido y sin errores manuales.", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-900/40" },
    { icon: TruckIcon, title: "Logística por Zonas", desc: "Costos y tiempos de entrega calculados automáticamente según zona geográfica y provincia del cliente. Visible antes de confirmar el pedido.", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
    { icon: TrendingUpIcon, title: "Reportes y Analytics", desc: "Visualizá ventas del mes, pedidos pendientes, stock bajo y métricas clave desde el panel de reportes en tiempo real.", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-900/40" },
    { icon: UsersIcon, title: "Roles y Permisos Avanzados", desc: "Accesos diferenciados para Super Admin, Distribuidor y Cliente. Cada rol ve y gestiona solo lo que le corresponde.", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/40" },
    { icon: BuildingOfficeIcon, title: "Multi-Distribuidor", desc: "Un mismo cliente puede comprar a varios distribuidores desde una sola cuenta, reflejando la realidad del comercio mayorista.", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
    { icon: ShieldCheckIcon, title: "Seguro y Confiable", desc: "Autenticación con tokens Sanctum, sesiones protegidas y control de acceso estricto por rol. Tus datos siempre seguros.", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/40" },
  ];

  const steps = [
    { num: "01", title: "Registrá tu empresa", desc: "Creá tu cuenta de distribuidor y configurá tu catálogo de productos." },
    { num: "02", title: "Invitá a tus clientes", desc: "Cada cliente mayorista accede con su propia cuenta y ve precios personalizados." },
    { num: "03", title: "Recibí pedidos online", desc: "Los pedidos llegan organizados con costo logístico y tiempo estimado." },
    { num: "04", title: "Gestioná y despachá", desc: "Controlá el estado de cada pedido, stock y logística desde el panel." },
  ];

  const stats = [
    { value: "100%", label: "Online", desc: "Accedé desde cualquier lugar" },
    { value: "24/7", label: "Disponible", desc: "Sin horarios de atención" },
    { value: "0", label: "Errores de pedido", desc: "Todo digitalizado y validado" },
    { value: "∞", label: "Escalable", desc: "Crecé sin límites" },
  ];

  const marqueeItems = [
    "Stock en Tiempo Real", "Pedidos Online 24/7", "Logística por Zonas", "Multi-Distribuidor",
    "Importación CSV/Excel", "Reportes y Analytics", "Roles y Permisos", "Gestión de Pedidos",
    "Precios por Cliente", "Listas Comerciales", "Motor de Precios B2B", "Segmentación Comercial",
    "Modo Oscuro", "Responsive", "Seguro", "Sin WhatsApp", "Automatizado", "Multi-provincia",
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            distriboo
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#planes" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Planes y Precios</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <a
              href="#planes"
              className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
            >
              Contratar Ahora
            </a>
            <Link
              href="/login"
              className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
            {/* Hamburger button - mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <nav className="flex flex-col px-4 py-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cómo Funciona
              </a>
              <a
                href="#planes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                Planes y Precios
              </a>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                <a
                  href="#planes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Contratar Ahora
                </a>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <BoltIcon className="w-4 h-4" />
              Plataforma B2B para distribuidores
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Pedidos inteligentes para{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                tu distribución
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Centralizá pedidos, personalizá precios por cliente, controlá stock
              en tiempo real y gestioná la logística por zona. Todo lo que tu distribuidora necesita.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#planes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-blue-600/25"
              >
                Ver Planes y Precios
                <ArrowRightIcon className="w-5 h-5" />
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              >
                Ver Funcionalidades
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-6 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-500" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Todo lo que necesitás en un solo lugar
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Herramientas potentes y fáciles de usar para modernizar tu operación de distribución mayorista.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">{s.value}</div>
                <div className="text-lg font-semibold mb-1">{s.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Cómo funciona
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              En 4 simples pasos, transformá la forma en que gestionás tu distribución.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-extrabold text-gray-100 dark:text-gray-800 mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 w-8">
                    <ArrowRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits banner */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Dejá de tomar pedidos por WhatsApp
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Menos errores, más velocidad. Tus clientes hacen pedidos organizados y vos te enfocás en despachar.
              </p>
              <a
                href="#planes"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Ver Planes y Precios
                <ArrowRightIcon className="w-5 h-5" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ClockIcon, text: "Ahorrá tiempo en gestión" },
                { icon: GlobeIcon, text: "Acceso desde cualquier lugar" },
                { icon: CheckCircleIcon, text: "Cero errores de pedido" },
                { icon: ChartBarIcon, text: "Reportes en tiempo real" },
              ].map((b, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-start gap-3">
                  <b.icon className="w-6 h-6 text-blue-200 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-blue-50">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Value prop */}
      <section className="py-20 sm:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-8">
            <CubeIcon className="w-8 h-8" />
          </div>
          <blockquote className="text-2xl sm:text-3xl font-semibold leading-relaxed mb-6">
            &ldquo;Distriboo simplifica la operación mayorista: desde el pedido hasta
            el despacho, todo en un solo sistema moderno y eficiente.&rdquo;
          </blockquote>
          <p className="text-gray-500 dark:text-gray-400">
            Diseñado para distribuidores que quieren crecer sin complicaciones.
          </p>
        </div>
      </section>

      {/* Plans CTA Banner */}
      <section className="py-12 bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Elegí el plan ideal para tu distribuidora
          </h2>
          <p className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
            Desde $60.000/mes. Descuentos de hasta 30% por contrato anual. Sin compromiso de permanencia.
          </p>
          <a
            href="#planes"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg"
          >
            Ver Planes Ahora
            <ArrowRightIcon className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Pricing Plans */}
      <PricingSection />

      {/* Final CTA */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simplificá tu operación mayorista
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Sumate a la plataforma que moderniza la distribución. Comenzá hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#planes"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-blue-600/25"
            >
              Ver Planes
              <ArrowRightIcon className="w-5 h-5" />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">distriboo</span>
              <span className="text-gray-600">|</span>
              <span className="text-sm">Plataforma B2B para distribuidores</span>
            </div>
            <div className="text-sm">
              Desarrollado por{" "}
              <a
                href="https://yoisar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Yoisar
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
