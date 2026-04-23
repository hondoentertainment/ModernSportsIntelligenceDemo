import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    // Avoid Windows/OneDrive EPERM failures when the tracked dist folder is locked
    // during local builds. CI/deploy still emits fresh hashed assets and index.html.
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core vendor chunk
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'react-vendor';
          }
          // Supabase vendor chunk
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase-vendor';
          }
          // Recharts — largest shared charting dependency (~145 KB gzip)
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor/')) {
            return 'recharts-vendor';
          }
          // Gemini SDK — large and rarely changes; isolate for better cache hits
          if (id.includes('node_modules/@google/genai')) {
            return 'gemini';
          }
          // Lib services: single chunk to avoid circular dependency (batch1 <-> batch2).
          // Pages remain lazy-loaded as separate chunks.
          if (id.includes('/lib/') && /\/lib\/(?:[^/]+\/)?[^/]+Service\.tsx?$/.test(id)) {
            return 'lib-services';
          }
        }
      }
    },
    // See PRODUCTION_READINESS.md §2.3 — run npm run build:size for top 5 chunks + total;
    // performance budget: bundle size < 500KB gzipped, Lighthouse score > 90.
    chunkSizeWarningLimit: 1000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.spec.ts', '**/.claude/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      // 100% on the explicit whitelist below. Everything else is out of scope for this
      // gate (UI, feature-catalog services, API routes, etc.). See docs/COVERAGE_POLICY.md.
      // all: false — do not pull in untested project files (would drag the global % down).
      // @ts-expect-error Vitest exposes `all`; older @vitest/coverage-v8 typings omit it
      all: false,
      include: [
        'constants.tsx',
        'prepopulatedCards.ts',
        'hooks/useUsageGate.ts',
        'lib/apiCache.ts',
        'lib/apiResilience.ts',
        'lib/apiValidation.ts',
        'lib/retry.ts',
        'lib/logger.ts',
        'lib/documentTitle.ts',
        'lib/sanitizeHtml.ts',
        'lib/schemas.ts',
        'lib/geminiClient.ts',
        'lib/featureFlags.ts',
        'lib/toast.ts',
        'lib/serverApi.ts',
        'lib/errorReporting.ts',
        'lib/envValidation.ts',
        'lib/ebayApi.ts',
        'lib/dal.ts',
        'lib/dal/syncStore.ts',
        'lib/dal/index.ts',
        'lib/dal/LocalStorageAdapter.ts',
        'lib/dal/StorageAdapter.ts',
        'lib/utils/env.ts',
        'lib/utils/signals.ts',
        'lib/utils/rarity.ts',
        'lib/utils/auditLog.ts',
        'lib/utils/featureCatalog.ts',
        'lib/utils/telemetryService.ts',
        'lib/utils/jobQueue.ts',
        'lib/analytics/analytics.ts',
        'lib/analytics/priceHistory.ts',
        'lib/analytics/valuationQuality.ts',
        'lib/utils/marketSync.ts',
        'lib/utils/warRoomThesisAudit.ts',
        'lib/htmlEscape.ts',
      ],
      // CI coverage gate (Wave M): thresholds below cause `npm run test:coverage` to
      // exit non-zero and fail the CI job. Values apply only to the whitelisted `include`
      // files above (all: false), which already have high coverage. Minimums enforced:
      //   lines ≥ 60, functions ≥ 60, branches ≥ 50 (conservative floor for regression prevention).
      // Current targets are stricter than the floor — do not lower them below the minimums.
      thresholds: {
        statements: 98.5,
        branches: 88,
        functions: 98.5,
        lines: 99,
      },
      exclude: [
        '**/node_modules/**',
        'api/lib/logger.ts',
        '**/e2e/**',
        '**/tests/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
        'vite.config.ts',
        'tailwind.config.*',
        'postcss.config.*',
        'eslint.config.*',
        'playwright.config.*',
        'scripts/**',
        '**/.claude/**',
      ],
    },
  },
});
