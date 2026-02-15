-- Prime Group: Criar todas as tabelas

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin','custom_admin','motorista','ajudante')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  permissoes JSONB DEFAULT '[]'::jsonb
);

-- Veiculos
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  km_atual NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rodando' CHECK (status IN ('rodando','manutencao','parado')),
  preventive_tasks JSONB DEFAULT '[]'::jsonb,
  proxima_manutencao_km NUMERIC,
  ultima_revisao_data TEXT,
  tracker_id TEXT,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  is_online BOOLEAN DEFAULT false
);

-- Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true
);

-- Agregados
CREATE TABLE IF NOT EXISTS agregados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  placa TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true
);

-- Abastecimentos
CREATE TABLE IF NOT EXISTS fuelings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  placa TEXT NOT NULL,
  motorista_id UUID REFERENCES users(id),
  km_no_momento NUMERIC NOT NULL,
  valor NUMERIC NOT NULL,
  foto_nota TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
  motivo_rejeicao TEXT,
  admin_aprovador_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- Manutencoes
CREATE TABLE IF NOT EXISTS maintenances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  placa TEXT NOT NULL,
  motorista_id UUID REFERENCES users(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('preventiva','corretiva')),
  descricao TEXT NOT NULL,
  km_no_momento NUMERIC NOT NULL,
  foto TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','assumida','em_execucao','feita','reprovada')),
  admin_responsavel_id UUID REFERENCES users(id),
  assumed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  done_at TIMESTAMPTZ,
  oficina TEXT,
  valor NUMERIC,
  nota_foto TEXT,
  observacao_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rotas (saidas)
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  placa TEXT NOT NULL,
  motorista_id UUID REFERENCES users(id),
  ajudante_id UUID,
  ajudante_nome TEXT,
  cliente_id UUID,
  cliente_nome TEXT,
  destino TEXT NOT NULL,
  oc TEXT,
  valor_frete NUMERIC,
  valor_motorista NUMERIC,
  valor_ajudante NUMERIC,
  status_financeiro TEXT DEFAULT 'pendente' CHECK (status_financeiro IN ('pendente','aprovado')),
  admin_financeiro_id UUID,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'em_rota' CHECK (status IN ('em_rota','finalizada','cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- Rotas diarias
CREATE TABLE IF NOT EXISTS daily_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID REFERENCES users(id),
  ajudante_id UUID,
  ajudante_nome TEXT,
  vehicle_id UUID REFERENCES vehicles(id),
  placa TEXT NOT NULL,
  cliente_id UUID,
  cliente_nome TEXT,
  destino TEXT NOT NULL,
  oc TEXT,
  valor_frete NUMERIC,
  valor_motorista NUMERIC,
  valor_ajudante NUMERIC,
  status_financeiro TEXT DEFAULT 'pendente' CHECK (status_financeiro IN ('pendente','aprovado')),
  admin_financeiro_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  foto_frente TEXT,
  foto_lateral_esquerda TEXT,
  foto_lateral_direita TEXT,
  foto_traseira TEXT,
  nivel_oleo TEXT CHECK (nivel_oleo IN ('no_nivel','abaixo_do_nivel')),
  nivel_agua TEXT CHECK (nivel_agua IN ('no_nivel','abaixo_do_nivel'))
);

-- Despesas fixas
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL CHECK (categoria IN ('funcionario','contador','manobra','sistema','imposto','outros')),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_competencia TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fretes de agregados
CREATE TABLE IF NOT EXISTS agregado_freights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agregado_id UUID REFERENCES agregados(id),
  nome_agregado TEXT NOT NULL,
  placa TEXT NOT NULL,
  valor_frete NUMERIC NOT NULL,
  valor_agregado NUMERIC NOT NULL,
  oc TEXT,
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedagios
CREATE TABLE IF NOT EXISTS tolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  placa TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
