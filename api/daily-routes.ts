import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, toCamel, cors } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM daily_routes ORDER BY created_at DESC`;
      return res.json(rows.map(toCamel));
    }

    if (req.method === 'POST') {
      const b = req.body;
      await sql`INSERT INTO daily_routes (id, motorista_id, ajudante_id, ajudante_nome, vehicle_id, placa, cliente_id, cliente_nome, destino, oc, valor_frete, valor_motorista, valor_ajudante, status_financeiro, created_at, foto_frente, foto_lateral_esquerda, foto_lateral_direita, foto_traseira, nivel_oleo, nivel_agua) VALUES (${b.id}, ${b.motoristaId}, ${b.ajudanteId || null}, ${b.ajudanteNome || null}, ${b.vehicleId}, ${b.placa}, ${b.clienteId || null}, ${b.clienteNome || null}, ${b.destino}, ${b.oc || null}, ${b.valorFrete || null}, ${b.valorMotorista || null}, ${b.valorAjudante || null}, ${b.statusFinanceiro || 'pendente'}, ${b.createdAt || new Date().toISOString()}, ${b.fotoFrente || null}, ${b.fotoLateralEsquerda || null}, ${b.fotoLateralDireita || null}, ${b.fotoTraseira || null}, ${b.nivelOleo || null}, ${b.nivelAgua || null})`;
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const map: Record<string, string> = {
        ajudanteId: 'ajudante_id', ajudanteNome: 'ajudante_nome',
        valorFrete: 'valor_frete', valorMotorista: 'valor_motorista',
        valorAjudante: 'valor_ajudante', statusFinanceiro: 'status_financeiro',
        adminFinanceiroId: 'admin_financeiro_id',
        fotoFrente: 'foto_frente', fotoLateralEsquerda: 'foto_lateral_esquerda',
        fotoLateralDireita: 'foto_lateral_direita', fotoTraseira: 'foto_traseira',
        nivelOleo: 'nivel_oleo', nivelAgua: 'nivel_agua'
      };
      for (const [k, v] of Object.entries(updates)) {
        if (map[k]) {
          await sql`UPDATE daily_routes SET ${sql.unsafe(map[k])} = ${v} WHERE id = ${id}`;
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('API /daily-routes error:', e);
    return res.status(500).json({ error: e.message });
  }
}
