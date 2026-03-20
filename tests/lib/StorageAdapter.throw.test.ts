import { describe, it, expect, vi } from 'vitest';

describe('StorageAdapter getAdapter', () => {
  it('throws when used before initAdapter/setAdapter', async () => {
    vi.resetModules();
    const { getAdapter } = await import('../../lib/dal/StorageAdapter');
    expect(() => getAdapter()).toThrow(/not initialized/);
  });
});
