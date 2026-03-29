import type { EstadoPedido } from "@/types";

export const estadoColors: Record<EstadoPedido, string> = {
  pendiente: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300",
  confirmado: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  en_proceso: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300",
  enviado: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
  entregado: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  cancelado: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
};

interface EstadoBadgeProps {
  estado: EstadoPedido;
}

export default function EstadoBadge({ estado }: EstadoBadgeProps) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded ${estadoColors[estado] || ""}`}
    >
      {estado.replace("_", " ")}
    </span>
  );
}
