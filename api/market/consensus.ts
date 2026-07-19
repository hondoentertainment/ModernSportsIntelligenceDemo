/**
 * POST /api/market/consensus — consensus FMV ledger for a card inventory payload.
 * Auth: same Bearer JWT gate as other protected market routes.
 * Body: { cards: CardInventory[] } (subset fields accepted).
 */
import { z } from 'zod';
import { setApiCorsHeaders, respondInternalError } from '../lib/httpProduction.js';
import { apiLogger } from '../lib/logger.js';
import {
  checkRateLimit,
  clientKeyFromRequest,
  rateLimitDisabled,
} from '../lib/rateLimit.js';
import { verifyServerApiAuth } from '../lib/verifyServerApiAuth.js';
import { buildConsensusLedger } from '../lib/consensusMarketLedger.js';

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

const cardSchema = z.object({
  id: z.string().min(1),
  player: z.string().min(1),
  currentValue: z.number().nonnegative().optional(),
  valuationSource: z.enum(['ebay-api', 'historical-comps', 'gemini', 'fallback']).optional(),
  valuationTimestamp: z.string().optional(),
  lastValuationDate: z.string().optional(),
  valuationConfidence: z.number().min(0).max(1).optional(),
});

const bodySchema = z.object({
  cards: z.array(cardSchema).max(500),
});

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
    const key = `market-consensus:${clientKeyFromRequest(req)}`;
    const rl = checkRateLimit(key, 60, 60_000);
    if (rl.limited) {
      res.setHeader('Retry-After', String(rl.retryAfterSec));
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfterSec: rl.retryAfterSec,
      });
    }
  }

  const allowed = await verifyServerApiAuth(req);
  if (!allowed) {
    return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }

  const parsed = bodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid body',
      code: 'VALIDATION',
      details: parsed.error.flatten(),
    });
  }

  try {
    const ledger = buildConsensusLedger(parsed.data.cards);
    return res.status(200).json({ ok: true, ledger });
  } catch (err) {
    apiLogger.error('market-consensus failed', err);
    return respondInternalError(res, err, 'market-consensus', 'CONSENSUS_FAILED');
  }
}

export const config = { runtime: 'nodejs' };
