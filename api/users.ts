import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM users ORDER BY nome`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const { id, nome, email, senha, perfil, ativo, permissoes } = req.body;
      const existing = await sql`SELECT id FROM users WHERE id = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE users SET nome=${nome}, email=${email}, senha=${senha}, perfil=${perfil}, ativo=${ativo}, permissoes=${JSON.stringify(permissoes || [])} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO users (id, nome, email, senha, perfil, ativo, permissoes) VALUES (${id}, ${nome}, ${email}, ${senha}, ${perfil}, ${ativo}, ${JSON.stringify(permissoes || [])})`;
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /users error:', e);
    return res.status(500).json({ error: e.message });
  }
}
