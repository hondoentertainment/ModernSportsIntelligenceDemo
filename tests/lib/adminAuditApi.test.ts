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

import { fetchAdminAuditEvents } from '../../lib/utils/adminAuditApi';
import * as supabaseModule from '../../lib/supabase';

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
});
