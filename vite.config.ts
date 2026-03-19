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
      thresholds: {
        statements: 60,
        branches: 42,
        functions: 60,
        lines: 60,
      },
      exclude: [
        '**/node_modules/**',
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
