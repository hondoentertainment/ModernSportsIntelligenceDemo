import { describe, expect, it } from 'vitest';
import type { SyncQueueItem } from '../../lib/utils/offlineService';
import {
  OFFLINE_SYNC_DISCLOSURE,
  formatOfflineSyncLine,
  markFailedForRetry,
  summarizeSyncQueue,
} from '../../lib/utils/offlineSyncStatus';

const item = (over: Partial<SyncQueueItem>): SyncQueueItem => ({
  id: '1',
  action: 'update',
  entity: 'card',
  payload: {},
  timestamp: 1,
  retryCount: 0,
  maxRetries: 5,
  status: 'pending',
  priority: 1,
  ...over,
});

describe('offlineSyncStatus', () => {
  it('summarizes real queue rows without inventing pendings', () => {
    expect(summarizeSyncQueue([])).toEqual({
      pending: 0,
      failed: 0,
      processing: 0,
      completed: 0,
      total: 0,
    });
    expect(formatOfflineSyncLine(summarizeSyncQueue([]))).toMatch(/no queued/i);
    expect(OFFLINE_SYNC_DISCLOSURE).toMatch(/not mixed/i);
  });

  it('counts pending/failed and requeues failed items', () => {
    const queue = [
      item({ id: 'p', status: 'pending' }),
      item({ id: 'f', status: 'failed', error: 'boom', retryCount: 5 }),
      item({ id: 'x', status: 'processing' }),
    ];
    const summary = summarizeSyncQueue(queue);
    expect(summary.pending).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.processing).toBe(1);
    expect(formatOfflineSyncLine(summary)).toBe('1 pending · 1 failed · 1 in flight');

    const retried = markFailedForRetry(queue);
    expect(retried.find((row) => row.id === 'f')?.status).toBe('pending');
    expect(retried.find((row) => row.id === 'f')?.error).toBeUndefined();
    expect(retried.find((row) => row.id === 'p')?.status).toBe('pending');
  });

  it('describes completed-only queues without inventing pendings', () => {
    const one = summarizeSyncQueue([item({ id: 'c', status: 'completed' })]);
    expect(formatOfflineSyncLine(one)).toBe('1 queued item (none pending).');
    const many = summarizeSyncQueue([
      item({ id: 'c1', status: 'completed' }),
      item({ id: 'c2', status: 'completed' }),
    ]);
    expect(formatOfflineSyncLine(many)).toBe('2 queued items (none pending).');
  });
});
