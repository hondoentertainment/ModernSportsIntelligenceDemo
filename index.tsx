import React from 'react';
import { createRoot } from 'react-dom/client';
import { validateEnv } from './lib/envValidation.ts';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { validateRuntimeConfig } from './lib/runtimeConfig';

const configValidation = validateRuntimeConfig();
if (!configValidation.ok) {
  configValidation.issues.forEach(issue => {
    console.warn(`[RuntimeConfig:${issue.key}] ${issue.message}`);
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
