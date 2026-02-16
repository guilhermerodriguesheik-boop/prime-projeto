import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM tolls ORDER BY created_at DESC`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      await sql`INSERT INTO tolls (id, vehicle_id, placa, valor, data, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.valor}, ${b.data}, ${b.createdAt || new Date().toISOString()})`;
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const items = await request.json();
      if (Array.isArray(items)) {
        await sql`DELETE FROM tolls`;
        for (const b of items) {
          await sql`INSERT INTO tolls (id, vehicle_id, placa, valor, data, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.valor}, ${b.data}, ${b.createdAt || new Date().toISOString()})`;
        }
      }
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
