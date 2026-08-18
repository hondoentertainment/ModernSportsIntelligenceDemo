import path from 'path';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Production telemetry gate. A real production build should ship with an error
 * channel (Sentry DSN or the error-reporting beacon) so the app is observable.
 * When VITE_REQUIRE_TELEMETRY is truthy this fails the build; otherwise it just
 * warns. e2e builds and non-build commands (dev, vitest) are exempt.
 */
function assertTelemetryConfigured(command: string, mode: string): void {
  if (command !== 'build' || mode !== 'production') return;
  const env = loadEnv(mode, process.cwd(), '');
  const hasTelemetry = !!(env.VITE_SENTRY_DSN?.trim() || env.VITE_ERROR_REPORTING_URL?.trim());
  if (hasTelemetry) return;
  const required = ['true', '1'].includes((env.VITE_REQUIRE_TELEMETRY ?? '').trim().toLowerCase());
  const msg =
    'No error telemetry configured for this production build — set VITE_SENTRY_DSN or VITE_ERROR_REPORTING_URL.';
  if (required) {
    throw new Error(`${msg} (VITE_REQUIRE_TELEMETRY is set, so this is a hard failure.)`);
  }
  // Dev-only: warn on local production builds; CI already surfaces this via env validation.
  if (!process.env.CI) {
    console.warn(`[vite] WARNING: ${msg} Set VITE_REQUIRE_TELEMETRY=true to enforce.`);
  }
}

export default defineConfig(({ command, mode }) => {
  assertTelemetryConfigured(command, mode);
  return {
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
          // Lib services: split by domain so a route only pulls the domains it
          // imports instead of one ~4.3 MB monolith. Bridge files that are
          // imported across domains are pinned to their consumer's chunk to
          // keep the chunk graph acyclic:
          //   trading -> utils only via quantWorkbenchService (no deps of its own)
          //   core    -> utils only via reportService/taxLotService (reportService's
          //              sole service dep, collectorAuditDossierService, is in core)
          // Remaining cross-domain edges form a DAG: utils -> {analytics, trading},
          // core -> {analytics, trading}, trading -> analytics.
          const serviceMatch = id.match(/\/lib\/(?:([^/]+)\/)?([^/]+Service)\.tsx?$/);
          if (serviceMatch && id.includes('/lib/')) {
            const [, domain, file] = serviceMatch;
            if (file === 'quantWorkbenchService') return 'lib-trading';
            if (file === 'reportService' || file === 'taxLotService') return 'lib-core';
            switch (domain) {
              case 'analytics': return 'lib-analytics';
              case 'trading': return 'lib-trading';
              case 'core': return 'lib-core';
              case 'social': return 'lib-social';
              default: return 'lib-utils'; // lib/utils plus root-level re-export shims
            }
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
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.spec.ts', '**/.claude/**', '**/ModernSportsIntelligenceDemo/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      // 100% on the explicit whitelist below. Everything else is out of scope for this
      // gate (UI, feature-catalog services, API routes, etc.). See docs/COVERAGE_POLICY.md.
      // all: false — do not pull in untested project files (would drag the global % down).
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
        'lib/utils/auditTrailRemote.ts',
        // Trust-boundary client for the admin-audit-events Edge Function. On the
        // ratchet so the Sentry PII redaction (targetUserId is never sent raw)
        // cannot regress unnoticed. 100% stmts/branches/funcs/lines.
        'lib/utils/adminAuditApi.ts',
        'lib/utils/cardConsignmentCodec.ts',
        'lib/betaFeatureExit.ts',
        'lib/integrations/ebayAdapter.ts',
        // gradingVisionEngineService has unit coverage (~95% stmts) but its
        // random-conditional branches are run-to-run unstable — unfit for
        // this near-100% ratchet gate. Revisit if the simulator becomes
        // seedable.
        'lib/utils/featureCatalog.ts',
        'lib/utils/telemetryService.ts',
        'lib/utils/jobQueue.ts',
        'lib/analytics/analytics.ts',
        'lib/analytics/priceHistory.ts',
        'lib/analytics/valuationQuality.ts',
        'lib/utils/marketSync.ts',
        'lib/utils/warRoomThesisAudit.ts',
        'lib/utils/warRoomLedgerContext.ts',
        'lib/pricing/consensusMarketLedger.ts',
        'lib/htmlEscape.ts',
      ],
      // Thresholds track the current aggregate on the whitelist above so CI
      // stays honest (see docs/COVERAGE_POLICY.md). Set just below the measured
      // values for v8 run-to-run stability; ratchet UP as tests are added,
      // never down. Branches lag (~91%) due to defensive branches,
      // import.meta / env splits, and optional chaining.
      // Measured 98.54 / 92.09 / 99.36 / 99.17 (identical locally and in CI —
      // v8 is deterministic for this suite). Thresholds sit ~0.15-0.6pp under
      // that: tight enough to catch a real regression, loose enough that one
      // incidental uncovered statement does not fail the gate with an opaque
      // threshold error. Ratchet UP as tests are added, never down.
      thresholds: {
        statements: 98.4,
        branches: 91.5,
        functions: 99,
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
  };
});
