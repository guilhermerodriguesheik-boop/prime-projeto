
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

  const filteredData = useMemo(() => {
    const safeNum = (v: any) => { const n = Number(v); return isNaN(n) ? 0 : n; };
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filterDate = (d: string) => {
      if (!start || !end) return true;
      const date = new Date(d);
      return date >= start && date <= end;
    };

    const revenues = [
      ...dailyRoutes.filter(r => filterDate(r.createdAt)).map(r => ({ type: 'Receita', cat: 'Rota', val: safeNum(r.valorFrete), desc: r.oc })),
      ...routes.filter(r => filterDate(r.createdAt)).map(r => ({ type: 'Receita', cat: 'OC', val: safeNum(r.valorFrete), desc: r.oc })),
      ...agregadoFreights.filter(r => filterDate(r.data)).map(r => ({ type: 'Receita', cat: 'Agregado', val: safeNum(r.valorFrete), desc: r.oc }))
    ];

    const expenses = [
      ...dailyRoutes.filter(r => filterDate(r.createdAt)).map(r => ({ type: 'Despesa', cat: 'Equipe', val: safeNum(r.valorMotorista) + safeNum(r.valorAjudante), desc: 'Pagto Equipe' })),
      ...routes.filter(r => filterDate(r.createdAt)).map(r => ({ type: 'Despesa', cat: 'Equipe', val: safeNum(r.valorMotorista) + safeNum(r.valorAjudante), desc: 'Pagto Equipe' })),
      ...agregadoFreights.filter(r => filterDate(r.data)).map(r => ({ type: 'Despesa', cat: 'Agregado', val: safeNum(r.valorAgregado), desc: 'Pagto Agregado' })),
      ...fuelings.filter(f => f.status === FuelingStatus.APROVADO && filterDate(f.createdAt)).map(f => ({ type: 'Despesa', cat: 'Combustível', val: safeNum(f.valor), desc: f.placa })),
      ...maintenances.filter(m => m.status === MaintenanceStatus.FEITA && filterDate(m.createdAt)).map(m => ({ type: 'Despesa', cat: 'Manutenção', val: safeNum(m.valor), desc: m.placa })),
      ...tolls.filter(t => filterDate(t.data)).map(t => ({ type: 'Despesa', cat: 'Pedágio', val: safeNum(t.valor), desc: t.placa })),
      ...fixedExpenses.filter(e => filterDate(e.createdAt)).map(e => ({ type: 'Despesa', cat: 'Fixo', val: safeNum(e.valor), desc: e.descricao }))
    ];

    return [...revenues, ...expenses].reduce((acc, curr) => {
      if (curr.type === 'Receita') acc.totalRev += curr.val;
      else acc.totalExp += curr.val;
      return acc;
    }, { totalRev: 0, totalExp: 0 });
  }, [dailyRoutes, routes, fuelings, maintenances, tolls, agregadoFreights, fixedExpenses, startDate, endDate]);

  const profit = filteredData.totalRev - filteredData.totalExp;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-3xl font-bold">Relatório Consolidado</h2>
        <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-xl font-bold">Voltar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-[10px] font-black text-emerald-500 uppercase mb-1">Faturamento Total</div>
          <div className="text-2xl font-black text-emerald-400">R$ {filteredData.totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="text-center">
          <div className="text-[10px] font-black text-red-500 uppercase mb-1">Despesas Gerais</div>
          <div className="text-2xl font-black text-red-400">R$ {filteredData.totalExp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className={`text-center ${profit >= 0 ? 'border-emerald-500' : 'border-red-500'}`}>
          <div className="text-[10px] font-black uppercase mb-1">Lucro Líquido Real</div>
          <div className={`text-3xl font-black ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>
    </div>
  );
};

export default AdminConsolidatedFinancialReport;
