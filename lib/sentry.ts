/**
 * Sentry-ready integration: no top-level @sentry/react import.
 * When VITE_SENTRY_DSN is set, dynamically loads @sentry/react and initializes;
 * captureException() then sends errors to Sentry. If DSN is unset or the package
 * is not installed, everything no-ops.
 */

let sentryReady = false;
let sentryModule: { captureException: (error: unknown) => void } | null = null;

/** Dev-only: surface missing production error channels at bootstrap. */
function warnMissingTelemetryInDev(): void {
  if (typeof import.meta === 'undefined' || import.meta.env?.PROD) return;
  const dsn = (import.meta.env?.VITE_SENTRY_DSN ?? '').trim();
  const beacon = (import.meta.env?.VITE_ERROR_REPORTING_URL ?? '').trim();
  if (!dsn && !beacon) {
    console.warn(
      '[sentry] No VITE_SENTRY_DSN or VITE_ERROR_REPORTING_URL — production builds will not report errors. See docs/MONITORING.md.',
    );
  }
}

/**
 * Initialize Sentry when VITE_SENTRY_DSN is set. Call once at app bootstrap.
 * If @sentry/react is not installed, the dynamic import fails and we stay no-op.
 */
export function initSentry(): void {
  const dsn = import.meta.env?.VITE_SENTRY_DSN;
  if (!dsn || typeof dsn !== 'string') {
    warnMissingTelemetryInDev();
    return;
  }

  const envOverride = import.meta.env?.VITE_SENTRY_ENVIRONMENT;
  const environment =
    typeof envOverride === 'string' && envOverride.length > 0
      ? envOverride
      : (import.meta.env.MODE ?? 'development');

  const rawRate = import.meta.env?.VITE_SENTRY_TRACES_SAMPLE_RATE;
  const parsedRate = typeof rawRate === 'string' ? Number(rawRate) : NaN;
  const tracesSampleRate =
    Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 1 ? parsedRate : 0.1;

  import('@sentry/react')
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate,
      });
      sentryReady = true;
      sentryModule = Sentry;
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
