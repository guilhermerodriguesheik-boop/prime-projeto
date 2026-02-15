
import { createClient } from '@supabase/supabase-js';

// Credenciais enviadas pelo usuário
const supabaseUrl = 'https://sqlrsuqvphcxskiygqfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbHJzdXF2cGhjeHNraXlncWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMjQ1NDIsImV4cCI6MjA4NjcwMDU0Mn0.pTiFiGuoMTwrJgnn4_NC-zLP6HOTuJinxuAdJioLQYc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mapa de conversão de nomes de campos (App camelCase -> Banco snake_case)
const FIELD_MAP: Record<string, string> = {
  vehicleId: 'vehicle_id',
  motoristaId: 'motorista_id',
  ajudanteId: 'ajudante_id',
  kmAtual: 'km_atual',
  kmNoMomento: 'km_no_momento',
  fotoNota: 'foto_nota',
  motivoRejeicao: 'motivo_rejeicao',
  adminAprovadorId: 'admin_aprovador_id',
  approvedAt: 'approved_at',
  createdAt: 'created_at',
  doneAt: 'done_at',
  startedAt: 'started_at',
  assumedAt: 'assumed_at',
  adminResponsavelId: 'admin_responsavel_id',
  clienteId: 'cliente_id',
  clienteNome: 'cliente_nome',
  ajudanteNome: 'ajudante_nome',
  valorFrete: 'valor_frete',
  valorMotorista: 'valor_motorista',
  valorAjudante: 'valor_ajudante',
  statusFinanceiro: 'status_financeiro',
  adminFinanceiroId: 'admin_financeiro_id',
  fotoFrente: 'foto_frente',
  fotoLateralEsquerda: 'foto_lateral_esquerda',
  fotoLateralDireita: 'foto_lateral_direita',
  fotoTraseira: 'foto_traseira',
  nivelOleo: 'nivel_oleo',
  nivelAgua: 'nivel_agua',
  dataCompetencia: 'data_competencia',
  agregadoId: 'agregado_id',
  nomeAgregado: 'nome_agregado',
  valorAgregado: 'valor_agregado',
  proximaManutencaoKm: 'proxima_manutencao_km',
  trackerId: 'tracker_id',
  isOnline: 'is_online',
  finishedAt: 'finished_at'
};

export const mapFromDb = (item: any) => {
  if (!item) return item;
  const newItem: any = {};
  const inverseMap = Object.fromEntries(Object.entries(FIELD_MAP).map(([k, v]) => [v, k]));
  for (const key in item) {
    const appKey = inverseMap[key] || key;
    newItem[appKey] = item[key];
  }
  return newItem;
};

export const mapToDb = (item: any) => {
  if (!item) return item;
  const dbItem: any = {};
  for (const key in item) {
    const dbKey = FIELD_MAP[key] || key;
    dbItem[dbKey] = item[key];
  }
  return dbItem;
};
