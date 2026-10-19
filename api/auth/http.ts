import { checkRateLimit, clientKeyFromRequest, rateLimitDisabled } from '../lib/rateLimit.js';

export type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
};

export type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown; end?: () => void };
};

export function readJsonBody(body: unknown): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return null;
    }
  }
  return body ?? null;
}

export function noStore(res: ApiResponse): void {
  res.setHeader('Cache-Control', 'no-store');
}

export function rateLimitAuth(
  req: ApiRequest,
  res: ApiResponse,
  bucket: string,
  max: number,
  windowMs: number,
): boolean {
  if (rateLimitDisabled()) return false;
  const key = `${bucket}:${clientKeyFromRequest(req)}`;
  const rl = checkRateLimit(key, max, windowMs);
  if (!rl.limited) return false;
  res.setHeader('Retry-After', String(rl.retryAfterSec));
  res.status(429).json({
    error: 'Too many requests',
    code: 'RATE_LIMITED',
    retryAfterSec: rl.retryAfterSec,
  });
  return true;
}
