import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = getDb();
  try {
    const { email, senha } = req.body;
    const rows = await sql`SELECT * FROM users WHERE email = ${email} AND senha = ${senha} AND ativo = true`;
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciais invalidas' });
    return res.json(toCamel(rows[0]));
  } catch (e: any) {
    console.error('API /login error:', e);
    return res.status(500).json({ error: e.message });
  }
}
