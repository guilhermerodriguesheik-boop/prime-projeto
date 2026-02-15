
import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { Card, Badge, Input, BigButton } from '../components/UI';

interface VehicleMgmtProps {
  vehicles: Vehicle[];
  onSaveVehicle: (v: Vehicle) => Promise<void>;
  onBack: () => void;
}

const VehicleManagement: React.FC<VehicleMgmtProps> = ({ vehicles, onSaveVehicle, onBack }) => {
  const [showForm, setShowForm] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [km, setKm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !modelo) return alert('Placa e Modelo são obrigatórios');
    setIsSaving(true);
    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      placa: placa.toUpperCase(),
      modelo,
      kmAtual: Number(km) || 0,
      status: VehicleStatus.RODANDO,
      proximaManutencaoKm: (Number(km) || 0) + 10000
    };
    await onSaveVehicle(newVehicle);
    setIsSaving(false);
    setShowForm(false);
    setPlaca(''); setModelo(''); setKm('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gestão da Frota</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold">
            {showForm ? 'Cancelar' : '+ Novo Veículo'}
          </button>
          <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-lg font-bold text-sm">Voltar</button>
        </div>
      </div>

      {showForm && (
        <Card className="border-blue-900/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input label="Placa" value={placa} onChange={setPlaca} required placeholder="ABC-1234" />
            <Input label="Modelo" value={modelo} onChange={setModelo} required />
            <Input label="KM Inicial" type="number" value={km} onChange={setKm} />
            <div className="md:col-span-3"><BigButton onClick={() => {}} disabled={isSaving} variant="success">CADASTRAR</BigButton></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map(v => (
          <Card key={v.id} className="flex justify-between items-center">
            <div>
              <div className="font-mono font-black text-xl text-blue-400">{v.placa}</div>
              <div className="text-sm font-bold text-slate-100">{v.modelo}</div>
              <div className="text-[10px] text-slate-500 uppercase">KM: {v.kmAtual.toLocaleString()}</div>
            </div>
            <Badge status={v.status}>{v.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleManagement;
