import { describe, it, expect, vi, beforeEach } from 'vitest';

const { warn, error } = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../../api/lib/logger', () => ({
  apiLogger: { warn, error, info: vi.fn() },
}));

vi.mock('../../api/lib/httpProduction', () => ({
  setApiCorsHeaders: vi.fn(),
}));

import handler from '../../api/client-error';

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
        end: () => {
          this.body = '';
          return undefined;
        },
        json: (o: object) => {
          this.body = o;
          return undefined;
        },
      };
    },
    headers,
  };
}

beforeEach(() => {
  warn.mockClear();
  error.mockClear();
});

describe('client-error handler', () => {
  it('rejects non-POST with 405', async () => {
    const res = makeRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
    expect(res.headers['Allow']).toBe('POST, OPTIONS');
  });

  it('accepts OPTIONS with 204', async () => {
    const res = makeRes();
    await handler({ method: 'OPTIONS' }, res);
    expect(res.statusCode).toBe(204);
    expect(warn).not.toHaveBeenCalled();
  });

  it('logs a valid beacon and returns 204', async () => {
    const res = makeRes();
    await handler(
      {
        method: 'POST',
        headers: { 'user-agent': 'vitest' },
        body: {
          message: 'sentry smoke test',
          name: 'Error',
          stack: 'Error: sentry smoke test\n    at foo',
          route: '/dashboard',
          url: 'https://app.example.com/dashboard',
        },
      },
      res,
    );
    expect(res.statusCode).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    const [msg, meta] = warn.mock.calls[0]!;
    expect(msg).toBe('Client error beacon');
    expect(meta).toMatchObject({
      message: 'sentry smoke test',
      name: 'Error',
      route: '/dashboard',
      userAgent: 'vitest',
    });
  });

  it('returns 204 without logging when message is missing', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { stack: 'x' } }, res);
    expect(res.statusCode).toBe(204);
    expect(warn).not.toHaveBeenCalled();
  });
});
