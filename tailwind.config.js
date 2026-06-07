/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './constants.tsx',
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
          muted: 'oklch(0.72 0.02 240)',
          red: 'oklch(0.60 0.24 25)',
          green: 'oklch(0.70 0.15 140)',
        },
      },
    },
  },
  plugins: [],
};
