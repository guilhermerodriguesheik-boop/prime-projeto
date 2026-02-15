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
      if (updates.status !== undefined) await sql`UPDATE maintenances SET status = ${updates.status} WHERE id = ${id}`;
      if (updates.adminResponsavelId !== undefined) await sql`UPDATE maintenances SET admin_responsavel_id = ${updates.adminResponsavelId} WHERE id = ${id}`;
      if (updates.assumedAt !== undefined) await sql`UPDATE maintenances SET assumed_at = ${updates.assumedAt} WHERE id = ${id}`;
      if (updates.startedAt !== undefined) await sql`UPDATE maintenances SET started_at = ${updates.startedAt} WHERE id = ${id}`;
      if (updates.doneAt !== undefined) await sql`UPDATE maintenances SET done_at = ${updates.doneAt} WHERE id = ${id}`;
      if (updates.oficina !== undefined) await sql`UPDATE maintenances SET oficina = ${updates.oficina} WHERE id = ${id}`;
      if (updates.valor !== undefined) await sql`UPDATE maintenances SET valor = ${updates.valor} WHERE id = ${id}`;
      if (updates.notaFoto !== undefined) await sql`UPDATE maintenances SET nota_foto = ${updates.notaFoto} WHERE id = ${id}`;
      if (updates.observacaoAdmin !== undefined) await sql`UPDATE maintenances SET observacao_admin = ${updates.observacaoAdmin} WHERE id = ${id}`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /maintenances error:', e);
    return res.status(500).json({ error: e.message });
  }
}
