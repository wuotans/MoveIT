import { Badge } from "@/components/ui/badge";
import { Monitor, Server, Wifi, ArrowRightLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const typeIcons = {
  computador: Monitor,
  monitor: Monitor,
  servidor: Server,
  wifi: Wifi,
  switch: ArrowRightLeft,
};

const typeLabels = {
  computador: "Computador",
  monitor: "Monitor",
  servidor: "Servidor",
  wifi: "Wi-Fi",
  switch: "Switch",
};

const statusLabels = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  em_transito: "Em trânsito",
  manutencao: "Manutenção",
  desativado: "Desativado",
};

const statusColors = {
  disponivel: "bg-emerald-100 text-emerald-700 border-emerald-200",
  em_uso: "bg-blue-100 text-blue-700 border-blue-200",
  em_transito: "bg-amber-100 text-amber-700 border-amber-200",
  manutencao: "bg-orange-100 text-orange-700 border-orange-200",
  desativado: "bg-red-100 text-red-700 border-red-200",
};

export default function EquipmentCard({ equipment }) {
  const Icon = typeIcons[equipment.type] || Monitor;

  return (
    <Link
      to={`/equipamento/${equipment.id}`}
      className="block bg-card rounded-xl border border-border p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{equipment.name}</h3>
          <p className="text-sm text-muted-foreground">
            {typeLabels[equipment.type] || equipment.type}
            {equipment.brand && ` • ${equipment.brand}`}
            {equipment.model && ` ${equipment.model}`}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              PAT: {equipment.patrimony_number}
            </Badge>
            {equipment.tag && (
              <Badge variant="outline" className="text-xs">
                TAG: {equipment.tag}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            {equipment.current_location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{equipment.current_location}</span>
              </div>
            )}
            <Badge className={`text-xs border ${statusColors[equipment.status] || statusColors.disponivel}`}>
              {statusLabels[equipment.status] || "Disponível"}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}