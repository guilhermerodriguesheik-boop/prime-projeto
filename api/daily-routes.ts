import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM daily_routes ORDER BY created_at DESC`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      await sql`INSERT INTO daily_routes (id, motorista_id, ajudante_id, ajudante_nome, vehicle_id, placa, cliente_id, cliente_nome, destino, oc, valor_frete, valor_motorista, valor_ajudante, status_financeiro, created_at, foto_frente, foto_lateral_esquerda, foto_lateral_direita, foto_traseira, nivel_oleo, nivel_agua) VALUES (${b.id}, ${b.motoristaId}, ${b.ajudanteId || null}, ${b.ajudanteNome || null}, ${b.vehicleId}, ${b.placa}, ${b.clienteId || null}, ${b.clienteNome || null}, ${b.destino}, ${b.oc || null}, ${b.valorFrete || null}, ${b.valorMotorista || null}, ${b.valorAjudante || null}, ${b.statusFinanceiro || 'pendente'}, ${b.createdAt || new Date().toISOString()}, ${b.fotoFrente || null}, ${b.fotoLateralEsquerda || null}, ${b.fotoLateralDireita || null}, ${b.fotoTraseira || null}, ${b.nivelOleo || null}, ${b.nivelAgua || null})`;
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const { id, ...updates } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      if (updates.ajudanteId !== undefined) await sql`UPDATE daily_routes SET ajudante_id = ${updates.ajudanteId} WHERE id = ${id}`;
      if (updates.ajudanteNome !== undefined) await sql`UPDATE daily_routes SET ajudante_nome = ${updates.ajudanteNome} WHERE id = ${id}`;
      if (updates.valorFrete !== undefined) await sql`UPDATE daily_routes SET valor_frete = ${updates.valorFrete} WHERE id = ${id}`;
      if (updates.valorMotorista !== undefined) await sql`UPDATE daily_routes SET valor_motorista = ${updates.valorMotorista} WHERE id = ${id}`;
      if (updates.valorAjudante !== undefined) await sql`UPDATE daily_routes SET valor_ajudante = ${updates.valorAjudante} WHERE id = ${id}`;
      if (updates.statusFinanceiro !== undefined) await sql`UPDATE daily_routes SET status_financeiro = ${updates.statusFinanceiro} WHERE id = ${id}`;
      if (updates.adminFinanceiroId !== undefined) await sql`UPDATE daily_routes SET admin_financeiro_id = ${updates.adminFinanceiroId} WHERE id = ${id}`;
      if (updates.fotoFrente !== undefined) await sql`UPDATE daily_routes SET foto_frente = ${updates.fotoFrente} WHERE id = ${id}`;
      if (updates.fotoLateralEsquerda !== undefined) await sql`UPDATE daily_routes SET foto_lateral_esquerda = ${updates.fotoLateralEsquerda} WHERE id = ${id}`;
      if (updates.fotoLateralDireita !== undefined) await sql`UPDATE daily_routes SET foto_lateral_direita = ${updates.fotoLateralDireita} WHERE id = ${id}`;
      if (updates.fotoTraseira !== undefined) await sql`UPDATE daily_routes SET foto_traseira = ${updates.fotoTraseira} WHERE id = ${id}`;
      if (updates.nivelOleo !== undefined) await sql`UPDATE daily_routes SET nivel_oleo = ${updates.nivelOleo} WHERE id = ${id}`;
      if (updates.nivelAgua !== undefined) await sql`UPDATE daily_routes SET nivel_agua = ${updates.nivelAgua} WHERE id = ${id}`;
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      const { id } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      await sql`DELETE FROM daily_routes WHERE id = ${id}`;
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
