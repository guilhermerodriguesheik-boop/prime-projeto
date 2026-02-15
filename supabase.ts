
import { createClient } from '@supabase/supabase-js';

// As variáveis devem ser configuradas no seu provedor de deploy (Vercel/Netlify)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Converte nomes de colunas do Postgres (snake_case) para o padrão do App (camelCase)
 */
export const mapFromDb = (item: any) => {
  if (!item) return item;
  const mapping: any = { ...item };
  
  // Mapeamentos comuns
  if (item.km_atual !== undefined) mapping.kmAtual = item.km_atual;
  if (item.km_no_momento !== undefined) mapping.kmNoMomento = item.km_no_momento;
  if (item.created_at !== undefined) mapping.createdAt = item.created_at;
  if (item.vehicle_id !== undefined) mapping.vehicleId = item.vehicle_id;
  if (item.motorista_id !== undefined) mapping.motoristaId = item.motorista_id;
  if (item.ajudante_id !== undefined) mapping.ajudanteId = item.ajudante_id;
  if (item.foto_nota !== undefined) mapping.fotoNota = item.foto_nota;
  if (item.motivo_rejeicao !== undefined) mapping.motivoRejeicao = item.motivo_rejeicao;
  if (item.admin_aprovador_id !== undefined) mapping.adminAprovadorId = item.admin_aprovador_id;
  if (item.approved_at !== undefined) mapping.approvedAt = item.approved_at;

  return mapping;
};

/**
 * Converte objetos do App para o padrão do Postgres antes de salvar
 */
export const mapToDb = (table: string, item: any) => {
  const dbRecord: any = { ...item };
  
  // Conversões baseadas em tabelas
  if (dbRecord.kmAtual !== undefined) { dbRecord.km_atual = dbRecord.kmAtual; delete dbRecord.kmAtual; }
  if (dbRecord.kmNoMomento !== undefined) { dbRecord.km_no_momento = dbRecord.kmNoMomento; delete dbRecord.kmNoMomento; }
  if (dbRecord.vehicleId !== undefined) { dbRecord.vehicle_id = dbRecord.vehicleId; delete dbRecord.vehicleId; }
  if (dbRecord.motoristaId !== undefined) { dbRecord.motorista_id = dbRecord.motoristaId; delete dbRecord.motoristaId; }
  if (dbRecord.ajudanteId !== undefined) { dbRecord.ajudante_id = dbRecord.ajudanteId; delete dbRecord.ajudanteId; }
  if (dbRecord.fotoNota !== undefined) { dbRecord.foto_nota = dbRecord.fotoNota; delete dbRecord.fotoNota; }
  if (dbRecord.motivoRejeicao !== undefined) { dbRecord.motivo_rejeicao = dbRecord.motivoRejeicao; delete dbRecord.motivoRejeicao; }
  if (dbRecord.createdAt !== undefined) { dbRecord.created_at = dbRecord.createdAt; delete dbRecord.createdAt; }

  return dbRecord;
};
