import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM maintenances ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO maintenances (id, vehicle_id, placa, motorista_id, tipo, descricao, km_no_momento, foto, status, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.motoristaId}, ${b.tipo}, ${b.descricao}, ${b.kmNoMomento}, ${b.foto || null}, ${b.status || 'pendente'}, ${b.createdAt || new Date().toISOString()})`;
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const map: Record<string, string> = {
        status: 'status', adminResponsavelId: 'admin_responsavel_id',
        assumedAt: 'assumed_at', startedAt: 'started_at', doneAt: 'done_at',
        oficina: 'oficina', valor: 'valor', notaFoto: 'nota_foto',
        observacaoAdmin: 'observacao_admin'
      };
      for (const [k, v] of Object.entries(updates)) {
        if (map[k]) {
          await sql`UPDATE maintenances SET ${sql.unsafe(map[k])} = ${v} WHERE id = ${id}`;
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /maintenances error:', e);
    return res.status(500).json({ error: e.message });
  }
}
