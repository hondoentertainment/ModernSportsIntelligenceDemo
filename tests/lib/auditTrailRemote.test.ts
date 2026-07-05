import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn() },
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

import { fetchRemoteAuditEvents } from '../../lib/utils/auditTrailRemote';
import * as supabaseModule from '../../lib/supabase';
import { logger } from '../../lib/logger';

type SupabaseMock = { from: ReturnType<typeof vi.fn> };

/**
 * The real fetch builds a chain that is BOTH chainable (`.lt()` may be called
 * after `.limit()`) and thenable (the chain is awaited). The mock exposes a
 * single `chain` object with every operator returning the same object plus a
 * `then` method that resolves with the fixture.
 */
function buildQueryBuilder(result: { data: unknown; error: unknown }) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (v: unknown) => unknown) => Promise<unknown>;
  } = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    then: (onFulfilled) => Promise.resolve(result).then(onFulfilled),
  };
  return chain;
}

function buildThrowingQueryBuilder(err: unknown) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (v: unknown) => unknown, onRejected: (e: unknown) => unknown) => Promise<unknown>;
  } = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    then: (_onFulfilled, onRejected) => Promise.reject(err).catch(onRejected),
  };
  return chain;
}

describe('fetchRemoteAuditEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseModule as unknown as { isDemoMode: boolean }).isDemoMode = false;
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn();
  });

  it('returns [] when userId is null', async () => {
    const result = await fetchRemoteAuditEvents(null);
    expect(result).toEqual([]);
    expect((supabaseModule.supabase as unknown as SupabaseMock).from).not.toHaveBeenCalled();
  });

  it('returns [] when userId is undefined', async () => {
    const result = await fetchRemoteAuditEvents(undefined);
    expect(result).toEqual([]);
    expect((supabaseModule.supabase as unknown as SupabaseMock).from).not.toHaveBeenCalled();
  });

  it('returns [] when isDemoMode is true', async () => {
    (supabaseModule as unknown as { isDemoMode: boolean }).isDemoMode = true;
    const result = await fetchRemoteAuditEvents('user-1');
    expect(result).toEqual([]);
    expect((supabaseModule.supabase as unknown as SupabaseMock).from).not.toHaveBeenCalled();
  });

  it('returns mapped rows when supabase resolves with data', async () => {
    const rows = [
      {
        user_id: 'user-1',
        category: 'portfolio',
        action: 'inventory.updated',
        entity_type: 'card',
        entity_id: 'c1',
        metadata: { count: 3 },
        created_at: '2026-03-20T15:30:00.000Z',
      },
    ];
    const qb = buildQueryBuilder({ data: rows, error: null });
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn().mockReturnValue(qb);

    const result = await fetchRemoteAuditEvents('user-1');
    expect(result).toEqual(rows);
    expect((supabaseModule.supabase as unknown as SupabaseMock).from).toHaveBeenCalledWith('audit_events');
    expect(qb.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(qb.limit).toHaveBeenCalledWith(200);
  });

  it('returns [] and logs when supabase returns an error', async () => {
    const qb = buildQueryBuilder({ data: null, error: { message: 'boom' } });
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn().mockReturnValue(qb);

    const result = await fetchRemoteAuditEvents('user-1');
    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith('fetchRemoteAuditEvents failed:', { message: 'boom' });
  });

  it('returns [] when supabase data is not an array', async () => {
    const qb = buildQueryBuilder({ data: null, error: null });
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn().mockReturnValue(qb);

    const result = await fetchRemoteAuditEvents('user-1');
    expect(result).toEqual([]);
  });

  it('returns [] and logs when supabase call throws', async () => {
    const qb = buildThrowingQueryBuilder(new Error('network down'));
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn().mockReturnValue(qb);

    const result = await fetchRemoteAuditEvents('user-1');
    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith('fetchRemoteAuditEvents threw:', expect.any(Error));
  });

  it('applies before cursor and honors an explicit limit', async () => {
    const qb = buildQueryBuilder({ data: [], error: null });
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn().mockReturnValue(qb);

    await fetchRemoteAuditEvents('user-1', { limit: 50, before: '2026-01-01T00:00:00.000Z' });
    expect(qb.limit).toHaveBeenCalledWith(50);
    expect(qb.lt).toHaveBeenCalledWith('created_at', '2026-01-01T00:00:00.000Z');
  });

  it('clamps a limit above 500 down to 500 and below 1 up to 1', async () => {
    const qb = buildQueryBuilder({ data: [], error: null });
    (supabaseModule.supabase as unknown as SupabaseMock).from = vi.fn().mockReturnValue(qb);

    await fetchRemoteAuditEvents('user-1', { limit: 9999 });
    expect(qb.limit).toHaveBeenLastCalledWith(500);
    await fetchRemoteAuditEvents('user-1', { limit: 0 });
    expect(qb.limit).toHaveBeenLastCalledWith(1);
  });
});
