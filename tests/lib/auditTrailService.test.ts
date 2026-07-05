import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auditLog from '../../lib/utils/auditLog';
import * as auditTrailRemote from '../../lib/utils/auditTrailRemote';
import {
  getAuditEvents,
  getRemoteAuditEvents,
  mapStoredRecordToAuditEvent,
  filterAuditEvents,
  exportAuditEventsToCSV,
  getOldestCreatedAt,
  type AuditEvent,
} from '../../lib/utils/auditTrailService';

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

  describe('getRemoteAuditEvents', () => {
    it('maps rows returned by fetchRemoteAuditEvents and tags them as cloud', async () => {
      vi.spyOn(auditTrailRemote, 'fetchRemoteAuditEvents').mockResolvedValue([
        {
          user_id: 'user-1',
          category: 'portfolio',
          action: 'remote.fetch',
          entity_type: 'card',
          entity_id: 'c9',
          metadata: { source: 'supabase' },
          created_at: '2026-03-22T09:00:00.000Z',
        },
      ]);

      const result = await getRemoteAuditEvents('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('cloud');
      expect(result[0].action).toBe('remote.fetch');
    });

    it('passes pagination options through to fetchRemoteAuditEvents', async () => {
      const spy = vi.spyOn(auditTrailRemote, 'fetchRemoteAuditEvents').mockResolvedValue([]);
      await getRemoteAuditEvents('user-1', { limit: 50, before: '2026-01-01T00:00:00.000Z' });
      expect(spy).toHaveBeenCalledWith('user-1', { limit: 50, before: '2026-01-01T00:00:00.000Z' });
    });

    it('returns [] when fetchRemoteAuditEvents returns []', async () => {
      vi.spyOn(auditTrailRemote, 'fetchRemoteAuditEvents').mockResolvedValue([]);
      const result = await getRemoteAuditEvents(null);
      expect(result).toEqual([]);
    });

    it('forwards pagination options to fetchRemoteAuditEvents', async () => {
      const spy = vi
        .spyOn(auditTrailRemote, 'fetchRemoteAuditEvents')
        .mockResolvedValue([]);
      await getRemoteAuditEvents('user-1', { limit: 25, before: '2026-01-01T00:00:00.000Z' });
      expect(spy).toHaveBeenCalledWith('user-1', { limit: 25, before: '2026-01-01T00:00:00.000Z' });
    });
  });

  describe('filterAuditEvents', () => {
    const events: AuditEvent[] = [
      { id: '1', timestamp: 't1', category: 'trading',   severity: 'info',     actor: 'alice', action: 'trade.exec',  resource: 'Trade #1', details: 'Sold 5 cards', ipAddress: '-', sessionId: '-', result: 'success', metadata: {}, source: 'recorded' },
      { id: '2', timestamp: 't2', category: 'auth',      severity: 'security', actor: 'bob',   action: 'login.fail',  resource: 'Login',    details: 'TOR exit',     ipAddress: '-', sessionId: '-', result: 'blocked', metadata: {}, source: 'cloud' },
      { id: '3', timestamp: 't3', category: 'portfolio', severity: 'info',     actor: 'alice', action: 'nav.refresh', resource: 'NAV',      details: 'Refreshed',    ipAddress: '-', sessionId: '-', result: 'success', metadata: {}, source: 'sample' },
    ];

    it('returns input unchanged when no filters are set', () => {
      expect(filterAuditEvents(events, {})).toHaveLength(3);
    });

    it('filters by single category', () => {
      expect(filterAuditEvents(events, { categories: ['auth'] }).map((e) => e.id)).toEqual(['2']);
    });

    it('filters by multiple severities (OR within, AND across dimensions)', () => {
      expect(filterAuditEvents(events, { severities: ['security', 'critical'] }).map((e) => e.id)).toEqual(['2']);
    });

    it('filters by source', () => {
      expect(filterAuditEvents(events, { sources: ['recorded', 'cloud'] }).map((e) => e.id).sort()).toEqual(['1', '2']);
    });

    it('search matches action, resource, details, actor (case-insensitive)', () => {
      expect(filterAuditEvents(events, { search: 'TOR' }).map((e) => e.id)).toEqual(['2']);
      expect(filterAuditEvents(events, { search: 'alice' }).map((e) => e.id).sort()).toEqual(['1', '3']);
      expect(filterAuditEvents(events, { search: 'nav' }).map((e) => e.id)).toEqual(['3']);
    });

    it('combines filters with AND semantics', () => {
      const out = filterAuditEvents(events, {
        categories: ['trading', 'portfolio'],
        sources: ['recorded'],
        search: 'cards',
      });
      expect(out.map((e) => e.id)).toEqual(['1']);
    });
  });

  describe('exportAuditEventsToCSV', () => {
    const events: AuditEvent[] = [
      { id: '1', timestamp: '2026-03-21 14:00:00', category: 'trading', severity: 'info', actor: 'alice', action: 'trade.exec', resource: 'Trade #1', details: 'Sold 5 cards, lot', ipAddress: '-', sessionId: '-', result: 'success', metadata: { amount: '$100' }, source: 'recorded' },
    ];

    it('emits the canonical header row', () => {
      const csv = exportAuditEventsToCSV([]);
      expect(csv.split('\r\n')[0]).toBe('timestamp,source,category,severity,actor,action,resource,result,details,metadata');
    });

    it('quotes fields containing commas and escapes embedded quotes', () => {
      const csv = exportAuditEventsToCSV(events);
      const lines = csv.split('\r\n');
      expect(lines).toHaveLength(2);
      expect(lines[1]).toContain('"Sold 5 cards, lot"');
      expect(lines[1]).toContain('"{""amount"":""$100""}"');
    });

    it('round-trips empty metadata as {}', () => {
      const csv = exportAuditEventsToCSV([{ ...events[0], metadata: {} } as AuditEvent]);
      expect(csv.split('\r\n')[1]).toContain(',{}');
    });
  });

  describe('getOldestCreatedAt', () => {
    it('returns undefined for empty and unusable input', () => {
      expect(getOldestCreatedAt([])).toBeUndefined();
      expect(getOldestCreatedAt([null, 'x', { created_at: 42 }, { other: 'y' }, { created_at: '' }])).toBeUndefined();
    });

    it('returns the lexicographically smallest ISO string (= chronologically oldest)', () => {
      expect(
        getOldestCreatedAt([
          { created_at: '2026-03-26T10:00:00.000Z' },
          { created_at: '2026-03-20T00:00:00.000Z' },
          { created_at: '2026-03-25T23:59:59.999Z' },
        ]),
      ).toBe('2026-03-20T00:00:00.000Z');
    });

    it('ignores malformed rows but still finds the oldest valid one', () => {
      expect(
        getOldestCreatedAt([
          { created_at: '2026-03-26T10:00:00.000Z' },
          null,
          { created_at: undefined },
          { created_at: '2026-01-01T00:00:00.000Z' },
          { created_at: 9999 },
        ]),
      ).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('filterAuditEvents', () => {
    const events: AuditEvent[] = [
      { id: '1', timestamp: 't1', category: 'trading', severity: 'info',     actor: 'alice', action: 'trade.exec',  resource: 'Trade #1', details: 'Sold 5 cards', ipAddress: '-', sessionId: '-', result: 'success', metadata: {}, source: 'recorded' },
      { id: '2', timestamp: 't2', category: 'auth',    severity: 'security', actor: 'bob',   action: 'login.fail',  resource: 'Login',    details: 'TOR exit',     ipAddress: '-', sessionId: '-', result: 'blocked', metadata: {}, source: 'cloud' },
      { id: '3', timestamp: 't3', category: 'portfolio', severity: 'info',   actor: 'alice', action: 'nav.refresh', resource: 'NAV',      details: 'Refreshed',    ipAddress: '-', sessionId: '-', result: 'success', metadata: {}, source: 'sample' },
    ];

    it('returns input unchanged when no filters are set', () => {
      expect(filterAuditEvents(events, {})).toHaveLength(3);
    });

    it('filters by single category', () => {
      const out = filterAuditEvents(events, { categories: ['auth'] });
      expect(out).toHaveLength(1);
      expect(out[0].id).toBe('2');
    });

    it('filters by multiple severities (OR)', () => {
      const out = filterAuditEvents(events, { severities: ['security', 'critical'] });
      expect(out.map((e) => e.id)).toEqual(['2']);
    });

    it('filters by source', () => {
      const out = filterAuditEvents(events, { sources: ['recorded', 'cloud'] });
      expect(out.map((e) => e.id).sort()).toEqual(['1', '2']);
    });

    it('search matches across action, resource, details, actor (case-insensitive)', () => {
      expect(filterAuditEvents(events, { search: 'TOR' }).map((e) => e.id)).toEqual(['2']);
      expect(filterAuditEvents(events, { search: 'alice' }).map((e) => e.id).sort()).toEqual(['1', '3']);
      expect(filterAuditEvents(events, { search: 'nav' }).map((e) => e.id)).toEqual(['3']);
    });

    it('combines filters with AND semantics', () => {
      const out = filterAuditEvents(events, {
        categories: ['trading', 'portfolio'],
        sources: ['recorded'],
        search: 'cards',
      });
      expect(out.map((e) => e.id)).toEqual(['1']);
    });
  });

  describe('exportAuditEventsToCSV', () => {
    const events: AuditEvent[] = [
      { id: '1', timestamp: '2026-03-21 14:00:00', category: 'trading', severity: 'info', actor: 'alice', action: 'trade.exec', resource: 'Trade #1', details: 'Sold 5 cards, lot', ipAddress: '-', sessionId: '-', result: 'success', metadata: { amount: '$100' }, source: 'recorded' },
    ];

    it('emits the canonical header row', () => {
      const csv = exportAuditEventsToCSV([]);
      expect(csv.split('\r\n')[0]).toBe('timestamp,source,category,severity,actor,action,resource,result,details,metadata');
    });

    it('quotes fields containing commas and escapes embedded quotes', () => {
      const csv = exportAuditEventsToCSV(events);
      const lines = csv.split('\r\n');
      expect(lines).toHaveLength(2);
      // "Sold 5 cards, lot" must be wrapped in double-quotes because of the comma.
      expect(lines[1]).toContain('"Sold 5 cards, lot"');
      // metadata JSON is also quoted because it contains a comma/quote.
      expect(lines[1]).toContain('"{""amount"":""$100""}"');
    });

    it('round-trips empty metadata as {}', () => {
      const csv = exportAuditEventsToCSV([{ ...events[0], metadata: {} } as AuditEvent]);
      expect(csv.split('\r\n')[1]).toContain(',{}');
    });
  });

  describe('getOldestCreatedAt', () => {
    it('returns undefined for an empty set', () => {
      expect(getOldestCreatedAt([])).toBeUndefined();
    });

    it('returns undefined when no row carries a usable string timestamp', () => {
      expect(
        getOldestCreatedAt([
          null,
          { created_at: 42 },
          { created_at: '' },
          { other: 'field' } as { created_at?: unknown },
        ]),
      ).toBeUndefined();
    });

    it('returns the lexicographically smallest ISO string (= chronologically oldest)', () => {
      const rows = [
        { created_at: '2026-03-26T10:00:00.000Z' },
        { created_at: '2026-03-20T00:00:00.000Z' },
        { created_at: '2026-03-25T23:59:59.999Z' },
      ];
      expect(getOldestCreatedAt(rows)).toBe('2026-03-20T00:00:00.000Z');
    });

    it('ignores malformed rows but still finds the oldest valid one', () => {
      const rows = [
        { created_at: '2026-03-26T10:00:00.000Z' },
        null,
        { created_at: undefined },
        { created_at: '2026-01-01T00:00:00.000Z' },
        { created_at: 9999 },
      ];
      expect(getOldestCreatedAt(rows)).toBe('2026-01-01T00:00:00.000Z');
    });
  });
});
