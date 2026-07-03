/**
 * GDPR Article 17 — Right to erasure ("right to be forgotten").
 *
 * POST /api/me/delete erases the authenticated user's data across every
 * user-scoped table and removes the Supabase Auth account. The Stripe
 * customer (if any) is deleted first so we never leave a subscription
 * billing a deleted account.
 *
 * Auth model: validate the user's `Authorization: Bearer <jwt>` against
 * Supabase via the anon client (same pattern as /api/me/export), then
 * perform the cascade with the service-role client because some tables
 * (auth.users, anonymized audit_events) are not reachable under the user's
 * own RLS context.
 *
 * Compliance note: `audit_events` rows are *anonymized* (user_id → null,
 * metadata replaced with an anonymization marker) rather than deleted, so
 * the immutable who-did-what audit history remains intact for legal hold.
 *
 * @see docs/GDPR.md
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { z } from 'zod';
import { setApiCorsHeaders } from '../lib/httpProduction';
import { apiLogger } from '../lib/logger';
import {
  checkRateLimit,
  clientKeyFromRequest,
  rateLimitDisabled,
} from '../lib/rateLimit';

/** Body confirmation phrase. Defined exactly once in this file. */
const CONFIRMATION_PHRASE = 'DELETE MY ACCOUNT';

const ALLOWED_METHODS = 'POST, OPTIONS';
const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_WINDOW_MS = 60_000;
const STRIPE_API_VERSION = '2026-06-24.dahlia' as const;

const bodySchema = z.object({
  confirm: z.literal(CONFIRMATION_PHRASE),
});

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

