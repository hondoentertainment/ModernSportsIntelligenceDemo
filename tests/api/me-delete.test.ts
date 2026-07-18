import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Unit tests for the GDPR Article 17 erasure handler.
 *
 * Mock strategy:
 * - `@supabase/supabase-js` → a single `createClient` mock that routes by key:
 *   the anon key returns a stub exposing `auth.getUser`, the service-role key
 *   returns a stub exposing `from(...)` chains plus `auth.admin.deleteUser`.
 *   This mirrors how the handler actually constructs the two clients and lets
 *   us assert call ordering across both.
 * - `stripe` → a `default` constructor mock whose instance has
 *   `customers.del` so we can assert it was (or was not) invoked, and in what
 *   relative order against the Supabase calls via `mock.invocationCallOrder`.
 * - `../../api/lib/logger` → silenced so test output stays clean.
 */

const stripeCustomersDel = vi.fn();
// `new Stripe(...)` requires a constructable callable, so use a `function`
// expression here instead of an arrow. Vitest warns otherwise and the
// returned object ends up `undefined` for `new`-call sites.
const StripeCtor = vi.fn(function StripeCtorImpl(this: unknown) {
  return { customers: { del: stripeCustomersDel } };
});

const supabaseGetUser = vi.fn();
const profileMaybeSingle = vi.fn();
const cardsDeleteEq = vi.fn();
const targetsDeleteEq = vi.fn();
const userDataDeleteEq = vi.fn();
const priceHistoryDeleteEq = vi.fn();
const marketEventsDeleteEq = vi.fn();
const profilesDeleteEq = vi.fn();
const auditEventsUpdateSelect = vi.fn();
const auditEventsInsert = vi.fn();
const authAdminDeleteUser = vi.fn();

const anonClient = {
  auth: { getUser: supabaseGetUser },
};

const adminClient = {
  auth: { admin: { deleteUser: authAdminDeleteUser } },
  from: vi.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: profileMaybeSingle }),
        }),
        delete: () => ({ eq: profilesDeleteEq }),
      };
    }
    if (table === 'cards') {
      return { delete: () => ({ eq: cardsDeleteEq }) };
    }
    if (table === 'targets') {
      return { delete: () => ({ eq: targetsDeleteEq }) };
    }
    if (table === 'user_data') {
      return { delete: () => ({ eq: userDataDeleteEq }) };
    }
    if (table === 'price_history') {
      return { delete: () => ({ eq: priceHistoryDeleteEq }) };
    }
    if (table === 'market_events') {
      return { delete: () => ({ eq: marketEventsDeleteEq }) };
    }
    if (table === 'audit_events') {
      return {
        update: () => ({
          eq: () => ({ select: auditEventsUpdateSelect }),
        }),
        insert: auditEventsInsert,
      };
    }
    throw new Error(`unexpected table in mock router: ${table}`);
  }),
};

const createClientMock = vi.fn((_url: string, key: string) => {
  if (key === 'service-role-test-key') return adminClient;
  return anonClient;
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) =>
    createClientMock(...(args as Parameters<typeof createClientMock>)),
}));

vi.mock('stripe', () => ({
  default: StripeCtor,
}));

