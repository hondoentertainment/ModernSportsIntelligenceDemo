import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportError } from '../../lib/errorReporting';

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const { logger } = await import('../../lib/logger');

describe('reportError', () => {
  const sendBeaconSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const nav = globalThis.navigator as { sendBeacon?: typeof sendBeaconSpy };
    if (nav.sendBeacon) {
      vi.spyOn(nav, 'sendBeacon').mockImplementation(sendBeaconSpy);
    } else {
      Object.defineProperty(globalThis.navigator, 'sendBeacon', {
        value: sendBeaconSpy,
        configurable: true,
        writable: true,
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs error message and context via logger', () => {
    reportError(new Error('test'), { boundary: 'Test' });
    expect(logger.error).toHaveBeenCalledWith(
      '[reportError]',
      'test',
      expect.any(String),
      { boundary: 'Test' }
    );
  });

  it('does not call sendBeacon when VITE_ERROR_REPORTING_URL is unset', () => {
    reportError(new Error('test'), { boundary: 'Test' });
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('handles non-Error values by stringifying', () => {
    reportError('string error', { route: '/foo' });
    expect(logger.error).toHaveBeenCalledWith('[reportError]', 'string error', undefined, {
      route: '/foo',
    });
  });
});
