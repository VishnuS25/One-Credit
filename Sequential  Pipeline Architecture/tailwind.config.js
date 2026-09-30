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
          card: '#0f1422',
          cardHover: '#161c30',
          border: 'rgba(255, 255, 255, 0.08)',
          borderGlow: 'rgba(234, 179, 8, 0.3)',
          gold: '#eab308',
          goldLight: '#facc15',
          goldDark: '#ca8a04',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          purple: '#a855f7',
          blue: '#3b82f6',
        }
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(234, 179, 8, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.02)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        flowPulse: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' }
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'flow-pulse': 'flowPulse 1.5s linear infinite',
      }
    },
  },
  plugins: [],
}
