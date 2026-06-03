import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Monitor, Server, Wifi, ArrowRightLeft, MapPin, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useAuth } from "@/lib/AuthContext";

const typeLabels = { computador: "Computadores", monitor: "Monitores", servidor: "Servidores", wifi: "Wi-Fi", switch: "Switches" };
const statusLabels = { disponivel: "Disponível", em_uso: "Em uso", em_transito: "Em trânsito", manutencao: "Manutenção", desativado: "Desativado" };
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => base44.entities.Equipment.list("-created_date", 500),
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["movements"],
    queryFn: () => base44.entities.Movement.list("-created_date", 50),
  });

  const totalEquipment = equipment.length;
  const inUse = equipment.filter((e) => e.status === "em_uso").length;
  const inTransit = equipment.filter((e) => e.status === "em_transito").length;
  const inMaintenance = equipment.filter((e) => e.status === "manutencao").length;

  const typeData = Object.entries(
    equipment.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: typeLabels[name] || name, value }));

  const statusData = Object.entries(
    equipment.reduce((acc, e) => { acc[e.status || "disponivel"] = (acc[e.status || "disponivel"] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: statusLabels[name] || name, value }));

  const locationData = Object.entries(
    equipment.filter((e) => e.current_location).reduce((acc, e) => { acc[e.current_location] = (acc[e.current_location] || 0) + 1; return acc; }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Olá, {user?.full_name || "Usuário"}. Visão geral dos equipamentos.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{totalEquipment}</p>
                <p className="text-xs text-blue-600/70">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{inUse}</p>
                <p className="text-xs text-emerald-600/70">Em uso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{inTransit}</p>
                <p className="text-xs text-amber-600/70">Em trânsito</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{inMaintenance}</p>
                <p className="text-xs text-red-600/70">Manutenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {typeData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Por Localização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(217, 91%, 50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statusData.map((item, i) => (
              <div key={item.name} className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação registrada</p>
          ) : (
            <div className="space-y-3">
              {movements.slice(0, 5).map((mov) => (
                <div key={mov.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mov.equipment_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mov.from_location || "—"} → {mov.to_location} • {mov.user_name}
                    </p>
                  </div>
                  {mov.glpi_ticket && (
                    <span className="text-xs text-muted-foreground">GLPI #{mov.glpi_ticket}</span>
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