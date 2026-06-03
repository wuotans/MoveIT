import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EquipmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      const list = await base44.entities.Equipment.filter({ id });
      return list[0];
    },
  });

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (equipment && !form) {
      setForm({
        name: equipment.name || "",
        type: equipment.type || "",
        brand: equipment.brand || "",
        model: equipment.model || "",
        subtype: equipment.subtype || "",
        patrimony_number: equipment.patrimony_number || "",
        tag: equipment.tag || "",
        current_location: equipment.current_location || "",
        status: equipment.status || "disponivel",
        notes: equipment.notes || "",
      });
    }
  }, [equipment]);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Equipamento atualizado!");
      navigate(`/equipamento/${id}`);
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.patrimony_number) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Equipamento</h1>
          <p className="text-muted-foreground text-sm">{equipment.name}</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computador">Computador</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="servidor">Servidor</SelectItem>
                    <SelectItem value="wifi">Wi-Fi</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.type === "computador" && (
              <div className="space-y-2">
                <Label>Subtipo</Label>
                <Select value={form.subtype} onValueChange={(v) => handleChange("subtype", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop (CPU)</SelectItem>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="thin_client">Thin Client (TCT)</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={form.model} onChange={(e) => handleChange("model", e.target.value)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº Patrimônio *</Label>
                <Input value={form.patrimony_number} onChange={(e) => handleChange("patrimony_number", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tag</Label>
                <Input value={form.tag} onChange={(e) => handleChange("tag", e.target.value)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input value={form.current_location} onChange={(e) => handleChange("current_location", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_uso">Em uso</SelectItem>
                    <SelectItem value="em_transito">Em trânsito</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="desativado">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending} className="flex-1 gap-2">
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}