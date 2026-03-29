import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ToastProvider from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "Distriboo - Plataforma B2B",
  description: "Plataforma de pedidos para distribuidores mayoristas",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
