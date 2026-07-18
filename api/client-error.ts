/**
 * Client error beacon. `lib/errorReporting.ts` POSTs here via `navigator.sendBeacon`
 * when `VITE_ERROR_REPORTING_URL` points at this route (relative `/api/client-error`
 * works on every deployment). Always returns 204 — beacons must never surface errors.
 *
 * Complements optional Sentry (`VITE_SENTRY_DSN`). See docs/MONITORING.md.
 */
import { apiLogger } from './lib/logger.js';
import { setApiCorsHeaders } from './lib/httpProduction.js';

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ResponseLike = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { end: () => unknown; json: (o: object) => unknown };
};

const MAX_MESSAGE = 500;
const MAX_STACK = 4000;
const MAX_ROUTE = 300;

function header(req: RequestLike, name: string): string | undefined {
  const h = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(h) ? h[0] : h;
}

function asString(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function summarize(raw: unknown, ua: string | undefined): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;
  const message = asString(body.message, MAX_MESSAGE);
  if (!message) return null;
  return {
    message,
    name: asString(body.name, 80) ?? 'Error',
    stack: asString(body.stack, MAX_STACK),
    route: asString(body.route, MAX_ROUTE),
    url: asString(body.url, MAX_ROUTE),
    userAgent: ua,
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  setApiCorsHeaders(res, { allowMethods: 'POST, OPTIONS' });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).end();
  }

  let parsed: unknown = req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = null;
    }
  }

  const summary = summarize(parsed, header(req, 'user-agent'));
  if (summary) {
    apiLogger.warn('Client error beacon', summary);
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}
