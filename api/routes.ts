import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM routes ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO routes (id, vehicle_id, placa, motorista_id, ajudante_id, ajudante_nome, cliente_id, cliente_nome, destino, oc, valor_frete, valor_motorista, valor_ajudante, status_financeiro, observacao, status, created_at) VALUES (${b.id}, ${b.vehicleId}, ${b.placa}, ${b.motoristaId}, ${b.ajudanteId || null}, ${b.ajudanteNome || null}, ${b.clienteId || null}, ${b.clienteNome || null}, ${b.destino}, ${b.oc || null}, ${b.valorFrete || null}, ${b.valorMotorista || null}, ${b.valorAjudante || null}, ${b.statusFinanceiro || 'pendente'}, ${b.observacao || null}, ${b.status || 'em_rota'}, ${b.createdAt || new Date().toISOString()})`;
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const map: Record<string, string> = {
        status: 'status', finishedAt: 'finished_at', observacao: 'observacao',
        valorFrete: 'valor_frete', valorMotorista: 'valor_motorista',
        valorAjudante: 'valor_ajudante', statusFinanceiro: 'status_financeiro',
        adminFinanceiroId: 'admin_financeiro_id',
        ajudanteId: 'ajudante_id', ajudanteNome: 'ajudante_nome'
      };
      for (const [k, v] of Object.entries(updates)) {
        if (map[k]) {
          await sql`UPDATE routes SET ${sql.unsafe(map[k])} = ${v} WHERE id = ${id}`;
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /routes error:', e);
    return res.status(500).json({ error: e.message });
  }
}
