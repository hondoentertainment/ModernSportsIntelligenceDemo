import { describe, it, expect, vi, beforeEach } from 'vitest';

const { verifyServerApiAuth } = vi.hoisted(() => ({
  verifyServerApiAuth: vi.fn(),
}));

vi.mock('../../api/lib/verifyServerApiAuth', () => ({
  verifyServerApiAuth,
}));

vi.mock('../../api/lib/httpProduction', () => ({
  setApiCorsHeaders: vi.fn(),
  respondInternalError: vi.fn((_res, _err, _log, code) => {
    _res.status(500).json({ code });
  }),
}));

vi.mock('../../api/lib/logger', () => ({
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../api/lib/rateLimit', () => ({
  checkRateLimit: () => ({ limited: false }),
  clientKeyFromRequest: () => 'test',
  rateLimitDisabled: () => true,
}));

import handler from '../../api/market/consensus';

function makeRes() {
  const headers: Record<string, string> = {};
  return {
    statusCode: 0,
    body: undefined as unknown,
    setHeader(k: string, v: string) {
      headers[k] = v;
    },
    status(n: number) {
      this.statusCode = n;
      return {
        json: (o: object) => {
          this.body = o;
          return undefined;
        },
        end: () => undefined,
      };
    },
    headers,
  };
}

beforeEach(() => {
  verifyServerApiAuth.mockReset();
  verifyServerApiAuth.mockResolvedValue(true);
  process.env.RATE_LIMIT_DISABLED = '1';
});

describe('POST /api/market/consensus', () => {
  it('rejects unauthenticated callers', async () => {
    verifyServerApiAuth.mockResolvedValueOnce(false);
    const res = makeRes();
    await handler({ method: 'POST', body: { cards: [] } }, res);
    expect(res.statusCode).toBe(401);
  });

  it('returns a ledger for priced cards', async () => {
    const res = makeRes();
    await handler(
      {
        method: 'POST',
        body: {
          cards: [
            {
              id: '1',
              player: 'Mahomes',
              currentValue: 1000,
              valuationSource: 'ebay-api',
              valuationTimestamp: new Date().toISOString(),
            },
          ],
        },
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as { ok: boolean; ledger: { quotedCount: number; totalFmv: number } };
    expect(body.ok).toBe(true);
    expect(body.ledger.quotedCount).toBe(1);
    expect(body.ledger.totalFmv).toBe(1000);
  });
});
