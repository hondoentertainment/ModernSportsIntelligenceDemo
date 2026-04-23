/**
 * Sentry-ready integration: no top-level @sentry/react import.
 * When VITE_SENTRY_DSN is set, dynamically loads @sentry/react and initializes;
 * captureException() then sends errors to Sentry. If DSN is unset or the package
 * is not installed, everything no-ops.
 */

let sentryReady = false;
let sentryModule: { captureException: (error: unknown) => void } | null = null;

/**
 * Initialize Sentry when VITE_SENTRY_DSN is set. Call once at app bootstrap.
 * If @sentry/react is not installed, the dynamic import fails and we stay no-op.
 */
export function initSentry(): void {
  const dsn = import.meta.env?.VITE_SENTRY_DSN;
  if (!dsn || typeof dsn !== 'string') {
    return;
  }

  import('@sentry/react')
    .then((Sentry: { init: (opts: object) => void; captureException?: (err: unknown) => string }) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE ?? 'development',
        tracesSampleRate: 0.1,
      });
      sentryReady = true;
      sentryModule = {
        captureException: (err: unknown) => {
          Sentry.captureException?.(err);
        },
      };
    })
    .catch(() => {
      sentryReady = false;
      sentryModule = null;
    });
}

/**
 * Send an error to Sentry if it was initialized (DSN set and @sentry/react loaded).
 * Safe to call anytime; no-ops when Sentry is not configured or not yet loaded.
 */
export function captureException(error: unknown): void {
  if (!sentryReady || !sentryModule) {
    return;
  }
  try {
    sentryModule.captureException(error);
  } catch {
    // no-op if Sentry API fails
  }
}
