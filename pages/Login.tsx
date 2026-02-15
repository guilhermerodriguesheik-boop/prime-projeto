
import React, { useState } from 'react';
import { User } from '../types';
import { Card, Input, BigButton, Logo } from '../components/UI';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Find user by name OR email (case insensitive)
      const user = users.find(u => 
        (u.email.toLowerCase() === username.toLowerCase() || 
         u.nome.toLowerCase() === username.toLowerCase()) && 
        u.ativo
      );

      if (user) {
        if (user.senha === password) {
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
        <p className="text-slate-400 mt-4 font-medium">Sistema de Gestão de Frotas</p>
      </div>

      <Card className="border-slate-800 shadow-2xl shadow-blue-900/5">
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
            <div className="bg-red-900/20 border border-red-900/30 p-3 rounded-lg text-red-500 text-xs font-bold text-center animate-shake">
              {error}
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
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
          Acesso restrito a colaboradores autorizados
        </p>
      </div>
    </div>
  );
};

export default Login;
