
import React, { useState } from 'react';
import { User } from '../types';
import { Card, Input, BigButton, Logo } from '../components/UI';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  syncStatus: 'syncing' | 'error' | 'ok';
  syncError?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, syncStatus, syncError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const inputUser = username.trim().toLowerCase();
      const inputPass = password.trim();

      const user = users.find(u => {
        const uNome = u.nome?.trim().toLowerCase();
        const uEmail = u.email?.trim().toLowerCase();
        return (uNome === inputUser || uEmail === inputUser) && u.ativo;
      });

      if (user) {
        if (user.senha === inputPass) {
          onLogin(user);
        } else {
          setError('Senha incorreta.');
        }
      } else {
        setError('Usuário não encontrado ou inativo.');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fadeIn">
      <div className="text-center mb-10">
        <Logo size="lg" />
        <p className="text-slate-400 mt-4 font-medium uppercase text-[10px] tracking-widest">Sistema de Gestão de Frotas</p>
      </div>

      <Card className="border-slate-800 shadow-2xl shadow-blue-900/5">
        <div className="mb-4 flex items-center justify-center gap-2">
           <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
             {syncStatus === 'syncing' ? 'Sincronizando Banco...' : syncStatus === 'error' ? 'Usando Fallback Local' : 'Nuvem Conectada'}
           </span>
        </div>

        <form onSubmit={handleLoginAttempt} className="space-y-5">
          <Input 
            label="Usuário ou E-mail" 
            type="text" 
            value={username} 
            onChange={setUsername} 
            required 
            placeholder="Seu nome ou e-mail"
          />
          
          <Input 
            label="Senha" 
            type="password" 
            value={password} 
            onChange={setPassword} 
            required 
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-900/20 border border-red-900/30 p-3 rounded-lg text-red-500 text-[10px] font-black uppercase text-center">
              {error}
            </div>
          )}

          {syncStatus === 'error' && syncError && (
             <div className="text-[8px] text-slate-600 text-center italic mt-2">
               DB Info: {syncError.includes('403') ? 'Erro de Permissão (RLS)' : syncError}
             </div>
          )}

          <div className="pt-2">
            <BigButton 
              onClick={() => {}} 
              variant="primary" 
              disabled={isLoading || !username || !password}
            >
              {isLoading ? 'VERIFICANDO...' : 'ENTRAR NO SISTEMA'}
            </BigButton>
          </div>
        </form>
      </Card>
      
      <div className="mt-8 text-center space-y-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Credenciais Padrão</p>
          <div className="flex flex-col gap-1">
             <div className="text-xs text-slate-400">Admin: <span className="text-white font-mono font-bold">Guilherme</span> / <span className="text-white font-mono">prime123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
