import { describe, expect, it } from 'vitest';
import { headerSyncCopy, resolveHeaderSyncLabel } from '../../lib/dal/headerSyncLabel';

describe('header sync label', () => {
  it('resolves a demo session to demo even while hydration is unfinished', () => {
    const label = resolveHeaderSyncLabel({
      demoSession: true,
      syncing: false,
      hydrated: false,
      lastError: 'supabase down',
    });
    expect(label).toBe('demo');
    expect(headerSyncCopy(label, 'supabase down')).toEqual({
      title: 'Demo data on this device',
      ariaLabel: 'Demo data on this device',
    });
  });

  it('keeps loading, error, and synced for a signed-in session', () => {
    expect(resolveHeaderSyncLabel({
      demoSession: false,
      syncing: false,
      hydrated: false,
      lastError: null,
    })).toBe('loading');
    expect(resolveHeaderSyncLabel({
      demoSession: false,
      syncing: true,
      hydrated: true,
      lastError: null,
    })).toBe('saving');
    expect(resolveHeaderSyncLabel({
      demoSession: false,
      syncing: false,
      hydrated: true,
      lastError: 'write failed',
    })).toBe('error');
    expect(headerSyncCopy('error', 'write failed').ariaLabel).toBe('Sync error: write failed');
    expect(resolveHeaderSyncLabel({
      demoSession: false,
      syncing: false,
      hydrated: true,
      lastError: null,
    })).toBe('synced');
  });
});
