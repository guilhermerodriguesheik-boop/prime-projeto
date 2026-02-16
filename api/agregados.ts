import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM agregados ORDER BY nome`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const { id, nome, placa, ativo } = await request.json();
      const existing = await sql`SELECT id FROM agregados WHERE id = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE agregados SET nome=${nome}, placa=${placa}, ativo=${ativo} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO agregados (id, nome, placa, ativo) VALUES (${id}, ${nome}, ${placa}, ${ativo})`;
      }
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const items = await request.json();
      if (Array.isArray(items)) {
        for (const { id, nome, placa, ativo } of items) {
          const existing = await sql`SELECT id FROM agregados WHERE id = ${id}`;
          if (existing.length > 0) {
            await sql`UPDATE agregados SET nome=${nome}, placa=${placa}, ativo=${ativo} WHERE id=${id}`;
          } else {
            await sql`INSERT INTO agregados (id, nome, placa, ativo) VALUES (${id}, ${nome}, ${placa}, ${ativo})`;
          }
        }
      }
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
