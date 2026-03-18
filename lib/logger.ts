/**
 * Production-safe logger. In production, debug/log are no-ops to avoid
 * leaking information and reducing console noise. Error/warn are still
 * emitted for critical issues and monitoring.
 */
const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isProd && typeof console !== 'undefined' && console.debug) {
      console.debug('[MSI]', ...args);
    }
  },
  log: (...args: unknown[]) => {
    if (!isProd && typeof console !== 'undefined' && console.log) {
      console.log('[MSI]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (!isProd && typeof console !== 'undefined' && console.info) {
      console.info('[MSI]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[MSI]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[MSI]', ...args);
    }
  },
};

export default logger;
