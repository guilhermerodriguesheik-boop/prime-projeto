
import React, { useState, useMemo } from 'react';
import { AgregadoFreight } from '../types';
import { Card, Input, Select } from '../components/UI';

interface AdminAgregadoReportProps {
  freights: AgregadoFreight[];
  onBack: () => void;
}

const AdminAgregadoReport: React.FC<AdminAgregadoReportProps> = ({ freights, onBack }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPlaca, setSelectedPlaca] = useState('');

  const placaOptions = useMemo(() => {
    const plates = Array.from(new Set(freights.map(f => f.placa))).sort();
    return plates.map(p => ({ label: p, value: p }));
  }, [freights]);

  const filtered = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return freights.filter(f => {
      const date = new Date(f.data);
      const matchesDate = (!start || date >= start) && (!end || date <= end);
      const matchesPlaca = !selectedPlaca || f.placa === selectedPlaca;
      return matchesDate && matchesPlaca;
    });
  }, [freights, startDate, endDate, selectedPlaca]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, curr) => {
      const vFrete = Number(curr.valorFrete || 0);
      const vPago = Number(curr.valorAgregado || 0);
      return {
        frete: Number(acc.frete) + vFrete,
        pago: Number(acc.pago) + vPago,
        saldo: Number(acc.saldo) + (vFrete - vPago)
      };
    }, { frete: 0, pago: 0, saldo: 0 });
  }, [filtered]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-3xl font-black uppercase text-white">Relatório de Agregados</h2>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-700 text-xs uppercase text-white">Voltar</button>
      </div>

      <Card className="no-print bg-slate-900/40 border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Data Início" type="date" value={startDate} onChange={setStartDate} />
          <Input label="Data Fim" type="date" value={endDate} onChange={setEndDate} />
          <Select label="Filtrar Placa" value={selectedPlaca} onChange={setSelectedPlaca} options={placaOptions} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center bg-slate-900/50 border-slate-800">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Faturamento Bruto</div>
          <div className="text-2xl font-black text-emerald-400">R$ {totals.frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="text-center bg-slate-900/50 border-slate-800">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Custo (Pagto Agregado)</div>
          <div className="text-2xl font-black text-red-400">R$ {totals.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className={`text-center ${totals.saldo >= 0 ? 'bg-emerald-900/10 border-emerald-900/40' : 'bg-red-900/10 border-red-900/40'}`}>
          <div className="text-[10px] font-black uppercase mb-1 tracking-widest">Resultado Real</div>
          <div className={`text-2xl font-black ${totals.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>
      
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Agregado / Placa</th>
                <th className="p-4 text-right">Frete Bruto</th>
                <th className="p-4 text-right">Valor Pago</th>
                <th className="p-4 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const saldo = Number(f.valorFrete || 0) - Number(f.valorAgregado || 0);
                return (
                  <tr key={f.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-400">{new Date(f.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-200">{f.nomeAgregado}</div>
                      <div className="text-[10px] font-mono text-blue-500 font-bold">{f.placa}</div>
                    </td>
                    <td className="p-4 text-right text-xs text-emerald-400 font-bold">R$ {Number(f.valorFrete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right text-xs text-red-400 font-bold">R$ {Number(f.valorAgregado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className={`p-4 text-right text-xs font-black ${saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminAgregadoReport;
