import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
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
});
