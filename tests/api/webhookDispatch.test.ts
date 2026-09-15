import { describe, expect, it, vi } from 'vitest';

vi.mock('../../api/lib/httpProduction', () => ({
  setApiCorsHeaders: vi.fn(),
}));

vi.mock('../../api/lib/rateLimit', () => ({
  checkRateLimit: () => ({ limited: false }),
  clientKeyFromRequest: () => 'test',
  rateLimitDisabled: () => true,
}));

import handler from '../../api/webhooks/dispatch';

function makeRes() {
  return {
    statusCode: 0,
    body: undefined as unknown,
    setHeader() {},
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
  };
}

describe('POST /api/webhooks/dispatch', () => {
  it('accepts documented events as a no-op and rejects unknown types', async () => {
    const ok = makeRes();
    await handler({ method: 'POST', body: { type: 'valuation.updated', payload: { cardId: 'c1' } } }, ok);
    expect(ok.statusCode).toBe(202);
    expect((ok.body as { dispatched?: boolean }).dispatched).toBe(false);

    const bad = makeRes();
    await handler({ method: 'POST', body: { type: 'not.real' } }, bad);
    expect(bad.statusCode).toBe(400);

    const method = makeRes();
    await handler({ method: 'GET' }, method);
    expect(method.statusCode).toBe(405);
  });
});
