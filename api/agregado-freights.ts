import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM agregado_freights ORDER BY created_at DESC`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      await sql`INSERT INTO agregado_freights (id, agregado_id, nome_agregado, placa, valor_frete, valor_agregado, oc, data, created_at) VALUES (${b.id}, ${b.agregadoId}, ${b.nomeAgregado}, ${b.placa}, ${b.valorFrete}, ${b.valorAgregado}, ${b.oc || null}, ${b.data}, ${b.createdAt || new Date().toISOString()})`;
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      const { id } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      await sql`DELETE FROM agregado_freights WHERE id = ${id}`;
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
