import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Edit, Trash2, QrCode, ArrowRightLeft, Loader2 } from "lucide-react";
import { EquipmentStatusBadge, MovementStatusBadge } from "@/components/equipment/StatusBadge";
import QRCodeGenerator from "@/components/equipment/QRCodeGenerator";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const typeLabels = { computador: "Computador", monitor: "Monitor", servidor: "Servidor", wifi: "Wi-Fi", switch: "Switch" };
const subtypeLabels = { desktop: "Desktop (CPU)", notebook: "Notebook", thin_client: "Thin Client (TCT)", outro: "Outro" };

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const isAdmin = user?.role === "admin";

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      const list = await base44.entities.Equipment.filter({ id });
      return list[0];
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["movements", id],
    queryFn: () => base44.entities.Movement.filter({ equipment_id: id }, "-created_date", 50),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Equipment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Equipamento excluído");
      navigate("/equipamentos");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Equipamento não encontrado</p>
        <Link to="/equipamentos" className="text-primary hover:underline text-sm mt-2 inline-block">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/mover/${equipment.id}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
          <p className="text-muted-foreground text-sm">{typeLabels[equipment.type]}</p>
        </div>
        <EquipmentStatusBadge status={equipment.status} />
      </div>

      {/* Info Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow label="Tipo" value={typeLabels[equipment.type]} />
            {equipment.subtype && <InfoRow label="Subtipo" value={subtypeLabels[equipment.subtype]} />}
            {equipment.brand && <InfoRow label="Marca" value={equipment.brand} />}
            {equipment.model && <InfoRow label="Modelo" value={equipment.model} />}
            <InfoRow label="Patrimônio" value={equipment.patrimony_number} />
            {equipment.tag && <InfoRow label="Tag" value={equipment.tag} />}
            {equipment.current_location && <InfoRow label="Localização" value={equipment.current_location} icon={<MapPin className="w-4 h-4" />} />}
            {equipment.notes && <div className="sm:col-span-2"><InfoRow label="Observações" value={equipment.notes} /></div>}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowQR(!showQR)} variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          {showQR ? "Ocultar QR" : "Ver QR Code"}
        </Button>
        <Link to={`/mover/${equipment.id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Movimentar
          </Button>
        </Link>
        {isAdmin && (
          <>
            <Link to={`/editar/${equipment.id}`}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O equipamento e seu histórico serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {/* QR Code */}
      {showQR && (
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4">
              Escaneie este QR Code para registrar a movimentação
            </p>
            <QRCodeGenerator data={qrUrl} size={200} />
            <p className="text-xs text-muted-foreground mt-3 text-center break-all">{qrUrl}</p>
          </CardContent>
        </Card>
      )}

      {/* Movement History */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Nenhuma movimentação registrada</p>
          ) : (
            <div className="space-y-4">
              {movements.map((mov) => (
                <div key={mov.id} className="p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{mov.user_name}</span>
                        <MovementStatusBadge status={mov.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mov.from_location || "—"} → <span className="text-foreground font-medium">{mov.to_location}</span>
                      </p>
                      {mov.glpi_ticket && (
                        <p className="text-xs text-muted-foreground mt-1">GLPI #{mov.glpi_ticket}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(mov.created_date).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {(mov.request_proof_url || mov.installed_photo_url) && (
                    <div className="flex gap-3 mt-3">
                      {mov.request_proof_url && (
                        <a href={mov.request_proof_url} target="_blank" rel="noopener noreferrer">
                          <img src={mov.request_proof_url} alt="Prova" className="w-20 h-20 object-cover rounded-lg border" />
                        </a>
                      )}
                      {mov.installed_photo_url && (
                        <a href={mov.installed_photo_url} target="_blank" rel="noopener noreferrer">
                          <img src={mov.installed_photo_url} alt="Instalado" className="w-20 h-20 object-cover rounded-lg border" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}