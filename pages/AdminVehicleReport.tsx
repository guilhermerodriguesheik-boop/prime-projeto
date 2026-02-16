
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
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const dateFilteredData = useMemo(() => {
    if (!startDate || !endDate) return { f: fuelings, m: maintenances, dr: dailyRoutes, r: routes, t: tolls, fe: fixedExpenses };
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return {
      f: fuelings.filter(x => new Date(x.createdAt) >= start && new Date(x.createdAt) <= end),
      m: maintenances.filter(x => new Date(x.createdAt) >= start && new Date(x.createdAt) <= end),
      dr: dailyRoutes.filter(x => new Date(x.createdAt) >= start && new Date(x.createdAt) <= end),
      r: routes.filter(x => new Date(x.createdAt) >= start && new Date(x.createdAt) <= end),
      t: tolls.filter(x => new Date(x.data) >= start && new Date(x.data) <= end),
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

  const totals = useMemo(() => {
    const sumOp = vehicleStats.reduce((acc, curr) => ({
      frete: acc.frete + Number(curr.totalFrete),
      custos: acc.custos + Number(curr.totalCustos),
      lucroOp: acc.lucroOp + Number(curr.lucroOp)
    }), { frete: 0, custos: 0, lucroOp: 0 });

    return { ...sumOp, lucroLiquido: sumOp.lucroOp - totalDespesasFixas };
  }, [vehicleStats, totalDespesasFixas]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Desempenho</h2>
          <p className="text-slate-500 text-sm">Análise consolidada e individual da frota</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-700 text-xs">Voltar</button>
        </div>
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
        <Card className={`${totals.lucroLiquido >= 0 ? 'bg-emerald-900/10 border-emerald-900/40' : 'bg-red-900/20 border-red-900/50'} text-center`}>
          <div className={`text-[10px] font-black ${totals.lucroLiquido >= 0 ? 'text-emerald-500' : 'text-red-500'} uppercase tracking-widest mb-1`}>Lucro Real Consolidado</div>
          <div className={`text-xl font-black ${totals.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {totals.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>
    </div>
  );
};

export default AdminVehicleReport;
