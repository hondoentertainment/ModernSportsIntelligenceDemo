/**
 * Server Web Push scaffold.
 * GET  — VAPID readiness (never returns the private key).
 * POST — accept a browser Push subscription when VAPID is configured.
 * DELETE — acknowledge local unsubscribe.
 *
 * Refuses loudly (503 VAPID_UNSET) when keys are missing. Never invents secrets.
 */
import { z } from 'zod';
import { setApiCorsHeaders } from '../lib/httpProduction.js';
import { checkRateLimit, clientKeyFromRequest, rateLimitDisabled } from '../lib/rateLimit.js';
import {
  WEB_PUSH_VAPID_UNSET_CODE,
  WEB_PUSH_VAPID_UNSET_ERROR,
  readVapidEnv,
  vapidPublicStatusPayload,
} from '../../lib/push/vapidEnv.js';

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

export const PushSubscriptionSchema = z
  .object({
    endpoint: z.string().url(),
    expirationTime: z.number().nullable().optional(),
    keys: z
      .object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
      })
      .strict(),
  })
  .strict();

function refuseVapid(res: ApiResponse) {
  return res.status(503).json({
    error: WEB_PUSH_VAPID_UNSET_ERROR,
    code: WEB_PUSH_VAPID_UNSET_CODE,
    configured: false,
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiCorsHeaders(res, { allowMethods: 'GET, POST, DELETE, OPTIONS' });

  if (req.method === 'OPTIONS') {
    const r = res.status(204);
    r.end?.();
    return;
  }

  if (!rateLimitDisabled()) {
    const key = `web-push:${clientKeyFromRequest(req)}`;
    const rl = checkRateLimit(key, 30, 60_000);
    if (rl.limited) {
      res.setHeader('Retry-After', String(rl.retryAfterSec));
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfterSec: rl.retryAfterSec,
      });
    }
  }

  const vapid = readVapidEnv();

  if (req.method === 'GET') {
    const status = vapidPublicStatusPayload(vapid);
    return res.status(vapid.configured ? 200 : 503).json(status);
  }

  if (req.method === 'DELETE') {
    if (!vapid.configured) return refuseVapid(res);
    return res.status(200).json({
      ok: true,
      configured: true,
      unsubscribed: true,
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  if (!vapid.configured) return refuseVapid(res);

  const parsed = PushSubscriptionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid push subscription',
      code: 'VALIDATION',
    });
  }

  return res.status(200).json({
    ok: true,
    configured: true,
    endpointStored: true,
    endpoint: parsed.data.endpoint,
    publicKey: vapid.publicKey,
  });
}
