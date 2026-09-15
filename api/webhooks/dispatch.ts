/**
 * Product webhook dispatcher scaffold.
 * Env-gated no-op: even when MSI_WEBHOOK_DISPATCH=1, no partner URL is called.
 */
import { setApiCorsHeaders } from '../lib/httpProduction.js';
import { checkRateLimit, clientKeyFromRequest, rateLimitDisabled } from '../lib/rateLimit.js';
import {
  WEBHOOK_DISPATCH_DISCLOSURE,
  evaluateWebhookDispatch,
} from '../../lib/platform/webhookEvents.js';

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiCorsHeaders(res, { allowMethods: 'POST, OPTIONS' });

  if (req.method === 'OPTIONS') {
    const r = res.status(204);
    r.end?.();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  if (!rateLimitDisabled()) {
    const key = `webhook-dispatch:${clientKeyFromRequest(req)}`;
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

  const result = evaluateWebhookDispatch(req.body ?? {});
  return res.status(result.accepted ? 202 : 400).json({
    ...result,
    disclosure: WEBHOOK_DISPATCH_DISCLOSURE,
  });
}
