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
          // Service files batched by initial letter range to keep chunks balanced
          // Batch 1: A-L services
          if (id.includes('/lib/') && /\/lib\/[a-lA-L][^/]*Service\.ts/.test(id)) {
            return 'batch1-services';
          }
          // Batch 2: M-Z services
          if (id.includes('/lib/') && /\/lib\/[m-zM-Z][^/]*Service\.ts/.test(id)) {
            return 'batch2-services';
          }
          // Page components stay as individual lazy chunks (default Vite behavior)
        }
      }
    },
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
        statements: 20,
        branches: 20,
        functions: 20,
        lines: 20,
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
