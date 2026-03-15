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
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', 'tests/multiAgent.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 60,
        branches: 42,
        functions: 60,
        lines: 60,
      },
      include: [
        'components/FeatureSearch.tsx',
        'lib/featureCatalog.ts',
        'lib/productSurface.ts',
        'lib/differentiatorData.ts',
        'lib/fiveDifferentiatorService.ts',
        'lib/AutonomousExecutionService.ts',
        'lib/executionService.ts',
      ],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      exclude: ['**/node_modules/**', '**/e2e/**', '**/*.spec.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'json-summary'],
        reportsDirectory: './coverage',
        thresholds: {
          statements: 20,
          branches: 20,
          functions: 20,
          lines: 20,
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
        ],
      },
    },
  };
  },
});


