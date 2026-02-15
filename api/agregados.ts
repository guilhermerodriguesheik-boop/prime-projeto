import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM agregados ORDER BY nome`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const { id, nome, placa, ativo } = req.body;
      const existing = await sql`SELECT id FROM agregados WHERE id = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE agregados SET nome=${nome}, placa=${placa}, ativo=${ativo} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO agregados (id, nome, placa, ativo) VALUES (${id}, ${nome}, ${placa}, ${ativo})`;
      }
      return res.json({ ok: true });
    }

    // PUT to replace the entire list (used by AdminAgregadoManagement)
    if (req.method === 'PUT') {
      const items = req.body;
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
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /agregados error:', e);
    return res.status(500).json({ error: e.message });
  }
}
