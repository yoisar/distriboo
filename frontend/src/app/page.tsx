import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">distriboo</h1>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Pedidos inteligentes para<br />tu distribución
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Centralizá tus pedidos, controlá el stock en tiempo real y gestioná
            la logística por provincia. La herramienta que tu distribuidora
            necesita.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors inline-block shadow-lg shadow-blue-600/25"
          >
            Empezar Ahora
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Todo lo que necesitás en un solo lugar
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                📦
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Stock en Tiempo Real</h4>
              <p className="text-sm text-gray-500">
                Tus clientes ven disponibilidad actualizada al instante.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🚚
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Logística por Provincia</h4>
              <p className="text-sm text-gray-500">
                Costos y tiempos de entrega calculados automáticamente.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                📊
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Panel de Control</h4>
              <p className="text-sm text-gray-500">
                Gestioná productos, clientes, pedidos y reportes desde un solo lugar.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🛒
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pedidos Online</h4>
              <p className="text-sm text-gray-500">
                Tus clientes arman pedidos cuando quieran, desde cualquier dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-4">
            Simplificá tu operación mayorista
          </h3>
          <p className="text-blue-100 text-lg mb-8">
            Menos errores, más velocidad. Dejá de tomar pedidos por WhatsApp.
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <span className="text-white font-semibold">distriboo</span>
            <span className="mx-2">·</span>
            <span className="text-sm">Plataforma B2B para distribuidores</span>
          </div>
          <div className="text-sm">
            Desarrollado por{" "}
            <a
              href="https://yoisar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Yoisar
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
