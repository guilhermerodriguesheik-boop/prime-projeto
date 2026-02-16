import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM fuelings ORDER BY created_at DESC`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      await sql`INSERT INTO fuelings (id, vehicle_id, placa, motorista_id, km_no_momento, valor, foto_nota, status, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.motoristaId}, ${b.kmNoMomento}, ${b.valor}, ${b.fotoNota || null}, ${b.status || 'pendente'}, ${b.createdAt || new Date().toISOString()})`;
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const { id, ...updates } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      if (updates.status !== undefined) await sql`UPDATE fuelings SET status = ${updates.status} WHERE id = ${id}`;
      if (updates.motivoRejeicao !== undefined) await sql`UPDATE fuelings SET motivo_rejeicao = ${updates.motivoRejeicao} WHERE id = ${id}`;
      if (updates.adminAprovadorId !== undefined) await sql`UPDATE fuelings SET admin_aprovador_id = ${updates.adminAprovadorId} WHERE id = ${id}`;
      if (updates.approvedAt !== undefined) await sql`UPDATE fuelings SET approved_at = ${updates.approvedAt} WHERE id = ${id}`;
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
