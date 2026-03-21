/**
 * Fixed-window per-key rate limiter for serverless handlers.
 * In-memory only: effective per warm isolate; for strict global limits use Redis / Vercel KV.
 */

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();
let tick = 0;

function pickHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  name: string
): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  const key = Object.keys(headers).find((k) => k.toLowerCase() === lower);
  if (!key) return undefined;
  const v = headers[key];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === 'string' ? s : undefined;
}

/** Best-effort client key for abuse throttling (never log as PII in production). */
export function clientKeyFromRequest(req: {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
}): string {
  const xf = pickHeader(req.headers, 'x-forwarded-for');
  if (xf) return xf.split(',')[0]!.trim() || 'unknown';
  const realIp = pickHeader(req.headers, 'x-real-ip');
  if (realIp) return realIp.trim() || 'unknown';
  const ra = req.socket?.remoteAddress;
  if (ra && typeof ra === 'string') return ra;
  return 'unknown';
}

function pruneStale(maxAgeMs: number) {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now - v.windowStart > maxAgeMs) buckets.delete(k);
  }
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterMs: number; retryAfterSec: number };

/**
 * @param key — namespace prefix already applied (e.g. `ai:1.2.3.4`)
 * @param max — max requests per window
 * @param windowMs — window length in ms
 */
export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  if (max <= 0 || windowMs <= 0) return { limited: false };

  if (++tick % 250 === 0) pruneStale(windowMs * 3);

  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.windowStart + windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { limited: false };
  }
  if (b.count >= max) {
    const retryAfterMs = Math.max(0, b.windowStart + windowMs - now);
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return { limited: true, retryAfterMs, retryAfterSec };
  }
  b.count += 1;
  return { limited: false };
}

export function rateLimitDisabled(): boolean {
  return process.env.RATE_LIMIT_DISABLED === '1' || process.env.RATE_LIMIT_DISABLED === 'true';
}

export function envRateLimitMax(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
