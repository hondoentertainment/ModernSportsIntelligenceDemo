import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../lib/logger';

describe('logger', () => {
  const originalConsole = { ...console };
  const mockConsole = {
    debug: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    Object.assign(console, mockConsole);
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  it('logger.error calls console.error', () => {
    logger.error('test error');
    expect(mockConsole.error).toHaveBeenCalledWith('[MSI]', 'test error');
  });

  it('logger.warn calls console.warn', () => {
    logger.warn('test warning');
    expect(mockConsole.warn).toHaveBeenCalledWith('[MSI]', 'test warning');
  });

  it('logger.info calls console.info in non-prod', () => {
    logger.info('test info');
    expect(mockConsole.info).toHaveBeenCalledWith('[MSI]', 'test info');
  });

  it('logger.log calls console.log in non-prod', () => {
    logger.log('test log');
    expect(mockConsole.log).toHaveBeenCalledWith('[MSI]', 'test log');
  });

  it('logger.debug calls console.debug in non-prod', () => {
    logger.debug('test debug');
    expect(mockConsole.debug).toHaveBeenCalledWith('[MSI]', 'test debug');
  });

  it('handles multiple arguments', () => {
    logger.error('error', { code: 500 }, 'details');
    expect(mockConsole.error).toHaveBeenCalledWith('[MSI]', 'error', { code: 500 }, 'details');
  });

  it('skips debug when console.debug is missing', () => {
    const orig = console.debug;
    // @ts-expect-error allow delete for branch coverage
    delete console.debug;
    logger.debug('skip');
    console.debug = orig;
  });

  it('skips debug/log/info when running in production mode', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    Object.assign(console, mockConsole);
    const { logger: prodLogger } = await import('../../lib/logger');
    prodLogger.debug('d');
    prodLogger.log('l');
    prodLogger.info('i');
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.log).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
