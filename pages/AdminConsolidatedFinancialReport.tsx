
import React, { useState, useMemo } from 'react';
import { DailyRoute, RouteDeparture, Fueling, MaintenanceRequest, Toll, AgregadoFreight, FixedExpense, FuelingStatus, MaintenanceStatus } from '../types';
import { Card, Input } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';

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
  dailyRoutes,
  routes,
  fuelings,
  maintenances,
  tolls,
  agregadoFreights,
  fixedExpenses,
  onBack
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = useMemo(() => {
    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const filterByDate = (dateStr: string) => {
      if (!start || !end) return true;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    // Receitas Operacionais
    const revenueEntries = [
      ...dailyRoutes.filter(dr => filterByDate(dr.createdAt)).map(dr => ({
        date: dr.createdAt,
        type: 'Receita',
        category: 'Rota do Dia',
        description: `${dr.placa} - ${dr.clienteNome} (${dr.oc})`,
        value: Number(dr.valorFrete || 0)
      })),
      ...routes.filter(r => filterByDate(r.createdAt)).map(r => ({
        date: r.createdAt,
        type: 'Receita',
        category: 'Saída OC',
        description: `${r.placa} - ${r.clienteNome} (${r.oc})`,
        value: Number(r.valorFrete || 0)
      })),
      ...agregadoFreights.filter(af => filterByDate(af.data)).map(af => ({
        date: af.data,
        type: 'Receita',
        category: 'Frete Agregado',
        description: `AGREGADO: ${af.nomeAgregado} (${af.placa}) - OC: ${af.oc}`,
        value: Number(af.valorFrete || 0)
      }))
    ];

    // Despesas Operacionais
    const expenseEntries = [
      ...dailyRoutes.filter(dr => filterByDate(dr.createdAt)).flatMap(dr => {
        const items = [];
        if (dr.valorMotorista) items.push({ date: dr.createdAt, type: 'Despesa', category: 'Equipe', description: `Pagto Motorista (${dr.placa})`, value: Number(dr.valorMotorista) });
        if (dr.valorAjudante) items.push({ date: dr.createdAt, type: 'Despesa', category: 'Equipe', description: `Pagto Ajudante (${dr.placa})`, value: Number(dr.valorAjudante) });
        return items;
      }),
      ...routes.filter(r => filterByDate(r.createdAt)).flatMap(r => {
        const items = [];
        if (r.valorMotorista) items.push({ date: r.createdAt, type: 'Despesa', category: 'Equipe', description: `Pagto Motorista (${r.placa})`, value: Number(r.valorMotorista) });
        if (r.valorAjudante) items.push({ date: r.createdAt, type: 'Despesa', category: 'Equipe', description: `Pagto Ajudante (${r.placa})`, value: Number(r.valorAjudante) });
        return items;
      }),
      ...agregadoFreights.filter(af => filterByDate(af.data)).map(af => ({
        date: af.data,
        type: 'Despesa',
        category: 'Pagto Agregado',
        description: `PAGO AO AGREGADO: ${af.nomeAgregado} (${af.placa})`,
        value: Number(af.valorAgregado || 0)
      })),
      ...fuelings.filter(f => f.status === FuelingStatus.APROVADO && filterByDate(f.createdAt)).map(f => ({
        date: f.createdAt,
        type: 'Despesa',
        category: 'Combustível',
        description: `Abastecimento Placa: ${f.placa}`,
        value: Number(f.valor || 0)
      })),
      ...maintenances.filter(m => m.status === MaintenanceStatus.FEITA && filterByDate(m.createdAt)).map(m => ({
        date: m.doneAt || m.createdAt,
        type: 'Despesa',
        category: 'Manutenção',
        description: `Manutenção Placa: ${m.placa} (${m.oficina})`,
        value: Number(m.valor || 0)
      })),
      ...tolls.filter(t => filterByDate(t.data)).map(t => ({
        date: t.data,
        type: 'Despesa',
        category: 'Pedágio',
        description: `Pedágio Placa: ${t.placa}`,
        value: Number(t.valor || 0)
      })),
      ...fixedExpenses.filter(fe => {
        if (!start || !end) return true;
        const feDate = new Date(fe.dataCompetencia + '-01');
        return feDate >= start && feDate <= end;
      }).map(fe => ({
        date: fe.createdAt,
        type: 'Despesa',
        category: 'Fixo',
        description: `CUSTO FIXO: ${fe.descricao} (${fe.categoria})`,
        value: Number(fe.valor || 0)
      }))
    ];

    const allEntries = [...revenueEntries, ...expenseEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const summary = allEntries.reduce((acc, curr) => {
      const val = Number(curr.value || 0);
      if (curr.type === 'Receita') {
        acc.totalRevenue += val;
      } else {
        acc.totalExpense += val;
        acc.expenseByCategory[curr.category] = (acc.expenseByCategory[curr.category] || 0) + val;
      }
      return acc;
    }, { 
      totalRevenue: 0, 
      totalExpense: 0, 
      expenseByCategory: {} as Record<string, number> 
    });

    return { allEntries, ...summary };
  }, [dailyRoutes, routes, agregadoFreights, fuelings, maintenances, tolls, fixedExpenses, startDate, endDate]);

  const lucroLiquido = Number(filteredData.totalRevenue) - Number(filteredData.totalExpense);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faturamento e Lucro Geral</h2>
          <p className="text-slate-500 text-sm">Visão consolidada de todas as entradas e saídas financeiras</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-xl font-bold border border-blue-600 text-xs">
            🖨️ PDF / Imprimir
          </button>
          <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-700 text-xs">
            Voltar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-emerald-900/40 text-center">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Faturamento Total</div>
          <div className="text-3xl font-black text-emerald-400">R$ {Number(filteredData.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="bg-slate-900/50 border-red-900/40 text-center">
          <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Despesas Gerais</div>
          <div className="text-3xl font-black text-red-400">R$ {Number(filteredData.totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className={`${lucroLiquido >= 0 ? 'bg-emerald-900/10 border-emerald-900/40' : 'bg-red-900/20 border-red-900/50'} text-center shadow-2xl`}>
          <div className={`text-[10px] font-black ${lucroLiquido >= 0 ? 'text-emerald-500' : 'text-red-500'} uppercase tracking-widest mb-1`}>Lucro Líquido Real</div>
          <div className={`text-4xl font-black ${lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-report">
            <thead className="bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4 border-b border-slate-800">Data</th>
                <th className="p-4 border-b border-slate-800">Tipo</th>
                <th className="p-4 border-b border-slate-800">Categoria</th>
                <th className="p-4 border-b border-slate-800">Discriminação</th>
                <th className="p-4 border-b border-slate-800 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.allEntries.map((entry, idx) => (
                <tr key={idx} className={`hover:bg-slate-900/50 transition-colors border-b border-slate-800/30 ${entry.type === 'Receita' ? 'bg-emerald-950/5' : 'bg-red-950/5'}`}>
                  <td className="p-4 text-xs font-mono text-slate-400">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${entry.type === 'Receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{entry.type}</span></td>
                  <td className="p-4"><span className="text-[10px] font-bold text-slate-500 uppercase">{entry.category}</span></td>
                  <td className="p-4 text-xs text-slate-200">{entry.description}</td>
                  <td className={`p-4 text-right text-sm font-black ${entry.type === 'Receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.type === 'Receita' ? '+' : '-'} {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-800">
              <tr className="bg-slate-900 border-t border-slate-700">
                <td colSpan={4} className="p-4 text-xs uppercase text-white font-black">LUCRO LÍQUIDO CONSOLIDADO</td>
                <td className={`p-4 text-right text-xl font-black ${lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminConsolidatedFinancialReport;
