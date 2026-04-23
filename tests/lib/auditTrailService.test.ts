// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auditLog from '../../lib/utils/auditLog';
import { getAuditEvents, mapStoredRecordToAuditEvent } from '../../lib/utils/auditTrailService';

describe('auditTrailService', () => {
  beforeEach(() => {
    vi.spyOn(auditLog, 'getLocalAuditTrail').mockReturnValue([]);
  });

  describe('mapStoredRecordToAuditEvent', () => {
    it('returns null for invalid input', () => {
      expect(mapStoredRecordToAuditEvent(null, 0)).toBeNull();
      expect(mapStoredRecordToAuditEvent({}, 0)).toBeNull();
      expect(mapStoredRecordToAuditEvent({ action: 1 }, 0)).toBeNull();
    });

    it('maps a persisted audit row', () => {
      const row = {
        user_id: 'abc12345-def',
        category: 'portfolio',
        action: 'inventory.updated',
        entity_type: 'card',
        entity_id: 'c1',
        metadata: { count: 3 },
        created_at: '2026-03-20T15:30:00.000Z',
      };
      const e = mapStoredRecordToAuditEvent(row, 2);
      expect(e).not.toBeNull();
      expect(e!.source).toBe('recorded');
      expect(e!.action).toBe('inventory.updated');
      expect(e!.category).toBe('portfolio');
      expect(e!.resource).toContain('card');
      expect(e!.resource).toContain('c1');
      expect(e!.actor).toContain('user:');
      expect(e!.metadata.count).toBe('3');
    });

    it('maps valuation category to portfolio trail category', () => {
      const e = mapStoredRecordToAuditEvent(
        {
          category: 'valuation',
          action: 'price.refresh',
          entity_type: 'holding',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        0
      );
      expect(e!.category).toBe('portfolio');
    });

    it('flags security severity for failed auth actions', () => {
      const e = mapStoredRecordToAuditEvent(
        {
          category: 'auth',
          action: 'login.failed',
          entity_type: 'session',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        0
      );
      expect(e!.severity).toBe('security');
    });
  });

  describe('getAuditEvents', () => {
    it('prepends recorded events before sample feed', () => {
      vi.spyOn(auditLog, 'getLocalAuditTrail').mockReturnValue([
        {
          category: 'system',
          action: 'test.action',
          entity_type: 'unit',
          created_at: '2026-03-21T12:00:00.000Z',
        },
      ]);
      const list = getAuditEvents();
      expect(list[0].source).toBe('recorded');
      expect(list[0].action).toBe('test.action');
      expect(list.some((e) => e.source === 'sample')).toBe(true);
    });

    it('skips malformed stored rows', () => {
      vi.spyOn(auditLog, 'getLocalAuditTrail').mockReturnValue([{ bad: true }, { action: 'ok', entity_type: 'x', created_at: '2026-01-01T00:00:00.000Z' }]);
      const recorded = getAuditEvents().filter((e) => e.source === 'recorded');
      expect(recorded).toHaveLength(1);
      expect(recorded[0].action).toBe('ok');
    });
  });
});
