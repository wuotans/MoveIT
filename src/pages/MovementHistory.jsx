import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, FileText, Image as ImageIcon, History } from "lucide-react";
import { MovementStatusBadge } from "@/components/equipment/StatusBadge";
import { Link } from "react-router-dom";

export default function MovementHistory() {
  const [search, setSearch] = useState("");

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: () => base44.entities.Movement.list("-created_date", 200),
  });

  const filtered = movements.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.equipment_name?.toLowerCase().includes(s) ||
      m.user_name?.toLowerCase().includes(s) ||
      m.to_location?.toLowerCase().includes(s) ||
      m.from_location?.toLowerCase().includes(s) ||
      m.glpi_ticket?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Movimentações</h1>
        <p className="text-muted-foreground mt-1">Histórico de todas as movimentações</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por equipamento, usuário, local ou GLPI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((mov) => (
            <Card key={mov.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link
                        to={`/equipamento/${mov.equipment_id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {mov.equipment_name}
                      </Link>
                      <MovementStatusBadge status={mov.status} />
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {mov.from_location || "—"} → <span className="text-foreground font-medium">{mov.to_location}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>Por: <span className="font-medium text-foreground">{mov.user_name}</span></span>
                      {mov.glpi_ticket && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          GLPI #{mov.glpi_ticket}
                        </span>
                      )}
                      <span>{new Date(mov.created_date).toLocaleString("pt-BR")}</span>
                    </div>

                    {mov.notes && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg p-2">{mov.notes}</p>
                    )}
                  </div>
                </div>

                {(mov.request_proof_url || mov.installed_photo_url) && (
                  <div className="flex gap-3 mt-3 overflow-x-auto">
                    {mov.request_proof_url && (
                      <a href={mov.request_proof_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <div className="relative group">
                          <img src={mov.request_proof_url} alt="Prova" className="w-24 h-24 object-cover rounded-lg border" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs">Solicitação</span>
                          </div>
                        </div>
                      </a>
                    )}
                    {mov.installed_photo_url && (
                      <a href={mov.installed_photo_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <div className="relative group">
                          <img src={mov.installed_photo_url} alt="Instalado" className="w-24 h-24 object-cover rounded-lg border" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs">Instalado</span>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}