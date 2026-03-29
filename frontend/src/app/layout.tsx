import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distriboo - Plataforma B2B",
  description: "Plataforma de pedidos para distribuidores mayoristas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
