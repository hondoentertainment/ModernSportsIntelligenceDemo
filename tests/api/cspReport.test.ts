import { describe, it, expect, vi, beforeEach } from 'vitest';

const { warn, error } = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../../api/lib/logger', () => ({
  apiLogger: { warn, error, info: vi.fn() },
}));

import handler from '../../api/csp-report';

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

describe('csp-report handler', () => {
  it('rejects non-POST with 405', async () => {
    const res = makeRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
    expect(res.headers['Allow']).toBe('POST');
  });

  it('logs a legacy `csp-report` body and returns 204', async () => {
    const res = makeRes();
    await handler(
      {
        method: 'POST',
        headers: { 'user-agent': 'jsdom' },
        body: {
          'csp-report': {
            'document-uri': 'https://app.example.com/dashboard',
            'effective-directive': 'script-src',
            'blocked-uri': 'https://evil.example.com/x.js',
          },
        },
      },
      res,
    );
    expect(res.statusCode).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    const [msg, meta] = warn.mock.calls[0]!;
    expect(msg).toBe('CSP violation');
    expect(meta).toMatchObject({
      directive: 'script-src',
      blockedUri: 'https://evil.example.com/x.js',
      documentUri: 'https://app.example.com/dashboard',
      userAgent: 'jsdom',
    });
  });

  it('logs Reporting API array entries (csp-violation type)', async () => {
    const res = makeRes();
    await handler(
      {
        method: 'POST',
        headers: { 'user-agent': 'chrome' },
        body: [
          {
            type: 'csp-violation',
            user_agent: 'chrome',
            body: {
              'effective-directive': 'connect-src',
              'blocked-uri': 'https://api.evil.com',
            },
          },
          { type: 'deprecation', body: { id: 'foo' } },
        ],
      },
      res,
    );
    expect(res.statusCode).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![1]).toMatchObject({ directive: 'connect-src' });
  });

  it('does not throw on malformed bodies and still 204s', async () => {
    const res = makeRes();
    await handler({ method: 'POST', headers: {}, body: null }, res);
    expect(res.statusCode).toBe(204);
    // No warn call expected for null body (no parseable report).
    expect(warn).not.toHaveBeenCalled();
  });
});
