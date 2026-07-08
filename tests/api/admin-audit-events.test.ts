import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Integration tests for the `admin-audit-events` Edge Function handler.
 *
 * We test `handler.ts` (the pure request handler with injectable deps)
 * rather than `index.ts` (the Deno bootstrap that wires the real Supabase
 * clients). This lets us exercise the entire matrix — role checks, filter
 * passthrough, audit-of-audit write, error handling — in Vitest under Node.
 */

vi.mock('../../supabase/functions/_shared/cors.ts', () => ({
  corsHeaders: { 'Access-Control-Allow-Origin': '*' },
}));

import {
  handleAdminAuditEvents,
  clampLimit,
  coerceRequestBody,
  type AdminAuditDeps,
  type AuditEventRow,
} from '../../supabase/functions/admin-audit-events/handler';

// ─── Test helpers ────────────────────────────────────────────────────

function makeReq(body: unknown, method = 'POST'): Request {
  return new Request('https://example.test/admin-audit-events', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

function makeRawReq(rawBody: string, method = 'POST'): Request {
  return new Request('https://example.test/admin-audit-events', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? rawBody : undefined,
  });
}

interface DepOverrides {
  authResult?: { user: { id: string } } | { error: string; status: number };
  operatorRole?: { role: string | null; error?: unknown };
  queryResult?: { rows?: AuditEventRow[]; error?: unknown };
  writeResult?: { error?: unknown };
  now?: string;
}

function buildDeps(overrides: DepOverrides = {}): {
  deps: AdminAuditDeps;
  getUserSpy: ReturnType<typeof vi.fn>;
  fetchRoleSpy: ReturnType<typeof vi.fn>;
  querySpy: ReturnType<typeof vi.fn>;
  writeSpy: ReturnType<typeof vi.fn>;
} {
  const authResult = overrides.authResult ?? { user: { id: 'user-1' } };
  const operatorRole = overrides.operatorRole ?? { role: 'admin', error: null };
  const queryResult = overrides.queryResult ?? { rows: [], error: null };
  const writeResult = overrides.writeResult ?? { error: null };
  const now = overrides.now ?? '2026-07-05T12:00:00.000Z';

  const getUserSpy = vi.fn(async () => authResult);
  const fetchRoleSpy = vi.fn(async () => operatorRole);
  const querySpy = vi.fn(async () => ({ rows: queryResult.rows ?? [], error: queryResult.error ?? null }));
  const writeSpy = vi.fn(async () => ({ error: writeResult.error ?? null }));

  const deps: AdminAuditDeps = {
    getUserFromRequest: getUserSpy as unknown as AdminAuditDeps['getUserFromRequest'],
    fetchOperatorRole: fetchRoleSpy as unknown as AdminAuditDeps['fetchOperatorRole'],
    queryAuditEvents: querySpy as unknown as AdminAuditDeps['queryAuditEvents'],
    writeAuditOfAudit: writeSpy as unknown as AdminAuditDeps['writeAuditOfAudit'],
    now: () => now,
  };
  return { deps, getUserSpy, fetchRoleSpy, querySpy, writeSpy };
}

async function readJson(res: Response): Promise<any> {
  return JSON.parse(await res.text());
}

// ─── Pure helpers ────────────────────────────────────────────────────

describe('handler helpers', () => {
  describe('clampLimit', () => {
    it('defaults non-numeric input to DEFAULT_LIMIT (100)', () => {
      expect(clampLimit(undefined)).toBe(100);
      expect(clampLimit('abc')).toBe(100);
      expect(clampLimit(null)).toBe(100);
      expect(clampLimit(NaN)).toBe(100);
    });

    it('clamps to [1, 500]', () => {
      expect(clampLimit(0)).toBe(1);
      expect(clampLimit(-5)).toBe(1);
      expect(clampLimit(9999)).toBe(500);
      expect(clampLimit(50)).toBe(50);
    });

    it('floors non-integer numbers', () => {
      expect(clampLimit(50.9)).toBe(50);
    });
  });

  describe('coerceRequestBody', () => {
    it('accepts plain objects unchanged', () => {
      expect(coerceRequestBody({ limit: 42 })).toEqual({ limit: 42 });
    });

    it('rejects null / arrays / primitives into an empty object', () => {
      expect(coerceRequestBody(null)).toEqual({});
      expect(coerceRequestBody([1, 2])).toEqual({});
      expect(coerceRequestBody('str')).toEqual({});
      expect(coerceRequestBody(42)).toEqual({});
    });
  });
});

// ─── Handler ─────────────────────────────────────────────────────────

describe('handleAdminAuditEvents', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('preflight & method routing', () => {
    it('answers OPTIONS with the CORS headers and a 200', async () => {
      const { deps } = buildDeps();
      const res = await handleAdminAuditEvents(makeReq({}, 'OPTIONS'), deps);
      expect(res.status).toBe(200);
    });

    it('rejects non-POST verbs with 405', async () => {
      const { deps, getUserSpy } = buildDeps();
      const res = await handleAdminAuditEvents(makeReq({}, 'GET'), deps);
      expect(res.status).toBe(405);
      expect(getUserSpy).not.toHaveBeenCalled();
    });
  });

  describe('auth', () => {
    it('surfaces auth errors with the returned status', async () => {
      const { deps } = buildDeps({
        authResult: { error: 'Missing Authorization', status: 401 },
      });
      const res = await handleAdminAuditEvents(makeReq({}), deps);
      expect(res.status).toBe(401);
      expect((await readJson(res)).error).toBe('Missing Authorization');
    });
  });

  describe('role check', () => {
    it('returns 403 when profile lookup errors', async () => {
      const { deps, querySpy, writeSpy } = buildDeps({
        operatorRole: { role: null, error: { code: 'PGRST116' } },
      });
      const res = await handleAdminAuditEvents(makeReq({}), deps);
      expect(res.status).toBe(403);
      expect(querySpy).not.toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('returns 403 for member callers (no audit read, no audit write)', async () => {
      const { deps, querySpy, writeSpy } = buildDeps({
        operatorRole: { role: 'member', error: null },
      });
      const res = await handleAdminAuditEvents(makeReq({}), deps);
      expect(res.status).toBe(403);
      expect(querySpy).not.toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('accepts support role', async () => {
      const { deps } = buildDeps({ operatorRole: { role: 'support', error: null } });
      const res = await handleAdminAuditEvents(makeReq({}), deps);
      expect(res.status).toBe(200);
      expect((await readJson(res)).meta.role).toBe('support');
    });

    it('accepts admin role', async () => {
      const { deps } = buildDeps({ operatorRole: { role: 'admin', error: null } });
      const res = await handleAdminAuditEvents(makeReq({}), deps);
      expect(res.status).toBe(200);
      expect((await readJson(res)).meta.role).toBe('admin');
    });
  });

  describe('body validation', () => {
    it('accepts a POST with no body (empty string)', async () => {
      const { deps, querySpy } = buildDeps();
      const res = await handleAdminAuditEvents(makeRawReq(''), deps);
      expect(res.status).toBe(200);
      // Default limit is 100 (from clampLimit).
      expect(querySpy).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
    });

    it('accepts a POST with body `null` and does not crash on .limit', async () => {
      const { deps, querySpy } = buildDeps();
      const res = await handleAdminAuditEvents(makeRawReq('null'), deps);
      expect(res.status).toBe(200);
      expect(querySpy).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
    });

    it('rejects malformed JSON with 400', async () => {
      const { deps, querySpy } = buildDeps();
      const res = await handleAdminAuditEvents(makeRawReq('{not json'), deps);
      expect(res.status).toBe(400);
      expect(querySpy).not.toHaveBeenCalled();
    });
  });

  describe('filter passthrough', () => {
    it('forwards every filter to queryAuditEvents (with clamped limit)', async () => {
      const { deps, querySpy } = buildDeps();
      await handleAdminAuditEvents(
        makeReq({
          targetUserId: 'u-42',
          category: 'admin',
          before: '2026-06-01T00:00:00.000Z',
          limit: 9999, // will clamp to 500
        }),
        deps,
      );
      expect(querySpy).toHaveBeenCalledWith({
        targetUserId: 'u-42',
        category: 'admin',
        before: '2026-06-01T00:00:00.000Z',
        limit: 500,
      });
    });

    it('drops empty-string filters instead of forwarding them', async () => {
      const { deps, querySpy } = buildDeps();
      await handleAdminAuditEvents(
        makeReq({ targetUserId: '', category: '', before: '', limit: 25 }),
        deps,
      );
      expect(querySpy).toHaveBeenCalledWith({
        targetUserId: undefined,
        category: undefined,
        before: undefined,
        limit: 25,
      });
    });
  });

  describe('audit-of-audit', () => {
    it('writes an admin cross_user_read row before returning the events', async () => {
      const { deps, querySpy, writeSpy } = buildDeps({
        queryResult: {
          rows: [
            {
              user_id: 'u-42',
              category: 'auth',
              action: 'login.ok',
              entity_type: 'session',
              entity_id: null,
              metadata: {},
              created_at: '2026-06-30T12:00:00.000Z',
            },
          ],
          error: null,
        },
        now: '2026-07-05T09:00:00.000Z',
      });
      const res = await handleAdminAuditEvents(
        makeReq({ targetUserId: 'u-42', limit: 25 }),
        deps,
      );
      expect(res.status).toBe(200);
      const body = await readJson(res);
      expect(body.events).toHaveLength(1);
      expect(body.meta.count).toBe(1);

      // audit-of-audit fired with the operator's user id, admin category, and
      // metadata carrying the filters + row_count.
      expect(writeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          category: 'admin',
          action: 'audit.cross_user_read',
          entity_type: 'audit_events',
          entity_id: 'u-42',
          metadata: expect.objectContaining({
            operator_role: 'admin',
            row_count: 1,
            filters: expect.objectContaining({ targetUserId: 'u-42', limit: 25 }),
          }),
          created_at: '2026-07-05T09:00:00.000Z',
        }),
      );
      // Sequence: query then write (both fired).
      expect(querySpy).toHaveBeenCalledBefore(writeSpy);
    });

    it('502s when the audit-of-audit write fails; no rows leak', async () => {
      const { deps } = buildDeps({
        queryResult: {
          rows: [
            {
              user_id: 'u-42',
              category: 'auth',
              action: 'login.ok',
              entity_type: 'session',
              entity_id: null,
              metadata: {},
              created_at: '2026-06-30T12:00:00.000Z',
            },
          ],
          error: null,
        },
        writeResult: { error: { message: 'audit insert failed' } },
      });
      const res = await handleAdminAuditEvents(makeReq({ targetUserId: 'u-42' }), deps);
      expect(res.status).toBe(502);
      const body = await readJson(res);
      expect(body.error).toContain('Failed to record admin access');
      // The response body must NOT include the underlying events.
      expect(body.events).toBeUndefined();
    });
  });

  describe('query errors', () => {
    it('502s when the audit_events query itself fails', async () => {
      const { deps, writeSpy } = buildDeps({
        queryResult: { error: { message: 'boom' } },
      });
      const res = await handleAdminAuditEvents(makeReq({}), deps);
      expect(res.status).toBe(502);
      // No audit-of-audit write for a query that never returned rows.
      expect(writeSpy).not.toHaveBeenCalled();
    });
  });
});
