"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import type { User } from "@/types";

interface AppLayoutProps {
  user: User | null;
  title?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

export default function AppLayout({ user, title, onLogout, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area (offset by sidebar on large screens) */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {title && (
              <h1 className="text-lg font-semibold text-white">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {user.name}
              <span className="ml-2 text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Salir
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
