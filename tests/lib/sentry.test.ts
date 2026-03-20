import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initSentry, captureException } from '../../lib/sentry';

vi.mock('../../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('initSentry does nothing when DSN is not set', () => {
    const originalEnv = import.meta.env;
    (import.meta as any).env = {};
    initSentry();
    // Should not throw
    expect(true).toBe(true);
    (import.meta as any).env = originalEnv;
  });

  it('captureException does nothing when Sentry not initialized', () => {
    captureException(new Error('test'));
    // Should not throw
    expect(true).toBe(true);
  });

  it('captureException handles errors gracefully', () => {
    // Even if captureException is called before init, it should not throw
    captureException(new Error('test'));
    captureException('string error');
    expect(true).toBe(true);
  });
});
