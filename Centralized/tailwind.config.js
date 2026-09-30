/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          card: '#101726',
          cardBorder: '#1e293b',
          gold: '#eab308',
          goldLight: '#fde047',
          goldDim: '#854d0e',
          cyan: '#06b6d4',
          cyanGlow: '#22d3ee',
          green: '#10b981',
          red: '#ef4444',
          purple: '#8b5cf6',
          slate: '#334155',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'Menlo', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
