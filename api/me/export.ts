/**
 * GDPR Article 20 — Right to data portability.
 *
 * GET /api/me/export returns a downloadable JSON file containing every row
 * the authenticated user owns across the project's user-scoped tables.
 *
 * Auth model: validate the user's `Authorization: Bearer <jwt>` against
 * Supabase, then run the SELECT queries through the *anon* client with the
 * same JWT so RLS — not the application — guarantees row scoping. Service
 * role is never used here.
 *
 * @see docs/GDPR.md
 */

import { createClient } from '@supabase/supabase-js';
import { setApiCorsHeaders } from '../lib/httpProduction.js';
import { apiLogger } from '../lib/logger.js';
import {
  checkRateLimit,
  clientKeyFromRequest,
  rateLimitDisabled,
} from '../lib/rateLimit.js';

const ALLOWED_METHODS = 'GET, OPTIONS';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const AUDIT_EVENTS_LIMIT = 10_000;
const SCHEMA_VERSION = 1;

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown; end?: () => void };
};

function pickHeader(req: ApiRequest, name: string): string | undefined {
  const h = req.headers;
  if (!h) return undefined;
  const lower = name.toLowerCase();
  const key = Object.keys(h).find((k) => k.toLowerCase() === lower);
  if (!key) return undefined;
  const v = h[key];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === 'string' ? s : undefined;
}

function bearerToken(req: ApiRequest): string | null {
  const raw = pickHeader(req, 'authorization');
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

function supabaseUrlFromEnv(): string | undefined {
  return process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
}

function supabaseAnonKeyFromEnv(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim()
  );
}

function safeFilenameStub(userId: string): string {
  // UUIDs are filename-safe; collapse anything weird just in case.
  return userId.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const requestId =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  setApiCorsHeaders(res, { allowMethods: ALLOWED_METHODS });

  if (req.method === 'OPTIONS') {
    const r = res.status(204);
    r.end?.();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ALLOWED_METHODS);
    return res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      requestId,
      message: 'Method Not Allowed',
    });
  }

  if (!rateLimitDisabled()) {
    const key = `me-export:${clientKeyFromRequest(req)}`;
    const rl = checkRateLimit(key, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (rl.limited) {
      res.setHeader('Retry-After', String(rl.retryAfterSec));
      return res.status(429).json({
        code: 'RATE_LIMITED',
        requestId,
        message: 'Too many requests',
        retryAfterSec: rl.retryAfterSec,
      });
    }
  }

  const url = supabaseUrlFromEnv();
  const anon = supabaseAnonKeyFromEnv();
  if (!url || !anon) {
    apiLogger.error('me-export: Supabase URL/anon key not configured', { requestId });
    return res.status(503).json({
      code: 'CONFIG',
      requestId,
      message: 'export endpoint not configured',
    });
  }

  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({
      code: 'AUTH_REQUIRED',
      requestId,
      message: 'missing bearer token',
    });
  }

  try {
    // Anon client carrying the user's JWT so PostgREST evaluates RLS as that user.
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userResult, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userResult?.user) {
      return res.status(401).json({
        code: 'AUTH_INVALID',
        requestId,
        message: 'invalid or expired session',
      });
    }
    const userId = userResult.user.id;
    const email = userResult.user.email ?? null;

    const [cardsRes, targetsRes, auditRes, userDataRes] = await Promise.all([
      supabase.from('cards').select('*').eq('user_id', userId),
      supabase.from('targets').select('*').eq('user_id', userId),
      supabase
        .from('audit_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(AUDIT_EVENTS_LIMIT),
      supabase.from('user_data').select('*').eq('user_id', userId),
    ]);

    const queryFailures: Array<[string, unknown]> = [];
    if (cardsRes.error) queryFailures.push(['cards', cardsRes.error]);
    if (targetsRes.error) queryFailures.push(['targets', targetsRes.error]);
    if (auditRes.error) queryFailures.push(['audit_events', auditRes.error]);
    if (userDataRes.error) queryFailures.push(['user_data', userDataRes.error]);

    if (queryFailures.length > 0) {
      apiLogger.error('me-export: one or more queries failed', {
        requestId,
        userId,
        failures: queryFailures.map(([table, err]) => ({
          table,
          message: err instanceof Error ? err.message : String(err),
        })),
      });
      return res.status(500).json({
        code: 'INTERNAL',
        requestId,
        message: 'export failed',
      });
    }

    const cards = cardsRes.data ?? [];
    const targets = targetsRes.data ?? [];
    const auditEvents = auditRes.data ?? [];
    const userDataRows = userDataRes.data ?? [];

    const counts = {
      cards: cards.length,
      targets: targets.length,
      auditEvents: auditEvents.length,
      userData: userDataRows.length,
    };

    const exportedAt = new Date().toISOString();
    const yyyymmdd = exportedAt.slice(0, 10).replace(/-/g, '');
    const filename = `msi-export-${safeFilenameStub(userId)}-${yyyymmdd}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    // Best-effort audit insert — must not fail the export.
    try {
      const { error: insertErr } = await supabase.from('audit_events').insert({
        user_id: userId,
        category: 'data',
        action: 'data.exported',
        entity_type: 'user',
        entity_id: userId,
        metadata: { counts, requestId },
      });
      if (insertErr) {
        apiLogger.warn('me-export: audit insert failed (non-fatal)', {
          requestId,
          userId,
          message: insertErr.message,
        });
      } else {
        apiLogger.info('me-export: completed', { requestId, userId, counts });
      }
    } catch (auditErr) {
      apiLogger.warn('me-export: audit insert threw (non-fatal)', {
        requestId,
        userId,
        error: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }

    return res.status(200).json({
      schemaVersion: SCHEMA_VERSION,
      exportedAt,
      user: { id: userId, email },
      counts,
      data: {
        cards,
        targets,
        auditEvents,
        userData: userDataRows,
      },
    });
  } catch (err) {
    apiLogger.error('me-export: unexpected error', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({
      code: 'INTERNAL',
      requestId,
      message: 'export failed',
    });
  }
}

export const config = { runtime: 'nodejs' };
