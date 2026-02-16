import { getDb, toCamel, json, corsOk } from './_db';

export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return corsOk();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const sql = getDb();
  try {
    const { email, senha } = await request.json();
    const rows = await sql`SELECT * FROM users WHERE email = ${email} AND senha = ${senha} AND ativo = true`;
    if (rows.length === 0) return json({ error: 'Credenciais invalidas' }, 401);
    return json(toCamel(rows[0]));
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}
