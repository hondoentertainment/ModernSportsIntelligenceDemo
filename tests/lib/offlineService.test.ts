import { beforeEach, describe, expect, it } from 'vitest';
import { getDemoSyncQueue, getSyncQueue, queueTransaction, retryFailedSyncItems } from '../../lib/utils/offlineService';
import { store } from '../../lib/dal/syncStore';

describe('offlineService sync queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to an empty store-backed queue (no seeded mock pendings)', () => {
    expect(getSyncQueue()).toEqual([]);
  });

  it('keeps a disclosed demo preview separate from the live queue', () => {
    expect(getDemoSyncQueue().length).toBeGreaterThan(0);
    expect(getSyncQueue()).toEqual([]);
  });

  it('requeues failed store-backed items without adding mock rows', () => {
    queueTransaction({ action: 'update', entity: 'card', payload: { id: '1' } });
    const queued = getSyncQueue();
    expect(queued).toHaveLength(1);
    store.set('msi_sync_queue', [{ ...queued[0], status: 'failed', error: 'boom' }]);
    const retried = retryFailedSyncItems();
    expect(retried).toHaveLength(1);
    expect(retried[0].status).toBe('pending');
    expect(retried[0].error).toBeUndefined();
    expect(getDemoSyncQueue().length).toBeGreaterThan(0);
    expect(getSyncQueue()[0].status).toBe('pending');
  });
});
