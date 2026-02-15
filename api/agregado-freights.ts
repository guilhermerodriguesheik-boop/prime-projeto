import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM agregado_freights ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO agregado_freights (id, agregado_id, nome_agregado, placa, valor_frete, valor_agregado, oc, data, created_at) VALUES (${b.id}, ${b.agregadoId}, ${b.nomeAgregado}, ${b.placa}, ${b.valorFrete}, ${b.valorAgregado}, ${b.oc || null}, ${b.data}, ${b.createdAt || new Date().toISOString()})`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /agregado-freights error:', e);
    return res.status(500).json({ error: e.message });
  }
}
