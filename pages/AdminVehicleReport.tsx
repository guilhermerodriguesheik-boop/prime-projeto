
import React, { useState, useMemo } from 'react';
import { Fueling, MaintenanceRequest, Vehicle, FuelingStatus, DailyRoute, RouteDeparture, MaintenanceStatus, Toll, FixedExpense } from '../types';
import { Card, Badge, Input, Select } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ComposedChart, Line } from 'recharts';

interface AdminVehicleReportProps {
  fuelings: Fueling[];
  maintenances: MaintenanceRequest[];
  vehicles: Vehicle[];
  dailyRoutes: DailyRoute[];
  routes: RouteDeparture[];
  tolls: Toll[];
  fixedExpenses: FixedExpense[];
  onBack: () => void;
  onUpdateDailyRoute: (id: string, update: Partial<DailyRoute>) => void;
  onUpdateRoute: (id: string, update: Partial<RouteDeparture>) => void;
}

const AdminVehicleReport: React.FC<AdminVehicleReportProps> = ({ 
  fuelings, 
  maintenances, 
  vehicles, 
  dailyRoutes, 
  routes, 
  tolls,
  fixedExpenses,
  onBack 
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dateFilteredData = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    
    const filterByDate = (dateStr: string) => {
      if (!start || !end) return true;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    return {
      f: fuelings.filter(x => filterByDate(x.createdAt)),
      m: maintenances.filter(x => filterByDate(x.createdAt)),
      dr: dailyRoutes.filter(x => filterByDate(x.createdAt)),
      r: routes.filter(x => filterByDate(x.createdAt)),
      t: tolls.filter(x => filterByDate(x.data)),
      fe: fixedExpenses.filter(x => x.dataCompetencia === startDate.slice(0, 7))
    };
  }, [startDate, endDate, fuelings, maintenances, dailyRoutes, routes, tolls, fixedExpenses]);

  const vehicleStats = useMemo(() => {
    const { f, m, dr, r, t } = dateFilteredData;
    return vehicles.map(v => {
      const vFuelings = f.filter(fuel => fuel.vehicleId === v.id && fuel.status === FuelingStatus.APROVADO);
      const vMaintenances = m.filter(maint => maint.vehicleId === v.id && maint.status === MaintenanceStatus.FEITA);
      const vDailyRoutes = dr.filter(daily => daily.vehicleId === v.id);
      const vRoutes = r.filter(route => route.vehicleId === v.id);
      const vTolls = t.filter(toll => toll.vehicleId === v.id);
      
      const gastoCombustivel = vFuelings.reduce((sum, fuel) => sum + Number(fuel.valor || 0), 0);
      const gastoManutencao = vMaintenances.reduce((sum, maint) => sum + Number(maint.valor || 0), 0);
      const gastoPedagio = vTolls.reduce((sum, toll) => sum + Number(toll.valor || 0), 0);
      
      const gastoEquipe = [
        ...vDailyRoutes.map(op => Number(op.valorMotorista || 0) + Number(op.valorAjudante || 0)),
        ...vRoutes.map(op => Number(op.valorMotorista || 0) + Number(op.valorAjudante || 0))
      ].reduce((sum, val) => sum + val, 0);
      
      const totalFrete = [...vDailyRoutes, ...vRoutes].reduce((sum, op) => sum + Number(op.valorFrete || 0), 0);
      const totalCustos = gastoCombustivel + gastoManutencao + gastoPedagio + gastoEquipe;
      const lucroOp = totalFrete - totalCustos;

      return {
        id: v.id,
        placa: v.placa,
        modelo: v.modelo,
        totalFrete,
        totalCustos,
        lucroOp,
        gastoCombustivel,
        gastoManutencao,
        gastoPedagio,
        gastoEquipe,
        margem: totalFrete > 0 ? ((lucroOp / totalFrete) * 100) : 0
      };
    }).sort((a, b) => b.totalFrete - a.totalFrete);
  }, [vehicles, dateFilteredData]);

  const totalDespesasFixas = useMemo(() => dateFilteredData.fe.reduce((sum, e) => sum + Number(e.valor || 0), 0), [dateFilteredData]);

  // CORREÇÃO: Garante acumulador numérico no fechamento de totais
  const totals = useMemo(() => {
    return vehicleStats.reduce((acc, curr) => ({
      frete: acc.frete + Number(curr.totalFrete || 0),
      custos: acc.custos + Number(curr.totalCustos || 0),
      lucroOp: acc.lucroOp + Number(curr.lucroOp || 0)
    }), { frete: 0, custos: 0, lucroOp: 0 });
  }, [vehicleStats]);

  const lucroLiquido = totals.lucroOp - totalDespesasFixas;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Desempenho</h2>
          <p className="text-slate-500 text-sm">Análise consolidada e individual da frota</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-700 text-xs">Voltar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 text-center">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Faturamento Bruto</div>
          <div className="text-xl font-black text-white">R$ {totals.frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="bg-red-900/10 border-red-900/40 text-center">
          <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Custos Frota (Var)</div>
          <div className="text-xl font-black text-white">R$ {totals.custos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="bg-indigo-900/10 border-indigo-900/40 text-center">
          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Despesas Fixas</div>
          <div className="text-xl font-black text-white">R$ {totalDespesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className={`${lucroLiquido >= 0 ? 'bg-emerald-900/10 border-emerald-900/40' : 'bg-red-900/20 border-red-900/50'} text-center`}>
          <div className={`text-[10px] font-black ${lucroLiquido >= 0 ? 'text-emerald-500' : 'text-red-500'} uppercase tracking-widest mb-1`}>Lucro Real Consolidado</div>
          <div className={`text-xl font-black ${lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>
    </div>
  );
};

export default AdminVehicleReport;