function supabaseServiceRoleKeyFromEnv(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

function newRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Stripe SDK throws `StripeInvalidRequestError` with `statusCode === 404`
 * and `code === 'resource_missing'` when the customer is already gone.
 * Treat that as a no-op rather than failing the entire erasure pipeline.
 */
function isStripeAlreadyDeleted(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { statusCode?: number; code?: string };
  return e.statusCode === 404 || e.code === 'resource_missing';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const requestId = newRequestId();

  setApiCorsHeaders(res, { allowMethods: ALLOWED_METHODS });

  if (req.method === 'OPTIONS') {
    const r = res.status(204);
    r.end?.();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ALLOWED_METHODS);
    return res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      requestId,
      message: 'Method Not Allowed',
    });
  }

  if (!rateLimitDisabled()) {
    const key = `me-delete:${clientKeyFromRequest(req)}`;
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
  const serviceKey = supabaseServiceRoleKeyFromEnv();
  if (!url || !anon || !serviceKey) {
    apiLogger.error('me-delete: Supabase env not configured', { requestId });
    return res.status(503).json({
      code: 'CONFIG',
      requestId,
      message: 'account deletion is not configured on this deployment',
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

  let userId: string;
  try {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userResult, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr || !userResult?.user?.id) {
      return res.status(401).json({
        code: 'AUTH_INVALID',
        requestId,
        message: 'invalid or expired session',
      });
    }
    userId = userResult.user.id;
  } catch (err) {
    apiLogger.warn('me-delete: getUser threw', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(401).json({
      code: 'AUTH_INVALID',
      requestId,
      message: 'invalid or expired session',
    });
  }

  const parsed = bodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      code: 'CONFIRMATION_REQUIRED',
      requestId,
      message: `confirmation required: POST { "confirm": "${CONFIRMATION_PHRASE}" }`,
    });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  apiLogger.info('me-delete: starting account erasure', { requestId, userId });

  let hadStripeCustomer = false;
  let stripeCustomerId: string | null = null;
  try {
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();
    if (profileErr) {
      apiLogger.warn('me-delete: profile lookup failed (continuing)', {
        requestId,
        message: profileErr.message,
      });
    }
    const raw = profile?.stripe_customer_id;
    if (typeof raw === 'string' && raw.length > 0) {
      stripeCustomerId = raw;
      hadStripeCustomer = true;
    }
  } catch (err) {
    apiLogger.warn('me-delete: profile lookup threw (continuing)', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  if (stripeCustomerId) {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeKey) {
      apiLogger.error('me-delete: STRIPE_SECRET_KEY missing; refusing to leave billing live', {
        requestId,
      });
      return res.status(503).json({
        code: 'STRIPE_NOT_CONFIGURED',
        requestId,
        message: 'cannot erase account without Stripe configured; contact support',
      });
    }
    try {
      const stripe = new Stripe(stripeKey, { apiVersion: STRIPE_API_VERSION });
      const result = await stripe.customers.del(stripeCustomerId);
      apiLogger.info('me-delete: Stripe customer deleted', {
        requestId,
        stripeCustomerId,
        deleted: (result as { deleted?: boolean } | null)?.deleted ?? true,
      });
    } catch (err) {
      if (isStripeAlreadyDeleted(err)) {
        apiLogger.warn('me-delete: Stripe customer already deleted; continuing', {
          requestId,
          stripeCustomerId,
        });
      } else {
        apiLogger.error('me-delete: Stripe customer deletion failed', err);
        return res.status(502).json({
          code: 'STRIPE_DELETE_FAILED',
          requestId,
          message: 'failed to cancel Stripe customer; account NOT deleted',
        });
      }
    }
  }

  // Post-Stripe: any failure below is unrecoverable. The user's Stripe-side
  // data may already be gone, so we cannot roll back. Report PARTIAL instead.
  try {
    const { error: cardsErr } = await admin.from('cards').delete().eq('user_id', userId);
    if (cardsErr) throw new Error(`cards.delete: ${cardsErr.message}`);

    const { error: targetsErr } = await admin.from('targets').delete().eq('user_id', userId);
    if (targetsErr) throw new Error(`targets.delete: ${targetsErr.message}`);

    const { error: userDataErr } = await admin
      .from('user_data')
      .delete()
      .eq('user_id', userId);
    if (userDataErr) throw new Error(`user_data.delete: ${userDataErr.message}`);

    const { data: anonymizedRows, error: anonErr } = await admin
      .from('audit_events')
      .update({
        user_id: null,
        metadata: {
          anonymized: true,
          anonymizedAt: new Date().toISOString(),
        },
      })
      .eq('user_id', userId)
      .select('id');
    if (anonErr) throw new Error(`audit_events.update: ${anonErr.message}`);
    const anonymizedAuditRows = Array.isArray(anonymizedRows) ? anonymizedRows.length : 0;

    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) throw new Error(`auth.deleteUser: ${authErr.message}`);

    // Final anonymized audit row — best-effort; do not flip the response to
    // PARTIAL if the bookkeeping insert fails after the user is already gone.
    try {
      const { error: finalAuditErr } = await admin.from('audit_events').insert({
        user_id: null,
        category: 'auth',
        action: 'account.deleted',
        metadata: {
          anonymizedAuditRows,
          hadStripeCustomer,
          requestId,
        },
      });
      if (finalAuditErr) {
        apiLogger.warn('me-delete: final audit insert failed (non-fatal)', {
          requestId,
          message: finalAuditErr.message,
        });
      }
    } catch (auditErr) {
      apiLogger.warn('me-delete: final audit insert threw (non-fatal)', {
        requestId,
        error: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }

    const deletedAt = new Date().toISOString();
    apiLogger.info('me-delete: account erased', {
      requestId,
      anonymizedAuditRows,
      hadStripeCustomer,
    });

    return res.status(200).json({ ok: true, deletedAt, requestId });
  } catch (err) {
    apiLogger.error('me-delete: deletion pipeline failed after Stripe step', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({
      code: 'PARTIAL',
      requestId,
      message: 'partial deletion; contact support',
    });
  }
}

export const config = { runtime: 'nodejs' };
