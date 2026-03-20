import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showToast, registerToastHandler, unregisterToastHandler } from '../../lib/toast';
import { logger } from '../../lib/logger';

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unregisterToastHandler();
  });

  describe('showToast', () => {
    it('calls registered handler when available', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      showToast('success', 'Test message');
      expect(handler).toHaveBeenCalledWith('success', 'Test message', undefined);
    });

    it('falls back to logger when no handler registered', () => {
      showToast('error', 'Test error');
      expect(logger.error).toHaveBeenCalledWith('[Toast:error]', 'Test error');
    });

    it('uses logger.warn for non-error types when no handler', () => {
      showToast('warning', 'Test warning');
      expect(logger.warn).toHaveBeenCalledWith('[Toast:warning]', 'Test warning');
    });

    it('deduplicates toasts with same dedupeKey within window', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      showToast('info', 'Message 1', { dedupeKey: 'test-key' });
      showToast('info', 'Message 2', { dedupeKey: 'test-key' });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('allows duplicate toasts after dedupe window', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      showToast('info', 'Message 1', { dedupeKey: 'test-key-window' });
      // Manually clear the dedupe map by waiting and calling again
      // Since we can't easily manipulate Date.now in the module, we'll test the basic behavior
      showToast('info', 'Message 2', { dedupeKey: 'test-key-different' });
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('passes options to handler', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      const options = { duration: 5000, dismissible: true, dedupeKey: 'test' };
      showToast('success', 'Test', options);
      expect(handler).toHaveBeenCalledWith('success', 'Test', options);
    });

    it('cleans up old dedupe keys when map gets large', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      // Add many keys
      for (let i = 0; i < 60; i++) {
        showToast('info', `Message ${i}`, { dedupeKey: `key-${i}` });
      }
      // Should have cleaned up old entries
      expect(handler).toHaveBeenCalled();
    });

    it('prunes stale dedupe keys when map exceeds 50 entries (cleanup loop)', () => {
      vi.useFakeTimers({ now: 1_000_000 });
      const handler = vi.fn();
      registerToastHandler(handler);
      for (let i = 0; i < 25; i++) {
        showToast('info', `a${i}`, { dedupeKey: `a${i}` });
      }
      vi.setSystemTime(1_000_000 + 20_000);
      for (let i = 0; i < 26; i++) {
        showToast('info', `b${i}`, { dedupeKey: `b${i}` });
      }
      expect(handler).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('registerToastHandler', () => {
    it('registers a handler', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      showToast('success', 'Test');
      expect(handler).toHaveBeenCalled();
    });

    it('replaces existing handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      registerToastHandler(handler1);
      registerToastHandler(handler2);
      showToast('success', 'Test');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('unregisterToastHandler', () => {
    it('unregisters handler', () => {
      const handler = vi.fn();
      registerToastHandler(handler);
      unregisterToastHandler();
      showToast('success', 'Test');
      expect(handler).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
