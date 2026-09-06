import { beforeEach, describe, expect, it } from 'vitest';
import { getDemoSyncQueue, getSyncQueue } from '../../lib/utils/offlineService';

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
});
