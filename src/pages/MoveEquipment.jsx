import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import FileUpload from "@/components/equipment/FileUpload";

export default function MoveEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      const list = await base44.entities.Equipment.filter({ id });
      return list[0];
    },
  });

  const [form, setForm] = useState({
    user_name: user?.full_name || "",
    to_location: "",
    glpi_ticket: "",
    request_proof_url: "",
    installed_photo_url: "",
    notes: "",
  });

  const moveMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Movement.create({
        equipment_id: id,
        equipment_name: equipment.name,
        from_location: equipment.current_location || "",
        status: data.installed_photo_url ? "instalado" : "em_transito",
        ...data,
      });
      await base44.entities.Equipment.update(id, {
        current_location: data.to_location,
        status: data.installed_photo_url ? "em_uso" : "em_transito",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setSuccess(true);
    },
  });

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.user_name || !form.to_location) {
      toast.error("Preencha seu nome e o local de destino");
      return;
    }
    if (!form.glpi_ticket && !form.request_proof_url) {
      toast.error("Informe o número do chamado GLPI ou anexe uma prova da solicitação");
      return;
    }
    moveMutation.mutate(form);
  };

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
        <p className="text-muted-foreground mb-2">Equipamento não encontrado</p>
        <Link to="/equipamentos" className="text-primary hover:underline text-sm">Voltar</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold">Movimentação Registrada!</h2>
        <p className="text-muted-foreground">
          <strong>{equipment.name}</strong> foi movido para <strong>{form.to_location}</strong>
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link to="/">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link to={`/equipamento/${id}`}>
            <Button>Ver Equipamento</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentar Equipamento</h1>
          <p className="text-muted-foreground text-sm">Registrar movimentação</p>
        </div>
      </div>

      {/* Equipment Info */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{equipment.name}</p>
              <p className="text-sm text-muted-foreground">
                PAT: {equipment.patrimony_number}
                {equipment.current_location && ` • Local atual: ${equipment.current_location}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement Form */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Seu Nome *</Label>
              <Input
                placeholder="Seu nome completo"
                value={form.user_name}
                onChange={(e) => handleChange("user_name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Local de Destino *</Label>
              <Input
                placeholder="Ex: Sala 301, Andar 2, Filial Centro"
                value={form.to_location}
                onChange={(e) => handleChange("to_location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nº Chamado GLPI</Label>
              <Input
                placeholder="Ex: 12345"
                value={form.glpi_ticket}
                onChange={(e) => handleChange("glpi_ticket", e.target.value)}
              />
            </div>

            <FileUpload
              label="Print / Prova da Solicitação"
              value={form.request_proof_url}
              onChange={(url) => handleChange("request_proof_url", url)}
            />

            <FileUpload
              label="Foto do Equipamento Instalado (opcional)"
              value={form.installed_photo_url}
              onChange={(url) => handleChange("installed_photo_url", url)}
            />

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Informações adicionais..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={moveMutation.isPending} className="w-full gap-2 h-12 text-base">
              {moveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Registrar Movimentação
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}