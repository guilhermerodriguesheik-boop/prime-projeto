import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  const sql = getDb();
  try {
    if (request.method === 'GET') {
      const rows = await sql`SELECT * FROM users ORDER BY nome`;
      return json(rows.map(toCamel));
    }
    if (request.method === 'POST') {
      const { id, nome, email, senha, perfil, ativo, permissoes } = await request.json();
      const existing = await sql`SELECT id FROM users WHERE id = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE users SET nome=${nome}, email=${email}, senha=${senha}, perfil=${perfil}, ativo=${ativo}, permissoes=${JSON.stringify(permissoes || [])} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO users (id, nome, email, senha, perfil, ativo, permissoes) VALUES (${id}, ${nome}, ${email}, ${senha}, ${perfil}, ${ativo}, ${JSON.stringify(permissoes || [])})`;
      }
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
