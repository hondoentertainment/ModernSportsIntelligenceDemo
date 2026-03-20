import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initFeatureFlags,
  getFeatureFlags,
  isFeatureEnabled,
  setFeatureFlag,
  resetFeatureFlags,
} from '../../lib/featureFlags';
import { logger } from '../../lib/logger';

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('featureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset flags by calling reset
    resetFeatureFlags();
  });

  it('initFeatureFlags loads flags from environment', () => {
    const flags = initFeatureFlags();
    expect(flags).toBeDefined();
    expect(flags).toHaveProperty('USE_REAL_EBAY');
    expect(flags).toHaveProperty('USE_REAL_PSA');
    expect(flags).toHaveProperty('USE_REAL_BGS');
    expect(flags).toHaveProperty('USE_REAL_SPORTS');
    expect(flags).toHaveProperty('USE_REAL_COMC');
    expect(flags).toHaveProperty('USE_REAL_GEMINI');
  });

  it('getFeatureFlags returns current flags', () => {
    const flags = getFeatureFlags();
    expect(flags).toBeDefined();
    expect(typeof flags.USE_REAL_EBAY).toBe('boolean');
  });

  it('getFeatureFlags auto-initializes if not initialized', () => {
    const flags = getFeatureFlags();
    expect(flags).toBeDefined();
    expect(typeof flags.USE_REAL_EBAY).toBe('boolean');
  });

  it('isFeatureEnabled checks a single flag', () => {
    const enabled = isFeatureEnabled('USE_REAL_EBAY');
    expect(typeof enabled).toBe('boolean');
  });

  it('setFeatureFlag overrides a flag', () => {
    setFeatureFlag('USE_REAL_EBAY', true);
    expect(isFeatureEnabled('USE_REAL_EBAY')).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('USE_REAL_EBAY')
    );
  });

  it('resetFeatureFlags resets to defaults', () => {
    setFeatureFlag('USE_REAL_EBAY', true);
    expect(isFeatureEnabled('USE_REAL_EBAY')).toBe(true);
    
    resetFeatureFlags();
    // After reset, should be back to env default (likely false)
    const flags = getFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBeDefined();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Reset to environment defaults')
    );
  });

  it('initFeatureFlags logs active flags', () => {
    initFeatureFlags();
    expect(logger.info).toHaveBeenCalled();
  });

  it('logs all mock data when every flag is off', () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', '');
    vi.stubEnv('VITE_FF_REAL_PSA', '');
    vi.stubEnv('VITE_FF_REAL_BGS', '');
    vi.stubEnv('VITE_FF_REAL_SPORTS', '');
    vi.stubEnv('VITE_FF_REAL_COMC', '');
    vi.stubEnv('VITE_FF_REAL_GEMINI', '');
    resetFeatureFlags();
    initFeatureFlags();
    expect(logger.info).toHaveBeenCalledWith('[FeatureFlags] All adapters using mock data');
  });

});
