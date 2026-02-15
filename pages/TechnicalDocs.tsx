
import React, { useState } from 'react';
import { Card } from '../components/UI';

const TechnicalDocs: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'install' | 'edit' | 'terminal' | 'sql'>('install');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Centro de Tecnologia</h2>
          <p className="text-slate-500">Documentação e manutenção do sistema PRIME GROUP</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-700 text-sm">Voltar</button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl w-fit overflow-x-auto scrollbar-hide">
        <button onClick={() => setTab('install')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === 'install' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Instalação</button>
        <button onClick={() => setTab('edit')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === 'edit' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>Como Editar</button>
        <button onClick={() => setTab('terminal')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === 'terminal' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Terminal (Build)</button>
        <button onClick={() => setTab('sql')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === 'sql' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Banco SQL</button>
      </div>

      {tab === 'edit' && (
        <section className="space-y-6 animate-slideDown">
          <Card className="border-purple-900/30">
            <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <span className="text-2xl">🛠️</span> Guia de Manutenção e Edição
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Opção 1: Via Inteligência Artificial</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Você não precisa ser programador para evoluir o app. Basta solicitar as mudanças no chat:
                </p>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] text-purple-500 font-bold uppercase italic">Exemplos de pedidos:</div>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>• "Adicione um campo de placa nos custos fixos"</li>
                    <li>• "Crie um botão para exportar relatório em Excel"</li>
                    <li>• "Mude o layout da home para 4 colunas"</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Opção 2: Edição Manual (Código)</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Para desenvolvedores que desejam alterar o código-fonte original:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white">1</span>
                    Edite os arquivos <code>.tsx</code> na pasta <code>pages/</code>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white">2</span>
                    Estilos são controlados via <strong>Tailwind CSS</strong>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white">3</span>
                    Tipagens globais estão em <code>types.ts</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fluxo de Publicação</h4>
               <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg mb-1">💻</div>
                    <div className="text-[10px] font-bold text-white uppercase">Edição Local</div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">Alterar código no PC</div>
                 </div>
                 <div className="flex items-center justify-center text-slate-700">➜</div>
                 <div className="flex-1 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg mb-1">🐙</div>
                    <div className="text-[10px] font-bold text-white uppercase">GitHub Push</div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">Subir para o repositório</div>
                 </div>
                 <div className="flex items-center justify-center text-slate-700">➜</div>
                 <div className="flex-1 bg-emerald-900/20 p-4 rounded-xl border border-emerald-900/40 text-center">
                    <div className="text-lg mb-1">🚀</div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">Vercel Deploy</div>
                    <div className="text-[9px] text-emerald-600 uppercase mt-1">Atualização automática</div>
                 </div>
               </div>
            </div>
          </Card>
        </section>
      )}

      {tab === 'install' && (
        <section className="space-y-6 animate-slideDown">
          <Card className="border-blue-900/30">
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <span className="text-2xl">💻</span> Como instalar no Windows (PC)
            </h3>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Windows (Chrome ou Edge)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <ol className="space-y-4 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    Acesse o link no Chrome ou Edge.
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    Na barra de endereços (onde fica o link), clique no ícone de <strong>Instalar</strong> (ícone de computador com seta).
                  </li>
                  <li className="flex gap-3 text-blue-400 font-bold">
                    <span className="bg-blue-900/40 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0">3</span>
                    Clique em <strong>"Instalar"</strong>.
                  </li>
                </ol>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                   <div className="text-4xl mb-2">🖥️</div>
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Atalho na Área de Trabalho</div>
                   <p className="text-xs text-slate-400 mt-2">O app funcionará em uma janela separada, como um programa nativo.</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-emerald-400 mt-12 mb-6 flex items-center gap-2">
              <span className="text-2xl">📱</span> Instalação no Celular
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Android (Chrome)
                </div>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    Toque nos <strong>três pontinhos (⋮)</strong> no Chrome.
                  </li>
                  <li className="flex gap-3 text-blue-400 font-bold">
                    <span className="bg-blue-900/40 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                    Selecione "Instalar aplicativo".
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  iPhone (Safari)
                </div>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    Toque no botão <strong>Compartilhar</strong> (seta para cima).
                  </li>
                  <li className="flex gap-3 text-blue-400 font-bold">
                    <span className="bg-blue-900/40 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                    Toque em "Adicionar à Tela de Início".
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        </section>
      )}

      {tab === 'terminal' && (
        <section className="space-y-6 animate-slideDown">
          <div className="bg-indigo-900/10 border border-indigo-900/30 p-4 rounded-xl">
            <h4 className="text-indigo-400 font-bold text-sm mb-2">Comandos do Projeto</h4>
            <p className="text-xs text-slate-400">Utilize o terminal na pasta raiz para gerenciar dependências e build.</p>
          </div>

          <div className="space-y-3">
            {[
              { cmd: "npm install", desc: "Instala todas as bibliotecas necessárias" },
              { cmd: "npm run dev", desc: "Inicia o servidor de desenvolvimento local" },
              { cmd: "npm run build", desc: "Gera a pasta 'dist' otimizada para produção" },
              { cmd: "npx cap sync", desc: "Sincroniza código web com apps nativos" }
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 group transition-all">
                <code className="text-indigo-400 font-mono text-sm flex-1">{c.cmd}</code>
                <button onClick={() => copyToClipboard(c.cmd)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Copiar</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'sql' && (
        <section className="animate-slideDown">
           <Card className="bg-slate-950 p-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Esquema de Tabelas (PostgreSQL)</h3>
            <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto leading-relaxed">
{`CREATE TYPE user_role AS ENUM ('admin', 'custom_admin', 'motorista', 'ajudante');
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  perfil user_role NOT NULL,
  ativo BOOLEAN DEFAULT true
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa TEXT UNIQUE NOT NULL,
  modelo TEXT,
  km_atual INTEGER DEFAULT 0,
  status TEXT DEFAULT 'rodando'
);`}
            </pre>
          </Card>
        </section>
      )}
    </div>
  );
};

export default TechnicalDocs;
