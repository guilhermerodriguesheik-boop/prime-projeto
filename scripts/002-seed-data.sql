-- Prime Group: Dados iniciais (seed)

-- Usuarios
INSERT INTO users (id, nome, email, senha, perfil, ativo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Guilherme', 'guilherme@prime.com', 'prime123', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'Danilo', 'danilo@prime.com', 'prime123', 'admin', true),
  ('00000000-0000-0000-0000-000000000003', 'João Pinheiro', 'joao@prime.com', '123', 'motorista', true),
  ('00000000-0000-0000-0000-000000000004', 'José Clemente', 'jose@prime.com', '123', 'motorista', true),
  ('00000000-0000-0000-0000-000000000005', 'Carlos Eduardo', 'carlos@prime.com', '123', 'motorista', true),
  ('00000000-0000-0000-0000-000000000006', 'Sérgio Medeiros', 'sergio@prime.com', '123', 'motorista', true),
  ('00000000-0000-0000-0000-000000000007', 'André Luiz', 'andre@prime.com', '123', 'motorista', true),
  ('00000000-0000-0000-0000-000000000008', 'Renan', 'renan@prime.com', '123', 'ajudante', true),
  ('00000000-0000-0000-0000-000000000009', 'Junior', 'junior@prime.com', '123', 'ajudante', true)
ON CONFLICT (id) DO NOTHING;

-- Veiculos
INSERT INTO vehicles (id, placa, modelo, km_atual, status, proxima_manutencao_km) VALUES
  ('11111111-1111-1111-1111-111111111111', 'LQB2B76', 'Mercedes-Benz Atego', 154200, 'rodando', 160000),
  ('11111111-1111-1111-1111-111111111112', 'LUX9A15', 'Volvo FH 540', 89000, 'rodando', 95000),
  ('11111111-1111-1111-1111-111111111113', 'INZ6I09', 'Scania R450', 210000, 'manutencao', 210500),
  ('11111111-1111-1111-1111-111111111114', 'KVN8790', 'Volkswagen Constellation', 125600, 'rodando', 130000),
  ('11111111-1111-1111-1111-111111111115', 'DLA3I85', 'Iveco Stralis', 340000, 'parado', 345000),
  ('11111111-1111-1111-1111-111111111116', 'LNN4760', 'Ford Cargo', 45000, 'rodando', 50000),
  ('11111111-1111-1111-1111-111111111117', 'LNX4C34', 'Mercedes-Benz Axor', 178000, 'rodando', 185000)
ON CONFLICT (id) DO NOTHING;

-- Clientes
INSERT INTO customers (id, nome, ativo) VALUES
  ('22222222-2222-2222-2222-222222222221', 'Frigocopa', true),
  ('22222222-2222-2222-2222-222222222222', 'King Ouro', true),
  ('22222222-2222-2222-2222-222222222223', 'Ortobom', true)
ON CONFLICT (id) DO NOTHING;
