import React from 'react';
import { createRoot } from 'react-dom/client';
import { validateEnv } from './lib/utils/env';
import { initSentry } from './lib/sentry';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { validateRuntimeConfig } from './lib/utils/runtimeConfig';
import { logger } from './lib/logger';
import { reportError } from './lib/errorReporting';
import { store } from './lib/dal/syncStore';

// Production: report unhandled promise rejections (same pipeline as ErrorBoundary)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { source: 'unhandledrejection' });
  });

  // Flush dirty DAL writes before the page closes so we don't lose the last
  // 500 ms of data if the user closes the tab between writes.
  // Note: async operations in beforeunload may not complete, but the attempt
  // improves the chance of reaching Supabase. localStorage is already written
  // synchronously by store.set(), so local data is never lost.
  window.addEventListener('beforeunload', () => {
    store.forceFlush().catch(() => {});
  });
}

const configValidation = validateRuntimeConfig();
if (!configValidation.ok) {
  configValidation.issues.forEach(issue => {
    logger.warn(`[RuntimeConfig:${issue.key}]`, issue.message);
  });
}

validateEnv();
initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
