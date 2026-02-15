import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM vehicles ORDER BY placa`;
      return res.json(rows.map(r => {
        const c = toCamel(r);
        if (typeof c.preventiveTasks === 'string') c.preventiveTasks = JSON.parse(c.preventiveTasks);
        return c;
      }));
    }

    if (req.method === 'POST') {
      const b = req.body;
      const existing = await sql`SELECT id FROM vehicles WHERE id = ${b.id}`;
      if (existing.length > 0) {
        await sql`UPDATE vehicles SET placa=${b.placa}, modelo=${b.modelo}, km_atual=${b.kmAtual}, status=${b.status}, preventive_tasks=${JSON.stringify(b.preventiveTasks || [])}, proxima_manutencao_km=${b.proximaManutencaoKm || null}, ultima_revisao_data=${b.ultimaRevisaoData || null}, tracker_id=${b.trackerId || null}, last_lat=${b.lastLat || null}, last_lng=${b.lastLng || null}, is_online=${b.isOnline || false} WHERE id=${b.id}`;
      } else {
        await sql`INSERT INTO vehicles (id, placa, modelo, km_atual, status, preventive_tasks, proxima_manutencao_km, ultima_revisao_data, tracker_id, last_lat, last_lng, is_online) VALUES (${b.id}, ${b.placa}, ${b.modelo}, ${b.kmAtual}, ${b.status}, ${JSON.stringify(b.preventiveTasks || [])}, ${b.proximaManutencaoKm || null}, ${b.ultimaRevisaoData || null}, ${b.trackerId || null}, ${b.lastLat || null}, ${b.lastLng || null}, ${b.isOnline || false})`;
      }
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      // Build dynamic update
      const fields: string[] = [];
      const vals: any[] = [];
      const map: Record<string, string> = {
        placa: 'placa', modelo: 'modelo', kmAtual: 'km_atual', status: 'status',
        preventiveTasks: 'preventive_tasks', proximaManutencaoKm: 'proxima_manutencao_km',
        ultimaRevisaoData: 'ultima_revisao_data', trackerId: 'tracker_id',
        lastLat: 'last_lat', lastLng: 'last_lng', isOnline: 'is_online'
      };
      for (const [k, v] of Object.entries(updates)) {
        if (map[k]) {
          const val = k === 'preventiveTasks' ? JSON.stringify(v) : v;
          await sql`UPDATE vehicles SET ${sql.unsafe(map[k])} = ${val} WHERE id = ${id}`;
        }
      }
      // Re-fetch and return
      const [row] = await sql`SELECT * FROM vehicles WHERE id = ${id}`;
      if (!row) return res.status(404).json({ error: 'Not found' });
      const c = toCamel(row);
      if (typeof c.preventiveTasks === 'string') c.preventiveTasks = JSON.parse(c.preventiveTasks);
      return res.json(c);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /vehicles error:', e);
    return res.status(500).json({ error: e.message });
  }
}
