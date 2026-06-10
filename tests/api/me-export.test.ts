import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Unit tests for the GDPR Article 20 export handler.
 *
 * The handler imports `createClient` from `@supabase/supabase-js`; we mock that
 * module so each test can shape both `auth.getUser` and table-query behaviour.
 */

const getUserMock = vi.fn();
const fromMock = vi.fn();
const createClientMock = vi.fn(() => ({
  auth: { getUser: getUserMock },
  from: fromMock,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock('../../api/lib/logger', () => ({
  apiLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

type QueryResponse = { data: unknown; error: unknown };

/** Build a thenable Supabase query mock whose chain methods all return itself. */
function makeQuery(response: QueryResponse) {
  const q: Record<string, unknown> = {};
  const passthrough = () => q;
  q.select = vi.fn(passthrough);
  q.eq = vi.fn(passthrough);
  q.order = vi.fn(passthrough);
  q.limit = vi.fn(passthrough);
  q.insert = vi.fn(() => Promise.resolve(response));
  q.then = (onFulfilled: (v: QueryResponse) => unknown) =>
    Promise.resolve(response).then(onFulfilled);
  return q;
}

function defaultQueryRouter(overrides: Partial<Record<string, QueryResponse>> = {}) {
  const responses: Record<string, QueryResponse> = {
    cards: { data: [{ id: 'c1', user_id: 'u-1' }], error: null },
    targets: { data: [{ id: 't1', user_id: 'u-1' }], error: null },
    audit_events: {
      data: [{ id: 'a1', user_id: 'u-1', action: 'login' }],
      error: null,
    },
    user_data: {
      data: [{ user_id: 'u-1', key: 'prefs', value: { theme: 'dark' } }],
      error: null,
    },
    ...overrides,
  };
  return (table: string) => makeQuery(responses[table] ?? { data: [], error: null });
}

function mockReq(overrides: {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
} = {}) {
  return {
    method: overrides.method ?? 'GET',
    headers: overrides.headers ?? { authorization: 'Bearer test-jwt' },
    socket: { remoteAddress: '203.0.113.7' },
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
  process.env.RATE_LIMIT_DISABLED = '1';
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.VITE_SUPABASE_ANON_KEY;

  // Default success behaviour; individual tests override as needed.
  getUserMock.mockResolvedValue({
    data: { user: { id: 'u-1', email: 'user@example.com' } },
    error: null,
  });
  fromMock.mockImplementation(defaultQueryRouter());
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function loadHandler() {
  vi.resetModules();
  const mod = await import('../../api/me/export');
  return mod.default;
}

describe('GET /api/me/export', () => {
  it('rejects non-GET methods with 405', async () => {
    const handler = await loadHandler();
    const req = mockReq({ method: 'POST' });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(405);
    expect(res.result.headers.Allow).toMatch(/GET/);
    expect(res.result.body).toMatchObject({ code: 'METHOD_NOT_ALLOWED' });
  });

  it('rejects requests with no Authorization header with 401', async () => {
    const handler = await loadHandler();
    const req = mockReq({ headers: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(401);
    expect(res.result.body).toMatchObject({ code: 'AUTH_REQUIRED' });
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid JWT with 401', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'invalid jwt' },
    });
    const handler = await loadHandler();
    const req = mockReq({ headers: { authorization: 'Bearer bad-token' } });
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(401);
    expect(res.result.body).toMatchObject({ code: 'AUTH_INVALID' });
    expect(getUserMock).toHaveBeenCalledWith('bad-token');
  });

  it('happy path returns the GDPR envelope with Content-Disposition', async () => {
    const handler = await loadHandler();
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(200);
    expect(res.result.headers['Content-Disposition']).toMatch(
      /^attachment; filename="msi-export-u-1-\d{8}\.json"$/,
    );
    expect(res.result.headers['Content-Type']).toMatch(/application\/json/);

    const body = res.result.body as {
      schemaVersion: number;
      exportedAt: string;
      user: { id: string; email: string | null };
      counts: { cards: number; targets: number; auditEvents: number; userData: number };
      data: {
        cards: unknown[];
        targets: unknown[];
        auditEvents: unknown[];
        userData: unknown[];
      };
    };

    expect(body.schemaVersion).toBe(1);
    expect(typeof body.exportedAt).toBe('string');
    expect(Number.isNaN(Date.parse(body.exportedAt))).toBe(false);
    expect(body.user).toEqual({ id: 'u-1', email: 'user@example.com' });
    expect(body.counts).toEqual({
      cards: 1,
      targets: 1,
      auditEvents: 1,
      userData: 1,
    });
    expect(Array.isArray(body.data.cards)).toBe(true);
    expect(Array.isArray(body.data.targets)).toBe(true);
    expect(Array.isArray(body.data.auditEvents)).toBe(true);
    expect(Array.isArray(body.data.userData)).toBe(true);

    // The audit-trail insert should have been attempted against `audit_events`.
    expect(fromMock).toHaveBeenCalledWith('audit_events');
  });

  it('returns 500 with a requestId when a downstream query errors', async () => {
    fromMock.mockImplementation(
      defaultQueryRouter({
        cards: { data: null, error: { message: 'rls denied' } },
      }),
    );
    const handler = await loadHandler();
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(500);
    const body = res.result.body as { code: string; requestId: string; message: string };
    expect(body.code).toBe('INTERNAL');
    expect(typeof body.requestId).toBe('string');
    expect(body.requestId.length).toBeGreaterThan(0);
    expect(body.message).toMatch(/export failed/i);
  });

  it('still succeeds when the best-effort audit insert fails', async () => {
    // Cards/targets/audit_events SELECT all OK, but the trailing insert fails.
    // The handler must still return 200 with the envelope.
    const responses: Record<string, QueryResponse> = {
      cards: { data: [], error: null },
      targets: { data: [], error: null },
      audit_events: { data: [], error: null },
      user_data: { data: [], error: null },
    };
    let insertCalls = 0;
    fromMock.mockImplementation((table: string) => {
      const q: Record<string, unknown> = {};
      const passthrough = () => q;
      q.select = vi.fn(passthrough);
      q.eq = vi.fn(passthrough);
      q.order = vi.fn(passthrough);
      q.limit = vi.fn(passthrough);
      q.insert = vi.fn(() => {
        insertCalls += 1;
        return Promise.resolve({ data: null, error: { message: 'audit insert blocked' } });
      });
      q.then = (onFulfilled: (v: QueryResponse) => unknown) =>
        Promise.resolve(responses[table] ?? { data: [], error: null }).then(onFulfilled);
      return q;
    });

    const handler = await loadHandler();
    const req = mockReq();
    const res = mockRes();

    await handler(req, res);

    expect(res.result.status).toBe(200);
    expect(insertCalls).toBe(1);
    const body = res.result.body as { schemaVersion: number };
    expect(body.schemaVersion).toBe(1);
  });
});
