/**
 * Production error reporting: log locally and optionally send to a beacon endpoint.
 * Set VITE_ERROR_REPORTING_URL to enable beacon (e.g. Sentry ingest or your API).
 * When VITE_SENTRY_DSN is set, errors are also sent via lib/sentry (captureException).
 */

import { logger } from './logger';
import { captureException } from './sentry';

const REPORTING_URL = (import.meta.env?.VITE_ERROR_REPORTING_URL as string) || '';

/**
 * Optional context attached to reported errors (e.g. component stack, route, userId).
 * @property componentStack - React component stack when reported from an ErrorBoundary.
 * @property route - Current route or path.
 * @property userId - Current user identifier if available.
 */
export interface ErrorContext {
  componentStack?: string;
  route?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Reports an error: always logs locally via logger; if VITE_SENTRY_DSN is set, captures via Sentry;
 * if VITE_ERROR_REPORTING_URL is set, sends a beacon (POST) with message, stack, and context.
 * Safe to call from ErrorBoundary and catch blocks. Does not throw.
 *
 * @param error - The error to report. Can be an Error instance or any thrown value (coerced to string).
 * @param context - Optional context to attach (componentStack, route, userId, or custom keys).
 * @returns void
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error('[reportError]', message, stack, context);
  captureException(error);

  if (!REPORTING_URL || typeof navigator === 'undefined' || !navigator.sendBeacon) {
    return;
  }

  try {
    const payload = {
      message,
      stack,
      name: error instanceof Error ? error.name : 'Error',
      ...context,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(REPORTING_URL, blob);
  } catch (e) {
    logger.warn('[reportError] Beacon send failed', e);
  }
}
