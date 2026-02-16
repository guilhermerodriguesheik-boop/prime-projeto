
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
    const safeNum = (val: any): number => {
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    const totalFuelApproved = fuelings
      .filter(f => f.status === FuelingStatus.APROVADO)
      .reduce((sum, f) => Number(sum) + safeNum(f.valor), 0);
    
    const totalFixed = fixedExpenses.reduce((sum, e) => Number(sum) + safeNum(e.valor), 0);
    
    const revDaily = dailyRoutes.reduce((sum, r) => Number(sum) + safeNum(r.valorFrete), 0);
    const revRoutes = routes.reduce((sum, r) => Number(sum) + safeNum(r.valorFrete), 0);
    const revAgregados = agregadoFreights.reduce((sum, r) => Number(sum) + safeNum(r.valorFrete), 0);
    
    const totalRevenue = safeNum(revDaily) + safeNum(revRoutes) + safeNum(revAgregados);

    const vehicleStatus = {
      rodando: vehicles.filter(v => v.status === 'rodando').length,
      manutencao: vehicles.filter(v => v.status === 'manutencao').length,
      parado: vehicles.filter(v => v.status === 'parado').length,
    };

    return { totalFuelApproved, totalFixed, totalRevenue, vehicleStatus };
  }, [fuelings, vehicles, fixedExpenses, dailyRoutes, routes, agregadoFreights]);

  const financialMix = [
    { name: 'Receita Operacional', value: stats.totalRevenue, color: '#10b981' },
    { name: 'Custo Combustível', value: stats.totalFuelApproved, color: '#3b82f6' },
    { name: 'Custos Administrativos', value: stats.totalFixed, color: '#6366f1' },
  ];

  const totalCosts = Number(stats.totalFuelApproved) + Number(stats.totalFixed);
  const netResult = Number(stats.totalRevenue) - totalCosts;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">Executive Dashboard</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão Financeira Consolidada Prime Group</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-700 transition-all text-xs uppercase tracking-widest text-white">Voltar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-emerald-900/10 border-emerald-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Faturamento Bruto</div>
          <div className="text-3xl font-black text-white">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <ArrowUpRight className="absolute -bottom-2 -right-2 text-emerald-500/10 w-16 h-16" />
        </Card>
        <Card className="bg-blue-900/10 border-blue-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Combustível (Aprovado)</div>
          <div className="text-3xl font-black text-white">R$ {stats.totalFuelApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <TrendingUp className="absolute -bottom-2 -right-2 text-blue-500/10 w-16 h-16" />
        </Card>
        <Card className="bg-indigo-900/10 border-indigo-900/40 relative overflow-hidden group">
          <div className="text-[10px] font-black text-indigo-500 uppercase mb-1 tracking-widest">Custos Administrativos</div>
          <div className="text-3xl font-black text-white">R$ {stats.totalFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <ArrowDownRight className="absolute -bottom-2 -right-2 text-indigo-500/10 w-16 h-16" />
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden group">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Frota Monitorada</div>
          <div className="text-3xl font-black text-white">{vehicles.length} <span className="text-xs opacity-40 uppercase">unid</span></div>
          <Activity className="absolute -bottom-2 -right-2 text-slate-500/10 w-16 h-16" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-white">Distribuição Financeira</h3>
          <div className="h-80 w-full flex flex-col md:flex-row">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={financialMix} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {financialMix.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:w-64 flex flex-col justify-center gap-4 p-4">
              {financialMix.map(item => (
                <div key={item.name} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase">{item.name}</span>
                  <span className="text-xs font-bold text-white">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center shadow-inner">
                <div className="text-[9px] font-black text-slate-500 uppercase">Resultado Líquido Consolidado</div>
                <div className={`text-xl font-black ${netResult >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  R$ {netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
