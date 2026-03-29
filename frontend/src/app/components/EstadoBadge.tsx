import type { EstadoPedido } from "@/types";

export const estadoColors: Record<EstadoPedido, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  en_proceso: "bg-indigo-100 text-indigo-800",
  enviado: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
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
