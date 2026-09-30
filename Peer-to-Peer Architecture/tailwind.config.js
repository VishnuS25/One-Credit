/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#080a0f',
          800: '#0d1117',
          700: '#161b22',
          600: '#21262d',
          500: '#30363d',
          accent: '#eab308', // gold/yellow
          accentGlow: '#facc15',
          neonCyan: '#06b6d4',
          neonEmerald: '#10b981',
          neonRose: '#f43f5e',
          neonPurple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(234, 179, 8, 0.2), inset 0 0 5px rgba(234, 179, 8, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(234, 179, 8, 0.6), inset 0 0 10px rgba(234, 179, 8, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
