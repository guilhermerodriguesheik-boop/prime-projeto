import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM tolls ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO tolls (id, vehicle_id, placa, valor, data, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.valor}, ${b.data}, ${b.createdAt || new Date().toISOString()})`;
      return res.json({ ok: true });
    }

    // PUT to replace the entire list
    if (req.method === 'PUT') {
      const items = req.body;
      if (Array.isArray(items)) {
        await sql`DELETE FROM tolls`;
        for (const b of items) {
          await sql`INSERT INTO tolls (id, vehicle_id, placa, valor, data, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.valor}, ${b.data}, ${b.createdAt || new Date().toISOString()})`;
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /tolls error:', e);
    return res.status(500).json({ error: e.message });
  }
}
