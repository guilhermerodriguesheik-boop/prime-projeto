import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM customers ORDER BY nome`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const { id, nome, cnpj, ativo } = req.body;
      const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE customers SET nome=${nome}, cnpj=${cnpj || null}, ativo=${ativo} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO customers (id, nome, cnpj, ativo) VALUES (${id}, ${nome}, ${cnpj || null}, ${ativo})`;
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /customers error:', e);
    return res.status(500).json({ error: e.message });
  }
}
