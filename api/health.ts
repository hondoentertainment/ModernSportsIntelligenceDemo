/**
 * Production health check for monitoring and load balancers.
 * GET /api/health returns 200 with minimal payload.
 * Future: if this route accepts query params, validate them with Zod (e.g. z.object({}).strict()).
 */

export interface HealthResponse {
  ok: boolean;
  service: string;
  timestamp: string;
}

export default async function handler(req: { method?: string }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => unknown }; end?: () => void }) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');
  const body: HealthResponse = {
    ok: true,
    service: 'msi',
    timestamp: new Date().toISOString(),
  };
  return res.status(200).json(body);
}
