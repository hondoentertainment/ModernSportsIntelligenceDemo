import React from 'react';
import { createRoot } from 'react-dom/client';
import { validateEnv } from './lib/envValidation.ts';
import { initSentry } from './lib/sentry';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { validateRuntimeConfig } from './lib/runtimeConfig';
import { logger } from './lib/logger';
import { reportError } from './lib/errorReporting';

// Production: report unhandled promise rejections (same pipeline as ErrorBoundary)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { source: 'unhandledrejection' });
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
