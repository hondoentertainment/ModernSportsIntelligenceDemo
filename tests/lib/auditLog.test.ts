import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuditEvent, getLocalAuditTrail } from '../../lib/utils/auditLog';
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
});
