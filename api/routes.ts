import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM routes ORDER BY created_at DESC`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      await sql`INSERT INTO routes (id, vehicle_id, placa, motorista_id, ajudante_id, ajudante_nome, cliente_id, cliente_nome, destino, oc, valor_frete, valor_motorista, valor_ajudante, status_financeiro, observacao, status, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.motoristaId}, ${b.ajudanteId || null}, ${b.ajudanteNome || null}, ${b.clienteId || null}, ${b.clienteNome || null}, ${b.destino}, ${b.oc || null}, ${b.valorFrete || null}, ${b.valorMotorista || null}, ${b.valorAjudante || null}, ${b.statusFinanceiro || 'pendente'}, ${b.observacao || null}, ${b.status || 'em_rota'}, ${b.createdAt || new Date().toISOString()})`;
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const { id, ...updates } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      if (updates.status !== undefined) await sql`UPDATE routes SET status = ${updates.status} WHERE id = ${id}`;
      if (updates.finishedAt !== undefined) await sql`UPDATE routes SET finished_at = ${updates.finishedAt} WHERE id = ${id}`;
      if (updates.observacao !== undefined) await sql`UPDATE routes SET observacao = ${updates.observacao} WHERE id = ${id}`;
      if (updates.valorFrete !== undefined) await sql`UPDATE routes SET valor_frete = ${updates.valorFrete} WHERE id = ${id}`;
      if (updates.valorMotorista !== undefined) await sql`UPDATE routes SET valor_motorista = ${updates.valorMotorista} WHERE id = ${id}`;
      if (updates.valorAjudante !== undefined) await sql`UPDATE routes SET valor_ajudante = ${updates.valorAjudante} WHERE id = ${id}`;
      if (updates.statusFinanceiro !== undefined) await sql`UPDATE routes SET status_financeiro = ${updates.statusFinanceiro} WHERE id = ${id}`;
      if (updates.adminFinanceiroId !== undefined) await sql`UPDATE routes SET admin_financeiro_id = ${updates.adminFinanceiroId} WHERE id = ${id}`;
      if (updates.ajudanteId !== undefined) await sql`UPDATE routes SET ajudante_id = ${updates.ajudanteId} WHERE id = ${id}`;
      if (updates.ajudanteNome !== undefined) await sql`UPDATE routes SET ajudante_nome = ${updates.ajudanteNome} WHERE id = ${id}`;
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      const { id } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      await sql`DELETE FROM routes WHERE id = ${id}`;
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