vi.mock('../../api/lib/logger', () => ({
  apiLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

type MockReqOverrides = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

function mockReq(overrides: MockReqOverrides = {}) {
  return {
    method: overrides.method ?? 'POST',
    headers:
      overrides.headers ??
      ({ authorization: 'Bearer valid-jwt' } as Record<
        string,
        string | string[] | undefined
      >),
    body: overrides.body ?? { confirm: 'DELETE MY ACCOUNT' },
    socket: { remoteAddress: '203.0.113.42' },
  };
}

function mockRes() {
  const result = {
    status: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    ended: false,
  };
  return {
    result,
    setHeader: (name: string, value: string) => {
      result.headers[name] = value;
    },
    status: (code: number) => {
      result.status = code;
      return {
        json: (body: object) => {
          result.body = body;
          return body;
        },
        end: () => {
          result.ended = true;
        },
      };
    },
  };
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();

  process.env = { ...ORIGINAL_ENV };
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'anon-test-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.STRIPE_SECRET_KEY = 'sk_test_stripe';
  process.env.RATE_LIMIT_DISABLED = '1';
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.VITE_SUPABASE_ANON_KEY;

  createClientMock.mockImplementation((_url: string, key: string) => {
    if (key === 'service-role-test-key') return adminClient;
    return anonClient;
  });
  StripeCtor.mockImplementation(function StripeCtorReset(this: unknown) {
    return { customers: { del: stripeCustomersDel } };
  });

  supabaseGetUser.mockResolvedValue({
    data: { user: { id: 'user-abc-123' } },
    error: null,
  });

  profileMaybeSingle.mockResolvedValue({
    data: { stripe_customer_id: null },
    error: null,
  });

  cardsDeleteEq.mockResolvedValue({ data: null, error: null });
  targetsDeleteEq.mockResolvedValue({ data: null, error: null });
  userDataDeleteEq.mockResolvedValue({ data: null, error: null });
  priceHistoryDeleteEq.mockResolvedValue({ data: null, error: null });
  marketEventsDeleteEq.mockResolvedValue({ data: null, error: null });
  profilesDeleteEq.mockResolvedValue({ data: null, error: null });
  auditEventsUpdateSelect.mockResolvedValue({
    data: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
    error: null,
  });
  auditEventsInsert.mockResolvedValue({ data: null, error: null });
  authAdminDeleteUser.mockResolvedValue({ data: { user: null }, error: null });
  stripeCustomersDel.mockResolvedValue({ id: 'cus_test', deleted: true });
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function loadHandler() {
  vi.resetModules();
  const mod = await import('../../api/me/delete');
  return mod.default;
}

describe('POST /api/me/delete', () => {
  it('rejects non-POST methods with 405', async () => {
    const handler = await loadHandler();
    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(405);
    expect(res.result.headers.Allow).toMatch(/POST/);
    expect(res.result.body).toMatchObject({ code: 'METHOD_NOT_ALLOWED' });
    expect(supabaseGetUser).not.toHaveBeenCalled();
    expect(authAdminDeleteUser).not.toHaveBeenCalled();
    expect(stripeCustomersDel).not.toHaveBeenCalled();
  });

  it('rejects missing Authorization header with 401', async () => {
    const handler = await loadHandler();
    const req = mockReq({ headers: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(401);
    expect(res.result.body).toMatchObject({ code: 'AUTH_REQUIRED' });
    expect(supabaseGetUser).not.toHaveBeenCalled();
    expect(authAdminDeleteUser).not.toHaveBeenCalled();
  });

  it('rejects an invalid JWT with 401', async () => {
    supabaseGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'invalid jwt' },
    });
    const handler = await loadHandler();
    const req = mockReq({ headers: { authorization: 'Bearer bad-token' } });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(401);
    expect(res.result.body).toMatchObject({ code: 'AUTH_INVALID' });
    expect(supabaseGetUser).toHaveBeenCalledWith('bad-token');
    expect(authAdminDeleteUser).not.toHaveBeenCalled();
  });

  it('rejects a wrong confirmation phrase with 400', async () => {
    const handler = await loadHandler();
    // Lower-cased phrase must not satisfy the literal seatbelt.
    const req = mockReq({ body: { confirm: 'delete my account' } });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(400);
    expect(res.result.body).toMatchObject({ code: 'CONFIRMATION_REQUIRED' });
    // Auth ran (so we know who's asking) but the destructive path never did.
    expect(supabaseGetUser).toHaveBeenCalledTimes(1);
    expect(authAdminDeleteUser).not.toHaveBeenCalled();
    expect(stripeCustomersDel).not.toHaveBeenCalled();
    expect(cardsDeleteEq).not.toHaveBeenCalled();
  });

  it('also rejects when confirm is missing entirely with 400', async () => {
    const handler = await loadHandler();
    const req = mockReq({ body: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(400);
    expect(res.result.body).toMatchObject({ code: 'CONFIRMATION_REQUIRED' });
    expect(authAdminDeleteUser).not.toHaveBeenCalled();
  });

  it('happy path with no Stripe customer: deletes all tables in order and returns 200', async () => {
    profileMaybeSingle.mockResolvedValueOnce({
      data: { stripe_customer_id: null },
      error: null,
    });

    const handler = await loadHandler();
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(200);
    const body = res.result.body as { ok: boolean; deletedAt: string; requestId: string };
    expect(body.ok).toBe(true);
    expect(typeof body.requestId).toBe('string');
    expect(body.requestId.length).toBeGreaterThan(0);
    expect(typeof body.deletedAt).toBe('string');
    expect(Number.isNaN(Date.parse(body.deletedAt))).toBe(false);

    // No Stripe customer → Stripe client should never be touched.
    expect(StripeCtor).not.toHaveBeenCalled();
    expect(stripeCustomersDel).not.toHaveBeenCalled();

    // Each DB step ran exactly once with the correct user id.
    expect(profileMaybeSingle).toHaveBeenCalledTimes(1);
    expect(cardsDeleteEq).toHaveBeenCalledTimes(1);
    expect(cardsDeleteEq).toHaveBeenCalledWith('user_id', 'user-abc-123');
    expect(targetsDeleteEq).toHaveBeenCalledTimes(1);
    expect(targetsDeleteEq).toHaveBeenCalledWith('user_id', 'user-abc-123');
    expect(userDataDeleteEq).toHaveBeenCalledTimes(1);
    expect(userDataDeleteEq).toHaveBeenCalledWith('user_id', 'user-abc-123');
    expect(priceHistoryDeleteEq).toHaveBeenCalledWith('user_id', 'user-abc-123');
    expect(marketEventsDeleteEq).toHaveBeenCalledWith('user_id', 'user-abc-123');
    expect(profilesDeleteEq).toHaveBeenCalledWith('id', 'user-abc-123');
    expect(auditEventsUpdateSelect).toHaveBeenCalledTimes(1);
    expect(auditEventsInsert).toHaveBeenCalledTimes(1);
    expect(authAdminDeleteUser).toHaveBeenCalledTimes(1);
    expect(authAdminDeleteUser).toHaveBeenCalledWith('user-abc-123');

    // Cascade order: cards → targets → user_data → price/market → anonymize
    // audit_events → profiles → auth.admin.deleteUser → final audit insert.
    const order = [
      cardsDeleteEq.mock.invocationCallOrder[0]!,
      targetsDeleteEq.mock.invocationCallOrder[0]!,
      userDataDeleteEq.mock.invocationCallOrder[0]!,
      priceHistoryDeleteEq.mock.invocationCallOrder[0]!,
      marketEventsDeleteEq.mock.invocationCallOrder[0]!,
      auditEventsUpdateSelect.mock.invocationCallOrder[0]!,
      profilesDeleteEq.mock.invocationCallOrder[0]!,
      authAdminDeleteUser.mock.invocationCallOrder[0]!,
      auditEventsInsert.mock.invocationCallOrder[0]!,
    ];
    const sorted = [...order].sort((a, b) => a - b);
    expect(order).toEqual(sorted);

    // The final audit row carries the legal-hold metadata, with user_id stripped.
    const insertArg = auditEventsInsert.mock.calls[0]?.[0] as {
      user_id: unknown;
      category: string;
      action: string;
      metadata: { anonymizedAuditRows: number; hadStripeCustomer: boolean };
    };
    expect(insertArg.user_id).toBeNull();
    expect(insertArg.category).toBe('auth');
    expect(insertArg.action).toBe('account.deleted');
    expect(insertArg.metadata.anonymizedAuditRows).toBe(3);
    expect(insertArg.metadata.hadStripeCustomer).toBe(false);
  });

  it('happy path WITH Stripe customer: deletes Stripe customer BEFORE DB deletions', async () => {
    profileMaybeSingle.mockResolvedValueOnce({
      data: { stripe_customer_id: 'cus_test_123' },
      error: null,
    });

    const handler = await loadHandler();
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(200);
    const body = res.result.body as { ok: boolean; deletedAt: string; requestId: string };
    expect(body.ok).toBe(true);
    expect(typeof body.deletedAt).toBe('string');

    expect(StripeCtor).toHaveBeenCalledTimes(1);
    expect(stripeCustomersDel).toHaveBeenCalledTimes(1);
    expect(stripeCustomersDel).toHaveBeenCalledWith('cus_test_123');

    // Stripe must run before any user-table delete.
    const stripeOrder = stripeCustomersDel.mock.invocationCallOrder[0]!;
    expect(stripeOrder).toBeLessThan(cardsDeleteEq.mock.invocationCallOrder[0]!);
    expect(stripeOrder).toBeLessThan(targetsDeleteEq.mock.invocationCallOrder[0]!);
    expect(stripeOrder).toBeLessThan(userDataDeleteEq.mock.invocationCallOrder[0]!);
    expect(stripeOrder).toBeLessThan(auditEventsUpdateSelect.mock.invocationCallOrder[0]!);
    expect(stripeOrder).toBeLessThan(authAdminDeleteUser.mock.invocationCallOrder[0]!);

    expect(authAdminDeleteUser).toHaveBeenCalledWith('user-abc-123');

    const insertArg = auditEventsInsert.mock.calls[0]?.[0] as {
      metadata: { hadStripeCustomer: boolean };
    };
    expect(insertArg.metadata.hadStripeCustomer).toBe(true);
  });

  it('Stripe 404 (already deleted): pipeline continues and returns 200', async () => {
    profileMaybeSingle.mockResolvedValueOnce({
      data: { stripe_customer_id: 'cus_ghost' },
      error: null,
    });
    stripeCustomersDel.mockRejectedValueOnce(
      Object.assign(new Error('No such customer: cus_ghost'), {
        statusCode: 404,
        code: 'resource_missing',
      }),
    );

    const handler = await loadHandler();
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(200);
    expect(stripeCustomersDel).toHaveBeenCalledWith('cus_ghost');
    // Even though Stripe 404'd, the DB cascade still runs.
    expect(cardsDeleteEq).toHaveBeenCalledTimes(1);
    expect(targetsDeleteEq).toHaveBeenCalledTimes(1);
    expect(userDataDeleteEq).toHaveBeenCalledTimes(1);
    expect(auditEventsUpdateSelect).toHaveBeenCalledTimes(1);
    expect(authAdminDeleteUser).toHaveBeenCalledTimes(1);

    const body = res.result.body as { ok: boolean; requestId: string };
    expect(body.ok).toBe(true);
    expect(typeof body.requestId).toBe('string');
  });
});
