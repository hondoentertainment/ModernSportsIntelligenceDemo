import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  logAuditEvent,
  getLocalAuditTrail,
  fetchCloudAuditEvents,
} from '../../lib/utils/auditLog';
import { supabase, isDemoMode } from '../../lib/supabase';
import { store } from '../../lib/dal/syncStore';
import { logger } from '../../lib/logger';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  isDemoMode: false,
}));

vi.mock('../../lib/dal/syncStore', () => ({
  store: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('auditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(store.get).mockReturnValue([]);
  });

  describe('logAuditEvent', () => {
    it('logs event to local storage', async () => {
      await logAuditEvent({
        category: 'portfolio',
        action: 'add_card',
        entityType: 'card',
        entityId: 'card-1',
      });
      expect(store.set).toHaveBeenCalled();
    });

    it('includes all event fields', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);
      await logAuditEvent({
        userId: 'user-123',
        category: 'valuation',
        action: 'update_price',
        entityType: 'card',
        entityId: 'card-1',
        metadata: { price: 100 },
      });
      const callArgs = vi.mocked(store.set).mock.calls[0];
      expect(callArgs[0]).toBe('msi_audit_events');
      const events = callArgs[1] as any[];
      expect(events[0].category).toBe('valuation');
      expect(events[0].action).toBe('update_price');
    });

    it('skips Supabase when no userId', async () => {
      await logAuditEvent({
        category: 'portfolio',
        action: 'test',
        entityType: 'card',
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('persists to Supabase when authenticated', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);
      await logAuditEvent({
        userId: 'user-123',
        category: 'portfolio',
        action: 'test',
        entityType: 'card',
      });
      expect(supabase.from).toHaveBeenCalledWith('audit_events');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('handles Supabase errors gracefully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);
      await logAuditEvent({
        userId: 'user-123',
        category: 'portfolio',
        action: 'test',
        entityType: 'card',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('limits local audit trail to LOCAL_AUDIT_LIMIT', async () => {
      const manyEvents = Array.from({ length: 250 }, (_, i) => ({
        category: 'portfolio',
        action: `action-${i}`,
        entity_type: 'card',
        created_at: new Date().toISOString(),
      }));
      vi.mocked(store.get).mockReturnValue(manyEvents);
      await logAuditEvent({
        category: 'portfolio',
        action: 'new-action',
        entityType: 'card',
      });
      const callArgs = vi.mocked(store.set).mock.calls[0];
      const events = callArgs[1] as any[];
      expect(events.length).toBeLessThanOrEqual(200);
    });
  });

  describe('getLocalAuditTrail', () => {
    it('returns local audit events', () => {
      const events = [{ category: 'portfolio', action: 'test', entity_type: 'card', created_at: '2024-01-01' }];
      vi.mocked(store.get).mockReturnValue(events);
      const trail = getLocalAuditTrail();
      expect(trail).toEqual(events);
    });

    it('returns empty array when no events', () => {
      vi.mocked(store.get).mockReturnValue([]);
      const trail = getLocalAuditTrail();
      expect(trail).toEqual([]);
    });
  });

  describe('fetchCloudAuditEvents', () => {
    function makeQueryChain(result: { data: unknown; error: unknown }) {
      const builder: Record<string, any> = {};
      builder.select = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.order = vi.fn().mockReturnValue(builder);
      builder.limit = vi.fn().mockReturnValue(builder);
      builder.lt = vi.fn().mockReturnValue(builder);
      // The final await on the builder resolves to the supabase result.
      builder.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled);
      return builder;
    }

    it('returns [] for missing userId without hitting Supabase', async () => {
      const rows = await fetchCloudAuditEvents('');
      expect(rows).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('queries Supabase scoped to the user and returns rows', async () => {
      const data = [{ user_id: 'u1', category: 'auth', action: 'login.ok', entity_type: 'session', created_at: '2026-03-22T00:00:00.000Z' }];
      const chain = makeQueryChain({ data, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const rows = await fetchCloudAuditEvents('u1', { limit: 50 });
      expect(supabase.from).toHaveBeenCalledWith('audit_events');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(chain.limit).toHaveBeenCalledWith(50);
      expect(rows).toEqual(data);
    });

    it('applies category and before filters when provided', async () => {
      const chain = makeQueryChain({ data: [], error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);
      await fetchCloudAuditEvents('u1', { category: 'portfolio', before: '2026-01-01T00:00:00.000Z' });
      expect(chain.eq).toHaveBeenCalledWith('category', 'portfolio');
      expect(chain.lt).toHaveBeenCalledWith('created_at', '2026-01-01T00:00:00.000Z');
    });

    it('caps the limit at 500 and floors at 1', async () => {
      const chain = makeQueryChain({ data: [], error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);
      await fetchCloudAuditEvents('u1', { limit: 9999 });
      expect(chain.limit).toHaveBeenLastCalledWith(500);
      await fetchCloudAuditEvents('u1', { limit: 0 });
      expect(chain.limit).toHaveBeenLastCalledWith(1);
    });

    it('returns [] and logs when Supabase errors', async () => {
      const chain = makeQueryChain({ data: null, error: { message: 'boom' } });
      vi.mocked(supabase.from).mockReturnValue(chain as any);
      const rows = await fetchCloudAuditEvents('u1');
      expect(rows).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
