
import React, { useState, useMemo } from 'react';
import { FixedExpense } from '../types';
import { Card, Input, Select, BigButton } from '../components/UI';

interface AdminFixedExpensesProps {
  fixedExpenses: FixedExpense[];
  onUpdateExpenses: (expenses: FixedExpense[]) => void;
  onBack: () => void;
}

const AdminFixedExpenses: React.FC<AdminFixedExpensesProps> = ({ fixedExpenses, onUpdateExpenses, onBack }) => {
  const [categoria, setCategoria] = useState<FixedExpense['categoria']>('outros');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;
    const newExp: FixedExpense = {
      id: crypto.randomUUID(),
      categoria,
      descricao,
      valor: Number(valor),
      dataCompetencia: mes,
      createdAt: new Date().toISOString()
    };
    onUpdateExpenses([newExp, ...fixedExpenses]);
    setDescricao(''); setValor('');
  };

  const filtered = useMemo(() => fixedExpenses.filter(e => e.dataCompetencia === mes), [fixedExpenses, mes]);
  
  // Garantia de soma numérica real para despesas fixas
  const total = useMemo(() => filtered.reduce((acc, curr) => Number(acc) + Number(curr.valor || 0), 0), [filtered]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">Custos Estruturais</h2>
          <p className="text-slate-500 text-sm">Administração de despesas fixas mensais</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-700 text-xs text-white">Voltar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-indigo-900/30">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">Novo Lançamento</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Select label="Categoria" value={categoria} onChange={(v) => setCategoria(v as any)} options={[{label:'Salários/Equipe', value:'funcionario'}, {label:'Outros/Gerais', value:'outros'}, {label:'Impostos', value:'imposto'}]} />
            <Input label="Mês de Referência" type="month" value={mes} onChange={setMes} />
            <Input label="Descrição do Gasto" value={descricao} onChange={setDescricao} placeholder="Ex: Aluguel Pátio" />
            <Input label="Valor (R$)" type="number" value={valor} onChange={setValor} placeholder="0.00" />
            <BigButton onClick={() => {}}>CONFIRMAR GASTO</BigButton>
          </form>
        </Card>

        <Card className="lg:col-span-2 bg-slate-900/40">
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Acumulado ({mes}):</span>
            <span className="text-3xl font-black text-white">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-700 italic text-sm">Nenhuma despesa para este período.</div>
            ) : (
              filtered.map(e => (
                <div key={e.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-all">
                  <div>
                    <div className="text-xs font-black text-slate-200 uppercase tracking-tight">{e.descricao}</div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase mt-1">{e.categoria}</div>
                  </div>
                  <span className="text-sm font-black text-red-400">R$ {Number(e.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminFixedExpenses;
