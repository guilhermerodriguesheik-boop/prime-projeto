import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM fixed_expenses ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO fixed_expenses (id, categoria, descricao, valor, data_competencia, created_at) VALUES (${b.id}, ${b.categoria}, ${b.descricao}, ${b.valor}, ${b.dataCompetencia}, ${b.createdAt || new Date().toISOString()})`;
      return res.json({ ok: true });
    }

    // PUT to replace the entire list
    if (req.method === 'PUT') {
      const items = req.body;
      if (Array.isArray(items)) {
        // Delete all and re-insert
        await sql`DELETE FROM fixed_expenses`;
        for (const b of items) {
          await sql`INSERT INTO fixed_expenses (id, categoria, descricao, valor, data_competencia, created_at) VALUES (${b.id}, ${b.categoria}, ${b.descricao}, ${b.valor}, ${b.dataCompetencia}, ${b.createdAt || new Date().toISOString()})`;
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /fixed-expenses error:', e);
    return res.status(500).json({ error: e.message });
  }
}
