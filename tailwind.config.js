/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './constants.tsx',
    './constants/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: 'oklch(0.15 0.01 240)',
          lime: 'oklch(0.88 0.20 127)',
          orange: 'oklch(0.75 0.18 45)',
          slate: 'oklch(0.20 0.01 240)',
          teal: 'oklch(0.75 0.15 180)',
          muted: 'oklch(0.80 0.02 240)',
          red: 'oklch(0.60 0.24 25)',
          green: 'oklch(0.70 0.15 140)',
        },
        // Dark UI only — lift slate-500/600 for WCAG AA contrast on charcoal surfaces.
        slate: {
          ...colors.slate,
          500: 'oklch(0.78 0.02 240)',
          600: 'oklch(0.74 0.02 240)',
        },
      },
    },
  },
  plugins: [],
};
