
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mapa de conversão de nomes de campos (App -> Banco)
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
  valorAgregado: 'valor_agregado'
};

/**
 * Converte de snake_case (DB) para camelCase (App)
 */
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

/**
 * Converte de camelCase (App) para snake_case (DB)
 */
export const mapToDb = (item: any) => {
  if (!item) return item;
  const dbItem: any = {};
  
  for (const key in item) {
    const dbKey = FIELD_MAP[key] || key;
    dbItem[dbKey] = item[key];
  }
  return dbItem;
};
