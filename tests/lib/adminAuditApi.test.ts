import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase', () => ({
  supabase: { functions: { invoke: vi.fn() } },
  isDemoMode: false,
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../lib/sentry', () => ({
  addBreadcrumb: vi.fn(),
}));

import { fetchAdminAuditEvents } from '../../lib/utils/adminAuditApi';
import * as supabaseModule from '../../lib/supabase';
import { addBreadcrumb } from '../../lib/sentry';

type Mocked = {
  supabase: { functions: { invoke: ReturnType<typeof vi.fn> } };
  isDemoMode: boolean;
};

describe('fetchAdminAuditEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseModule as unknown as Mocked).isDemoMode = false;
  });

  it('rejects the call in demo mode without invoking the function', async () => {
    (supabaseModule as unknown as Mocked).isDemoMode = true;
    const result = await fetchAdminAuditEvents();
    expect(result.ok).toBe(false);
    expect((supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke).not.toHaveBeenCalled();
  });

  it('forwards only the filters that are set', async () => {
    (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
      .fn()
      .mockResolvedValue({ data: { events: [], meta: { role: 'support', count: 0 } }, error: null });
    await fetchAdminAuditEvents({ targetUserId: 'u-1', limit: 50 });
    const call = (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke.mock.calls[0];
    expect(call[0]).toBe('admin-audit-events');
    expect(call[1]).toEqual({ body: { targetUserId: 'u-1', limit: 50 } });
  });

  it('returns ok:false on error and never leaks a partial result', async () => {
    (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Forbidden' } });
    const result = await fetchAdminAuditEvents({ targetUserId: 'u-1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Forbidden');
  });

  it('filters malformed events out of the response', async () => {
    (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi.fn().mockResolvedValue({
      data: {
        events: [
          null,
          { action: 42 },
          {
            user_id: 'u-1',
            category: 'auth',
            action: 'login.ok',
            entity_type: 'session',
            entity_id: null,
            metadata: {},
            created_at: '2026-03-22T00:00:00.000Z',
          },
        ],
        meta: { role: 'admin', count: 1 },
      },
      error: null,
    });
    const result = await fetchAdminAuditEvents();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.events).toHaveLength(1);
      expect(result.events[0].action).toBe('login.ok');
      expect(result.role).toBe('admin');
    }
  });

  it('rejects a response whose meta.role is not support/admin', async () => {
    (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
      .fn()
      .mockResolvedValue({ data: { events: [], meta: { role: 'member', count: 0 } }, error: null });
    const result = await fetchAdminAuditEvents();
    expect(result.ok).toBe(false);
  });

  describe('Sentry breadcrumbs', () => {
    it('emits an info breadcrumb on a successful read (targetUserId redacted)', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi.fn().mockResolvedValue({
        data: {
          events: [
            {
              user_id: 'target-uuid-1234',
              category: 'auth',
              action: 'login.ok',
              entity_type: 'session',
              entity_id: null,
              metadata: {},
              created_at: '2026-03-22T00:00:00.000Z',
            },
          ],
          meta: { role: 'support', count: 1 },
        },
        error: null,
      });
      await fetchAdminAuditEvents({ targetUserId: 'target-uuid-1234', limit: 25 });
      const call = vi.mocked(addBreadcrumb).mock.calls.find((c) => c[0].message === 'admin-audit-events read');
      expect(call).toBeTruthy();
      const filters = call![0].data?.filters as Record<string, unknown>;
      // PII policy: raw UUID must never appear in the breadcrumb.
      expect(JSON.stringify(filters)).not.toContain('target-uuid-1234');
      expect(filters.hasTargetUser).toBe(true);
      expect(typeof filters.targetUserPrefix).toBe('string');
      expect((filters.targetUserPrefix as string).length).toBe(8);
      // Non-identifying filters pass through untouched.
      expect(filters.limit).toBe(25);
    });

    it('emits an error breadcrumb when the invoke fails (targetUserId redacted)', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Forbidden' } });
      await fetchAdminAuditEvents({ targetUserId: 'target-uuid-1234' });
      const call = vi.mocked(addBreadcrumb).mock.calls.find(
        (c) => c[0].message === 'admin-audit-events invoke failed',
      );
      expect(call).toBeTruthy();
      const filters = call![0].data?.filters as Record<string, unknown>;
      expect(JSON.stringify(filters)).not.toContain('target-uuid-1234');
      expect(filters.hasTargetUser).toBe(true);
      expect(call![0].data?.errorMessage).toBe('Forbidden');
    });

    it('omits targetUserPrefix and sets hasTargetUser=false when no target scope was set', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data: { events: [], meta: { role: 'admin', count: 0 } }, error: null });
      await fetchAdminAuditEvents({ category: 'admin' });
      const call = vi.mocked(addBreadcrumb).mock.calls.find((c) => c[0].message === 'admin-audit-events read');
      const filters = call![0].data?.filters as Record<string, unknown>;
      expect(filters.hasTargetUser).toBe(false);
      expect(filters.targetUserPrefix).toBeUndefined();
      expect(filters.category).toBe('admin');
    });

    it('is deterministic — same targetUserId maps to the same prefix', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data: { events: [], meta: { role: 'admin', count: 0 } }, error: null });
      await fetchAdminAuditEvents({ targetUserId: 'target-uuid-1234' });
      await fetchAdminAuditEvents({ targetUserId: 'target-uuid-1234' });
      const calls = vi
        .mocked(addBreadcrumb)
        .mock.calls.filter((c) => c[0].message === 'admin-audit-events read');
      const [first, second] = calls.map((c) => (c[0].data?.filters as { targetUserPrefix: string }).targetUserPrefix);
      expect(first).toBe(second);
    });

    it('emits a warning breadcrumb when meta.role is unexpected', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data: { events: [], meta: { role: 'member', count: 0 } }, error: null });
      await fetchAdminAuditEvents();
      expect(vi.mocked(addBreadcrumb)).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'admin.audit',
          level: 'warning',
          message: 'admin-audit-events returned an unexpected role',
        }),
      );
    });

    it('does not emit any breadcrumb in demo mode (no network hop happened)', async () => {
      (supabaseModule as unknown as Mocked).isDemoMode = true;
      await fetchAdminAuditEvents();
      expect(vi.mocked(addBreadcrumb)).not.toHaveBeenCalled();
    });
  });

  // The Edge Function is a trust boundary, so every defensive fallback below is
  // reachable in production from a malformed or partial response. Pinning them
  // keeps this module eligible for the coverage ratchet (docs/COVERAGE_POLICY.md).
  describe('degraded and malformed responses', () => {
    const okInvoke = (data: unknown) =>
      ((supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data, error: null }));

    it('forwards the `before` cursor and reports it in the breadcrumb summary', async () => {
      okInvoke({ events: [], meta: { role: 'admin', count: 0 } });
      await fetchAdminAuditEvents({ before: '2026-03-22T00:00:00.000Z' });
      const call = (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke.mock
        .calls[0];
      expect(call[1]).toEqual({ body: { before: '2026-03-22T00:00:00.000Z' } });
      const crumb = vi
        .mocked(addBreadcrumb)
        .mock.calls.find((c) => c[0].message === 'admin-audit-events read');
      // `before` is a timestamp cursor, not identifying — passes through unredacted.
      expect((crumb![0].data?.filters as Record<string, unknown>).before).toBe(
        '2026-03-22T00:00:00.000Z',
      );
    });

    it('falls back to a generic error when the invoke error carries no message', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data: null, error: {} });
      const result = await fetchAdminAuditEvents();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe('Admin audit read failed');
      const crumb = vi
        .mocked(addBreadcrumb)
        .mock.calls.find((c) => c[0].message === 'admin-audit-events invoke failed');
      expect(crumb![0].data?.errorMessage).toBeNull();
    });

    it('falls back to a generic error when the invoke error message is empty', async () => {
      (supabaseModule.supabase as unknown as Mocked['supabase']).functions.invoke = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: '' } });
      const result = await fetchAdminAuditEvents();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe('Admin audit read failed');
    });

    it('treats a non-array `events` payload as empty rather than throwing', async () => {
      okInvoke({ events: 'not-an-array', meta: { role: 'admin', count: 0 } });
      const result = await fetchAdminAuditEvents();
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.events).toEqual([]);
    });

    it('records the role *type* in the breadcrumb when the role is not a string', async () => {
      okInvoke({ events: [], meta: {} });
      const result = await fetchAdminAuditEvents();
      expect(result.ok).toBe(false);
      const crumb = vi
        .mocked(addBreadcrumb)
        .mock.calls.find((c) => c[0].message === 'admin-audit-events returned an unexpected role');
      // Never echo an arbitrary value back into Sentry — only its type.
      expect(crumb![0].data?.role).toBe('undefined');
    });

    it('derives count from the row array when meta.count is not a number', async () => {
      const row = {
        user_id: 'u-1',
        category: 'auth',
        action: 'login.ok',
        entity_type: 'session',
        entity_id: null,
        metadata: {},
        created_at: '2026-03-22T00:00:00.000Z',
      };
      okInvoke({ events: [row, row], meta: { role: 'admin', count: 'lots' } });
      const result = await fetchAdminAuditEvents();
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.count).toBe(2);
    });
  });
});
