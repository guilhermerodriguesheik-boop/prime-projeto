
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
  const total = useMemo(() => filtered.reduce((acc, curr) => acc + Number(curr.valor || 0), 0), [filtered]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Custos Estruturais</h2>
        <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-xl font-bold">Voltar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Select label="Categoria" value={categoria} onChange={(v) => setCategoria(v as any)} options={[{label:'Salários', value:'funcionario'}, {label:'Outros', value:'outros'}]} />
            <Input label="Mês" type="month" value={mes} onChange={setMes} />
            <Input label="Descrição" value={descricao} onChange={setDescricao} />
            <Input label="Valor (R$)" type="number" value={valor} onChange={setValor} />
            <BigButton onClick={() => {}}>LANÇAR</BigButton>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-black text-slate-500 uppercase">Total do Mês:</span>
            <span className="text-2xl font-black text-white">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="space-y-2">
            {filtered.map(e => (
              <div key={e.id} className="bg-slate-950 p-3 rounded-lg flex justify-between">
                <span className="text-xs font-bold text-slate-300">{e.descricao}</span>
                <span className="text-xs font-black text-white">R$ {Number(e.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminFixedExpenses;
