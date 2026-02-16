import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM maintenances ORDER BY created_at DESC`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const b = await request.json();
      await sql`INSERT INTO maintenances (id, vehicle_id, placa, motorista_id, tipo, descricao, km_no_momento, foto, status, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.motoristaId}, ${b.tipo}, ${b.descricao}, ${b.kmNoMomento}, ${b.foto || null}, ${b.status || 'pendente'}, ${b.createdAt || new Date().toISOString()})`;
      return json({ ok: true });
    }
    if (request.method === 'PUT') {
      const { id, ...updates } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      if (updates.status !== undefined) await sql`UPDATE maintenances SET status = ${updates.status} WHERE id = ${id}`;
      if (updates.adminResponsavelId !== undefined) await sql`UPDATE maintenances SET admin_responsavel_id = ${updates.adminResponsavelId} WHERE id = ${id}`;
      if (updates.assumedAt !== undefined) await sql`UPDATE maintenances SET assumed_at = ${updates.assumedAt} WHERE id = ${id}`;
      if (updates.startedAt !== undefined) await sql`UPDATE maintenances SET started_at = ${updates.startedAt} WHERE id = ${id}`;
      if (updates.doneAt !== undefined) await sql`UPDATE maintenances SET done_at = ${updates.doneAt} WHERE id = ${id}`;
      if (updates.oficina !== undefined) await sql`UPDATE maintenances SET oficina = ${updates.oficina} WHERE id = ${id}`;
      if (updates.valor !== undefined) await sql`UPDATE maintenances SET valor = ${updates.valor} WHERE id = ${id}`;
      if (updates.notaFoto !== undefined) await sql`UPDATE maintenances SET nota_foto = ${updates.notaFoto} WHERE id = ${id}`;
      if (updates.observacaoAdmin !== undefined) await sql`UPDATE maintenances SET observacao_admin = ${updates.observacaoAdmin} WHERE id = ${id}`;
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      const { id } = await request.json();
      if (!id) return json({ error: 'id required' }, 400);
      await sql`DELETE FROM maintenances WHERE id = ${id}`;
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
