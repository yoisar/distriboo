"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  ClipboardListIcon,
  UsersIcon,
  TruckIcon,
  DocumentTextIcon,
  KeyIcon,
  TrendingUpIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UserGroupIcon,
  TagIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@/components/ui/Icons";
import type { User } from "@/types";
import type { ReactNode } from "react";

interface SidebarProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
}

const dashboardLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: <ChartBarIcon /> },
];

const clienteLinks: NavLink[] = [
  { href: "/productos", label: "Catálogo", icon: <CubeIcon /> },
  { href: "/pedidos/nuevo", label: "Nuevo Pedido", icon: <ShoppingCartIcon /> },
  { href: "/pedidos", label: "Mis Pedidos", icon: <ClipboardListIcon /> },
];

const adminLinks: NavLink[] = [
  { href: "/admin/productos", label: "Productos", icon: <CubeIcon /> },
  { href: "/admin/clientes", label: "Clientes", icon: <UsersIcon /> },
  { href: "/admin/zonas", label: "Zonas Logísticas", icon: <TruckIcon /> },
  { href: "/admin/pedidos", label: "Gestión Pedidos", icon: <DocumentTextIcon /> },
  { href: "/admin/usuarios", label: "Usuarios", icon: <KeyIcon /> },
  { href: "/admin/reportes", label: "Reportes", icon: <TrendingUpIcon /> },
];

const revendedorLinks: NavLink[] = [
  { href: "/revendedor/mis-clientes", label: "Mis Clientes", icon: <UserGroupIcon /> },
  { href: "/revendedor/comisiones", label: "Comisiones", icon: <BanknotesIcon /> },
  { href: "/revendedor/liquidaciones", label: "Liquidaciones", icon: <DocumentTextIcon /> },
  { href: "/revendedor/perfil", label: "Mi Perfil", icon: <UserIcon /> },
];

const superAdminLinks: NavLink[] = [
  { href: "/admin/distribuidores", label: "Distribuidores", icon: <BuildingOfficeIcon /> },
  { href: "/admin/revendedores", label: "Revendedores", icon: <UserGroupIcon /> },
  { href: "/admin/planes", label: "Planes", icon: <TagIcon /> },
  { href: "/admin/comisiones", label: "Comisiones", icon: <BanknotesIcon /> },
  { href: "/admin/configuracion", label: "Configuración", icon: <Cog6ToothIcon /> },
];

export default function Sidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "super_admin" || user.role === "distribuidor";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/pedidos") return pathname === "/pedidos";
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600 tracking-wide">
            distriboo
          </Link>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {dashboardLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {user.role === "cliente" && clienteLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {user.role === "revendedor" && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Revendedor
                </p>
              </div>
              {revendedorLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Administración
                </p>
              </div>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {user.role === "super_admin" && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Super Admin
                </p>
              </div>
              {superAdminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === "super_admin" ? "Super Admin" : user.role === "distribuidor" ? "Distribuidor" : user.role === "revendedor" ? "Revendedor" : "Cliente"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
