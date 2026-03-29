"use client";

import Link from "next/link";
import type { User } from "@/types";

interface AppHeaderProps {
  user?: User | null;
  title?: string;
  onLogout?: () => void;
}

export default function AppHeader({ user, title, onLogout }: AppHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Distriboo
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/productos" className="text-gray-600 hover:text-gray-900">
                Catálogo
              </Link>
              <Link href="/pedidos" className="text-gray-600 hover:text-gray-900">
                Pedidos
              </Link>
              {user.role !== "cliente" && (
                <>
                  <span className="text-gray-300">|</span>
                  <Link href="/admin/productos" className="text-blue-600 hover:text-blue-800">
                    Productos
                  </Link>
                  <Link href="/admin/clientes" className="text-blue-600 hover:text-blue-800">
                    Clientes
                  </Link>
                  <Link href="/admin/zonas" className="text-blue-600 hover:text-blue-800">
                    Zonas
                  </Link>
                  <Link href="/admin/pedidos" className="text-blue-600 hover:text-blue-800">
                    Gestión Pedidos
                  </Link>
                  <Link href="/admin/usuarios" className="text-blue-600 hover:text-blue-800">
                    Usuarios
                  </Link>
                  <Link href="/admin/reportes" className="text-green-600 hover:text-green-800">
                    Reportes
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {title && (
            <span className="text-sm text-gray-500">{title}</span>
          )}
          {user && (
            <>
              <span className="text-sm text-gray-600">
                {user.name}{" "}
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user.role === "super_admin" ? "Super Admin" : user.role === "distribuidor" ? "Distribuidor" : "Cliente"}
                </span>
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Salir
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
