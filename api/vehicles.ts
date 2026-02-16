import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM vehicles ORDER BY placa`;
      return json(rows.map(r => {
        const c = toCamel(r);
        if (typeof c.preventiveTasks === 'string') c.preventiveTasks = JSON.parse(c.preventiveTasks);
        return c;
      }));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      const existing = await sql`SELECT id FROM vehicles WHERE id = ${b.id}`;
      if (existing.length > 0) {
        await sql`UPDATE vehicles SET placa=${b.placa}, modelo=${b.modelo}, km_atual=${b.kmAtual}, status=${b.status}, preventive_tasks=${JSON.stringify(b.preventiveTasks || [])}, proxima_manutencao_km=${b.proximaManutencaoKm || null}, ultima_revisao_data=${b.ultimaRevisaoData || null}, tracker_id=${b.trackerId || null}, last_lat=${b.lastLat || null}, last_lng=${b.lastLng || null}, is_online=${b.isOnline || false} WHERE id=${b.id}`;
      } else {
        await sql`INSERT INTO vehicles (id, placa, modelo, km_atual, status, preventive_tasks, proxima_manutencao_km, ultima_revisao_data, tracker_id, last_lat, last_lng, is_online) VALUES (${b.id}, ${b.placa}, ${b.modelo}, ${b.kmAtual}, ${b.status}, ${JSON.stringify(b.preventiveTasks || [])}, ${b.proximaManutencaoKm || null}, ${b.ultimaRevisaoData || null}, ${b.trackerId || null}, ${b.lastLat || null}, ${b.lastLng || null}, ${b.isOnline || false})`;
      }
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const { id, ...updates } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      if (updates.placa !== undefined) await sql`UPDATE vehicles SET placa = ${updates.placa} WHERE id = ${id}`;
      if (updates.modelo !== undefined) await sql`UPDATE vehicles SET modelo = ${updates.modelo} WHERE id = ${id}`;
      if (updates.kmAtual !== undefined) await sql`UPDATE vehicles SET km_atual = ${updates.kmAtual} WHERE id = ${id}`;
      if (updates.status !== undefined) await sql`UPDATE vehicles SET status = ${updates.status} WHERE id = ${id}`;
      if (updates.preventiveTasks !== undefined) await sql`UPDATE vehicles SET preventive_tasks = ${JSON.stringify(updates.preventiveTasks)} WHERE id = ${id}`;
      if (updates.proximaManutencaoKm !== undefined) await sql`UPDATE vehicles SET proxima_manutencao_km = ${updates.proximaManutencaoKm} WHERE id = ${id}`;
      if (updates.ultimaRevisaoData !== undefined) await sql`UPDATE vehicles SET ultima_revisao_data = ${updates.ultimaRevisaoData} WHERE id = ${id}`;
      if (updates.trackerId !== undefined) await sql`UPDATE vehicles SET tracker_id = ${updates.trackerId} WHERE id = ${id}`;
      if (updates.lastLat !== undefined) await sql`UPDATE vehicles SET last_lat = ${updates.lastLat} WHERE id = ${id}`;
      if (updates.lastLng !== undefined) await sql`UPDATE vehicles SET last_lng = ${updates.lastLng} WHERE id = ${id}`;
      if (updates.isOnline !== undefined) await sql`UPDATE vehicles SET is_online = ${updates.isOnline} WHERE id = ${id}`;
      const [row] = await sql`SELECT * FROM vehicles WHERE id = ${id}`;
      if (!row) return json({ error: 'Not found' }, 404);
      const c = toCamel(row);
      if (typeof c.preventiveTasks === 'string') c.preventiveTasks = JSON.parse(c.preventiveTasks);
      return json(c);
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
