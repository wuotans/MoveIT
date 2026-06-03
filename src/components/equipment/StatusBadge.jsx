import { Badge } from "@/components/ui/badge";

const statusConfig = {
  disponivel: { label: "Disponível", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  em_uso: { label: "Em uso", className: "bg-blue-100 text-blue-700 border-blue-200" },
  em_transito: { label: "Em trânsito", className: "bg-amber-100 text-amber-700 border-amber-200" },
  manutencao: { label: "Manutenção", className: "bg-orange-100 text-orange-700 border-orange-200" },
  desativado: { label: "Desativado", className: "bg-red-100 text-red-700 border-red-200" },
};

const movementStatusConfig = {
  em_transito: { label: "Em Trânsito", className: "bg-amber-100 text-amber-700 border-amber-200" },
  instalado: { label: "Instalado", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
};

export function EquipmentStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.disponivel;
  return <Badge className={`border ${config.className}`}>{config.label}</Badge>;
}

export function MovementStatusBadge({ status }) {
  const config = movementStatusConfig[status] || movementStatusConfig.em_transito;
  return <Badge className={`border ${config.className}`}>{config.label}</Badge>;
}