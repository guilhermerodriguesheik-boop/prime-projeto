import { neon } from '@neondatabase/serverless';

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

// Colunas que devem ser convertidas para numero
const NUMERIC_COLUMNS = new Set([
  'valor', 'valor_frete', 'valor_motorista', 'valor_ajudante', 'valor_agregado',
  'km_atual', 'km_no_momento', 'proxima_manutencao_km',
  'last_lat', 'last_lng', 'km_alvo'
]);

export function toCamel(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
    // Converter colunas numericas de string para number
    if (NUMERIC_COLUMNS.has(k) && v !== null && v !== undefined) {
      out[camel] = Number(v);
    } else {
      out[camel] = v;
    }
  }
  return out;
}

export function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export function corsOk() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
