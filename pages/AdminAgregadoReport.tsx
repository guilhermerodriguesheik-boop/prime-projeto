
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

  const filtered = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return freights.filter(f => {
      if (!start || !end) return true;
      const d = new Date(f.data);
      return d >= start && d <= end;
    });
  }, [freights, startDate, endDate]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, curr) => ({
      frete: acc.frete + Number(curr.valorFrete || 0),
      pago: acc.pago + Number(curr.valorAgregado || 0)
    }), { frete: 0, pago: 0 });
  }, [filtered]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Relatório de Agregados</h2>
        <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-xl font-bold">Voltar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="text-center">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Fretes (Receita)</div>
          <div className="text-2xl font-black text-emerald-400">R$ {totals.frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="text-center">
          <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Pago (Agregado)</div>
          <div className="text-2xl font-black text-red-400">R$ {totals.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </Card>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-500">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Agregado</th>
              <th className="p-4 text-right">Frete</th>
              <th className="p-4 text-right">Pago</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-b border-slate-800">
                <td className="p-4 text-xs font-mono">{new Date(f.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 text-xs font-bold text-slate-200">{f.nomeAgregado}</td>
                <td className="p-4 text-right text-xs text-emerald-400">R$ {Number(f.valorFrete).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-right text-xs text-red-400">R$ {Number(f.valorAgregado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminAgregadoReport;
