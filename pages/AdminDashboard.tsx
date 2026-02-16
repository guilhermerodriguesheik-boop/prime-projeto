
import React, { useMemo } from 'react';
import { Fueling, MaintenanceRequest, Vehicle, FuelingStatus, FixedExpense, DailyRoute, RouteDeparture, AgregadoFreight } from '../types';
import { Card } from '../components/UI';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  fuelings: Fueling[];
  maintenances: MaintenanceRequest[];
  vehicles: Vehicle[];
  fixedExpenses: FixedExpense[];
  dailyRoutes?: DailyRoute[];
  routes?: RouteDeparture[];
  agregadoFreights?: AgregadoFreight[];
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  fuelings, 
  maintenances, 
  vehicles, 
  fixedExpenses, 
  dailyRoutes = [], 
  routes = [], 
  agregadoFreights = [],
  onBack 
}) => {
  const stats = useMemo(() => {
    const totalFuelApproved = fuelings
      .filter(f => f.status === FuelingStatus.APROVADO)
      .reduce((sum, f) => sum + Number(f.valor || 0), 0);
    
    const totalFixed = fixedExpenses.reduce((sum, e) => sum + Number(e.valor || 0), 0);
    
    // Soma rigorosa de todas as fontes de receita (Rotas do Dia + Saídas OC + Fretes Agregados)
    const revenueFromDaily = dailyRoutes.reduce((sum, r) => sum + Number(r.valorFrete || 0), 0);
    const revenueFromRoutes = routes.reduce((sum, r) => sum + Number(r.valorFrete || 0), 0);
    const revenueFromAgregados = agregadoFreights.reduce((sum, r) => sum + Number(r.valorFrete || 0), 0);
    
    const totalRevenue = revenueFromDaily + revenueFromRoutes + revenueFromAgregados;

    const vehicleStatus = {
      rodando: vehicles.filter(v => v.status === 'rodando').length,
      manutencao: vehicles.filter(v => v.status === 'manutencao').length,
      parado: vehicles.filter(v => v.status === 'parado').length,
    };

    return { totalFuelApproved, totalFixed, totalRevenue, vehicleStatus };
  }, [fuelings, vehicles, fixedExpenses, dailyRoutes, routes, agregadoFreights]);

  const recentLogs = useMemo(() => {
    const logs = [
      ...fuelings.map(f => ({ date: f.createdAt, type: 'Abastecimento', desc: `Placa ${f.placa} - R$ ${Number(f.valor || 0).toLocaleString()}`, icon: <TrendingUp size={14} />, color: 'text-blue-400' })),
      ...maintenances.map(m => ({ date: m.createdAt, type: 'Manutenção', desc: `${m.tipo} na ${m.placa}`, icon: <Activity size={14} />, color: 'text-indigo-400' })),
      ...dailyRoutes.map(d => ({ date: d.createdAt, type: 'Rota', desc: `${d.placa} para ${d.clienteNome}`, icon: <ArrowUpRight size={14} />, color: 'text-emerald-400' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
    return logs;
  }, [fuelings, maintenances, dailyRoutes]);

  const chartData = [
    { name: 'Rodando', value: stats.vehicleStatus.rodando, color: '#10b981' },
    { name: 'Manutenção', value: stats.vehicleStatus.manutencao, color: '#f59e0b' },
    { name: 'Parado', value: stats.vehicleStatus.parado, color: '#ef4444' },
  ];

  const financialMix = [
    { name: 'Receita', value: stats.totalRevenue, color: '#10b981' },
    { name: 'Custo Var', value: stats.totalFuelApproved, color: '#3b82f6' },
    { name: 'Custo Fixo', value: stats.totalFixed, color: '#6366f1' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Visão Geral da Operação Prime Group</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-700 transition-all text-xs uppercase tracking-widest">Voltar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-emerald-900/10 border-emerald-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Faturamento Bruto</div>
          <div className="text-3xl font-black">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <ArrowUpRight className="absolute -bottom-2 -right-2 text-emerald-500/10 w-16 h-16 group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="bg-blue-900/10 border-blue-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Combustível (Aprovado)</div>
          <div className="text-3xl font-black">R$ {stats.totalFuelApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <TrendingUp className="absolute -bottom-2 -right-2 text-blue-500/10 w-16 h-16 group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="bg-indigo-900/10 border-indigo-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-indigo-500 uppercase mb-1 tracking-widest">Custos Fixos Totais</div>
          <div className="text-3xl font-black">R$ {stats.totalFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <ArrowDownRight className="absolute -bottom-2 -right-2 text-indigo-500/10 w-16 h-16 group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden group">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Frota Ativa</div>
          <div className="text-3xl font-black">{vehicles.length} <span className="text-sm font-medium opacity-40 uppercase">unidades</span></div>
          <Activity className="absolute -bottom-2 -right-2 text-slate-500/10 w-16 h-16 group-hover:scale-110 transition-transform" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
            Fluxo Operacional Mensal
          </h3>
          <div className="h-80 w-full flex flex-col md:flex-row">
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialMix}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {financialMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:w-64 flex flex-col justify-center gap-4 p-4">
              {financialMix.map(item => (
                <div key={item.name} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">R$ {item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[9px] font-black text-slate-500 uppercase">Resultado Projetado</div>
                <div className={`text-xl font-black ${stats.totalRevenue - (stats.totalFuelApproved + stats.totalFixed) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  R$ {(stats.totalRevenue - (stats.totalFuelApproved + stats.totalFixed)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-5 bg-indigo-600 rounded-full"></span>
            Últimas Atividades
          </h3>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-700 italic text-xs uppercase font-black">Sem atividades registradas</div>
            ) : (
              recentLogs.map((log, i) => (
                <div key={i} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-center gap-4 group hover:border-slate-700 transition-all">
                  <div className={`w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center ${log.color}`}>
                    {log.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-white uppercase truncate">{log.desc}</div>
                    <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{new Date(log.date).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
