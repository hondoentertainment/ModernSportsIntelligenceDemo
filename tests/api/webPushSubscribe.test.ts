import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/lib/httpProduction', () => ({
  setApiCorsHeaders: vi.fn(),
}));

vi.mock('../../api/lib/rateLimit', () => ({
  checkRateLimit: () => ({ limited: false }),
  clientKeyFromRequest: () => 'test',
  rateLimitDisabled: () => true,
}));

import handler from '../../api/push/subscribe';

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

describe('GET/POST /api/push/subscribe', () => {
  beforeEach(() => {
    delete process.env.WEB_PUSH_VAPID_PUBLIC;
    delete process.env.WEB_PUSH_VAPID_PRIVATE;
    process.env.RATE_LIMIT_DISABLED = '1';
  });

  it('refuses GET and POST when VAPID env is unset', async () => {
    const getRes = makeRes();
    await handler({ method: 'GET' }, getRes);
    expect(getRes.statusCode).toBe(503);
    expect((getRes.body as { code?: string }).code).toBe('VAPID_UNSET');

    const postRes = makeRes();
    await handler({ method: 'POST', body: { endpoint: 'https://push.example/a', keys: { p256dh: 'a', auth: 'b' } } }, postRes);
    expect(postRes.statusCode).toBe(503);
  });

  it('accepts a subscription only when both VAPID keys are present', async () => {
    process.env.WEB_PUSH_VAPID_PUBLIC = 'owner-public';
    process.env.WEB_PUSH_VAPID_PRIVATE = 'owner-private';
    const ready = makeRes();
    await handler({ method: 'GET' }, ready);
    expect(ready.statusCode).toBe(200);
    expect((ready.body as { configured?: boolean }).configured).toBe(true);
    expect(JSON.stringify(ready.body)).not.toMatch(/owner-private/);

    const invalid = makeRes();
    await handler({ method: 'POST', body: { endpoint: 'not-a-url' } }, invalid);
    expect(invalid.statusCode).toBe(400);

    const ok = makeRes();
    await handler(
      { method: 'POST', body: { endpoint: 'https://push.example/a', keys: { p256dh: 'pk', auth: 'ak' } } },
      ok,
    );
    expect(ok.statusCode).toBe(200);
    expect((ok.body as { accepted?: boolean; persisted?: boolean; endpointStored?: boolean }).accepted).toBe(true);
    expect((ok.body as { persisted?: boolean }).persisted).toBe(false);
    expect((ok.body as { endpointStored?: boolean }).endpointStored).toBe(false);

    const del = makeRes();
    await handler({ method: 'DELETE' }, del);
    expect(del.statusCode).toBe(200);

    const method = makeRes();
    await handler({ method: 'PUT' }, method);
    expect(method.statusCode).toBe(405);
  });
});
