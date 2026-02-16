import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM customers ORDER BY nome`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const { id, nome, cnpj, ativo } = await request.json();
      const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE customers SET nome=${nome}, cnpj=${cnpj || null}, ativo=${ativo} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO customers (id, nome, cnpj, ativo) VALUES (${id}, ${nome}, ${cnpj || null}, ${ativo})`;
      }
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
