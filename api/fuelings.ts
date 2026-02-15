import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM fuelings ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO fuelings (id, vehicle_id, placa, motorista_id, km_no_momento, valor, foto_nota, status, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.motoristaId}, ${b.kmNoMomento}, ${b.valor}, ${b.fotoNota || null}, ${b.status || 'pendente'}, ${b.createdAt || new Date().toISOString()})`;
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const map: Record<string, string> = {
        status: 'status', motivoRejeicao: 'motivo_rejeicao',
        adminAprovadorId: 'admin_aprovador_id', approvedAt: 'approved_at'
      };
      for (const [k, v] of Object.entries(updates)) {
        if (map[k]) {
          await sql`UPDATE fuelings SET ${sql.unsafe(map[k])} = ${v} WHERE id = ${id}`;
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /fuelings error:', e);
    return res.status(500).json({ error: e.message });
  }
}
