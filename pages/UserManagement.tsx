
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Card, Badge, Input, Select, BigButton } from '../components/UI';

interface UserMgmtProps {
  users: User[];
  onSaveUser: (user: User) => Promise<void>;
  onBack: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'admin-dashboard', label: 'Dashboard Global' },
  { id: 'admin-pending', label: 'Pendências' },
  { id: 'admin-tracking', label: 'Rastreamento de Frota' },
  { id: 'admin-checklists', label: 'Checklist Inspeções' },
  { id: 'admin-create-route', label: 'Lançar Rota (Manual)' },
  { id: 'admin-consolidated-finance', label: 'Faturamento e Lucro Geral' },
  { id: 'admin-fixed-expenses', label: 'Despesas Fixas' },
  { id: 'vehicle-mgmt', label: 'Gestão de Placas' },
  { id: 'admin-customers', label: 'Gestão de Clientes' },
  { id: 'user-mgmt', label: 'Gestão de Equipe' },
];

const UserManagement: React.FC<UserMgmtProps> = ({ users, onSaveUser, onBack }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<UserRole>(UserRole.MOTORISTA);
  const [senha, setSenha] = useState('');
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setNome(''); setEmail(''); setPerfil(UserRole.MOTORISTA); setSenha(''); setPermissoes([]); setEditingUser(null); setShowForm(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user); setNome(user.nome); setEmail(user.email); setPerfil(user.perfil); setSenha(user.senha || ''); setPermissoes(user.permissoes || []); setShowForm(true);
  };

  const togglePermission = (permId: string) => {
    setPermissoes(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !senha) return alert('Nome e Senha são obrigatórios');
    setIsSaving(true);
    const userToSave: User = {
      id: editingUser?.id || crypto.randomUUID(),
      nome, email, senha, perfil, ativo: editingUser ? editingUser.ativo : true,
      permissoes: perfil === UserRole.CUSTOM_ADMIN ? permissoes : undefined
    };
    await onSaveUser(userToSave);
    setIsSaving(false);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Equipe</h2>
          <p className="text-slate-500 text-sm">Controle de acessos e permissões</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 rounded-lg font-bold ${showForm ? 'bg-red-900/40 text-red-400' : 'bg-blue-700 text-white'}`}>
            {showForm ? 'Cancelar' : '+ Novo Cadastro'}
          </button>
          <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-lg font-bold">Voltar</button>
        </div>
      </div>

      {showForm && (
        <Card className="border-blue-900/50 animate-slideDown">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome Completo" value={nome} onChange={setNome} required />
              <Input label="Email / Login" value={email} onChange={setEmail} />
              <Select label="Perfil" value={perfil} onChange={(v) => setPerfil(v as UserRole)} options={[
                { label: 'Admin Total', value: UserRole.ADMIN },
                { label: 'Admin Custom', value: UserRole.CUSTOM_ADMIN },
                { label: 'Motorista', value: UserRole.MOTORISTA },
                { label: 'Ajudante', value: UserRole.AJUDANTE },
              ]} required />
              <Input label="Senha" type="text" value={senha} onChange={setSenha} required />
            </div>
            {perfil === UserRole.CUSTOM_ADMIN && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_PERMISSIONS.map(p => (
                  <label key={p.id} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={permissoes.includes(p.id)} onChange={() => togglePermission(p.id)} />
                    <span className="text-xs font-bold text-slate-300">{p.label}</span>
                  </label>
                ))}
              </div>
            )}
            <BigButton onClick={() => {}} variant="primary" disabled={isSaving}>
              {isSaving ? 'SALVANDO...' : editingUser ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR USUÁRIO'}
            </BigButton>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <Card key={u.id} className={`border-l-4 ${u.ativo ? 'border-l-blue-600' : 'border-l-red-900'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="font-bold text-slate-100">{u.nome}</div>
              <Badge status={u.ativo ? 'rodando' : 'rejeitado'}>{u.perfil}</Badge>
            </div>
            <div className="text-xs text-slate-500 mb-4">Senha: <span className="font-mono text-slate-300">{u.senha}</span></div>
            <div className="flex gap-2">
              <button onClick={() => handleEditClick(u)} className="flex-1 py-2 bg-blue-900/20 text-blue-400 rounded text-[10px] font-black uppercase">Editar</button>
              <button onClick={() => onSaveUser({...u, ativo: !u.ativo})} className={`flex-1 py-2 rounded text-[10px] font-black uppercase ${u.ativo ? 'bg-red-900/20 text-red-400' : 'bg-emerald-900/20 text-emerald-400'}`}>
                {u.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
