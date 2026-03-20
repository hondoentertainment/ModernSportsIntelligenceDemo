import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('reportError beacon path', () => {
  const sendBeacon = vi.fn().mockReturnValue(true);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis.navigator, 'sendBeacon', {
      value: sendBeacon,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('POSTs a JSON blob via sendBeacon when VITE_ERROR_REPORTING_URL is set', async () => {
    vi.stubEnv('VITE_ERROR_REPORTING_URL', 'https://errors.example/ingest');
    vi.doMock('../../lib/sentry', () => ({
      captureException: vi.fn(),
    }));
    vi.doMock('../../lib/logger', () => ({
      logger: {
        error: vi.fn(),
        warn: vi.fn(),
      },
    }));
    const { reportError } = await import('../../lib/errorReporting');
    reportError(new Error('beacon-test'), { route: '/dash' });
    expect(sendBeacon).toHaveBeenCalledWith(
      'https://errors.example/ingest',
      expect.any(Blob)
    );
  });

  it('warns when sendBeacon throws', async () => {
    const warn = vi.fn();
    vi.stubEnv('VITE_ERROR_REPORTING_URL', 'https://errors.example/ingest');
    sendBeacon.mockImplementation(() => {
      throw new Error('beacon blocked');
    });
    vi.doMock('../../lib/sentry', () => ({
      captureException: vi.fn(),
    }));
    vi.doMock('../../lib/logger', () => ({
      logger: {
        error: vi.fn(),
        warn,
      },
    }));
    const { reportError } = await import('../../lib/errorReporting');
    reportError(new Error('x'));
    expect(warn).toHaveBeenCalledWith('[reportError] Beacon send failed', expect.any(Error));
    sendBeacon.mockReturnValue(true);
  });
});
