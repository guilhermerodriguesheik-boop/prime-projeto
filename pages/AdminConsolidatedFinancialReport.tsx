
import React, { useState, useMemo } from 'react';
import { DailyRoute, RouteDeparture, Fueling, MaintenanceRequest, Toll, AgregadoFreight, FixedExpense, FuelingStatus, MaintenanceStatus } from '../types';
import { Card, Input } from '../components/UI';

interface AdminConsolidatedFinancialReportProps {
  dailyRoutes: DailyRoute[];
  routes: RouteDeparture[];
  fuelings: Fueling[];
  maintenances: MaintenanceRequest[];
  tolls: Toll[];
  agregadoFreights: AgregadoFreight[];
  fixedExpenses: FixedExpense[];
  onBack: () => void;
}

const AdminConsolidatedFinancialReport: React.FC<AdminConsolidatedFinancialReportProps> = ({
  dailyRoutes, routes, fuelings, maintenances, tolls, agregadoFreights, fixedExpenses, onBack
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const summary = useMemo(() => {
    const safeNum = (v: any) => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filterDate = (d: string) => {
      if (!start || !end) return true;
      const date = new Date(d);
      return date >= start && date <= end;
    };

    // Receitas
    const revRoutes = routes.filter(r => filterDate(r.createdAt)).reduce((sum, r) => Number(sum) + safeNum(r.valorFrete), 0);
    const revDaily = dailyRoutes.filter(r => filterDate(r.createdAt)).reduce((sum, r) => Number(sum) + safeNum(r.valorFrete), 0);
    const revAgregados = agregadoFreights.filter(r => filterDate(r.data)).reduce((sum, r) => Number(sum) + safeNum(r.valorFrete), 0);
    const totalRevenue = Number(revRoutes) + Number(revDaily) + Number(revAgregados);

    // Despesas Operacionais (Variáveis)
    const expFuel = fuelings.filter(f => f.status === FuelingStatus.APROVADO && filterDate(f.createdAt)).reduce((sum, f) => Number(sum) + safeNum(f.valor), 0);
    const expMaint = maintenances.filter(m => m.status === MaintenanceStatus.FEITA && filterDate(m.createdAt)).reduce((sum, m) => Number(sum) + safeNum(m.valor), 0);
    const expTolls = tolls.filter(t => filterDate(t.data)).reduce((sum, t) => Number(sum) + safeNum(t.valor), 0);
    
    // Despesas de Equipe
    const expTeamDaily = dailyRoutes.filter(r => filterDate(r.createdAt)).reduce((sum, r) => Number(sum) + safeNum(r.valorMotorista) + safeNum(r.valorAjudante), 0);
    const expTeamRoutes = routes.filter(r => filterDate(r.createdAt)).reduce((sum, r) => Number(sum) + safeNum(r.valorMotorista) + safeNum(r.valorAjudante), 0);
    const expAgregadoPai = agregadoFreights.filter(r => filterDate(r.data)).reduce((sum, r) => Number(sum) + safeNum(r.valorAgregado), 0);
    
    // Despesas Fixas
    const expFixed = fixedExpenses.filter(e => filterDate(e.createdAt)).reduce((sum, e) => Number(sum) + safeNum(e.valor), 0);

    const totalExpense = Number(expFuel) + Number(expMaint) + Number(expTolls) + Number(expTeamDaily) + Number(expTeamRoutes) + Number(expAgregadoPai) + Number(expFixed);

    return { totalRevenue, totalExpense };
  }, [dailyRoutes, routes, fuelings, maintenances, tolls, agregadoFreights, fixedExpenses, startDate, endDate]);

  const profit = Number(summary.totalRevenue) - Number(summary.totalExpense);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-3xl font-black uppercase text-white">Consolidado Financeiro</h2>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-700 text-xs uppercase text-white">Voltar</button>
      </div>

      <Card className="no-print bg-slate-900/40 border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Data Inicial" type="date" value={startDate} onChange={setStartDate} />
          <Input label="Data Final" type="date" value={endDate} onChange={setEndDate} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center bg-emerald-900/10 border-emerald-900/40">
          <div className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Entradas (Receitas)</div>
          <div className="text-3xl font-black text-white">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="text-center bg-red-900/10 border-red-900/40">
          <div className="text-[10px] font-black text-red-500 uppercase mb-1 tracking-widest">Saídas (Despesas Gerais)</div>
          <div className="text-3xl font-black text-white">R$ {summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className={`text-center shadow-2xl ${profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'}`}>
          <div className="text-[10px] font-black uppercase mb-1 tracking-widest">Lucro Real Líquido</div>
          <div className={`text-4xl font-black ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>
    </div>
  );
};

export default AdminConsolidatedFinancialReport;
