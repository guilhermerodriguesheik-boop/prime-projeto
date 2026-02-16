
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
    // CORREÇÃO: Aplica Number() rigoroso em todas as reduções
    const totalFuelApproved = fuelings
      .filter(f => f.status === FuelingStatus.APROVADO)
      .reduce((sum, f) => sum + Number(f.valor || 0), 0);
    
    const totalFixed = fixedExpenses.reduce((sum, e) => sum + Number(e.valor || 0), 0);
    
    const revDaily = dailyRoutes.reduce((sum, r) => sum + Number(r.valorFrete || 0), 0);
    const revRoutes = routes.reduce((sum, r) => sum + Number(r.valorFrete || 0), 0);
    const revAgregados = agregadoFreights.reduce((sum, r) => sum + Number(r.valorFrete || 0), 0);
    
    const totalRevenue = revDaily + revRoutes + revAgregados;

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
        </Card>
        <Card className="bg-blue-900/10 border-blue-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Combustível (Aprovado)</div>
          <div className="text-3xl font-black">R$ {stats.totalFuelApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="bg-indigo-900/10 border-indigo-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-indigo-500 uppercase mb-1 tracking-widest">Custos Fixos Totais</div>
          <div className="text-3xl font-black">R$ {stats.totalFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden group">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Frota Ativa</div>
          <div className="text-3xl font-black">{vehicles.length}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">Fluxo Operacional Mensal</h3>
        <div className="h-80 w-full flex flex-col md:flex-row">
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={financialMix} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {financialMix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="md:w-64 flex flex-col justify-center gap-4 p-4">
            {financialMix.map(item => (
              <div key={item.name} className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] text-slate-400 font-black uppercase">{item.name}</span>
                <span className="text-xs font-bold text-white">R$ {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
