import React from 'react';
import { createRoot } from 'react-dom/client';
import { validateEnv } from './lib/utils/envValidation.ts';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { validateRuntimeConfig } from './lib/utils/runtimeConfig';
import { logger } from './lib/logger';

const configValidation = validateRuntimeConfig();
if (!configValidation.ok) {
  configValidation.issues.forEach(issue => {
    logger.warn(`[RuntimeConfig:${issue.key}]`, issue.message);
  });
}

validateEnv();

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
