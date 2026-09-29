/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tangerine: {
          DEFAULT: '#EB7D00',
          light: '#FFA23A',
          dark: '#B85E00',
          glow: 'rgba(235, 125, 0, 0.45)',
          muted: 'rgba(235, 125, 0, 0.15)',
        },
        vanilla: {
          DEFAULT: '#EBE3A7',
          soft: 'rgba(235, 227, 167, 0.78)',
          muted: 'rgba(235, 227, 167, 0.52)',
          dim: 'rgba(235, 227, 167, 0.2)',
          border: 'rgba(235, 227, 167, 0.16)',
          glass: 'rgba(235, 227, 167, 0.05)',
        },
        brunswick: {
          DEFAULT: '#2C5745',
          light: '#3A7059',
          deep: '#1A382C',
          surface: 'rgba(44, 87, 69, 0.45)',
          card: 'rgba(44, 87, 69, 0.28)',
          glow: 'rgba(44, 87, 69, 0.35)',
        },
        darkbrown: {
          DEFAULT: '#2E2910',
          deep: '#1E1B0A',
          obsidian: '#121106',
          surface: 'rgba(46, 41, 16, 0.65)',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'tangerine-sm': '0 0 15px rgba(235, 125, 0, 0.25)',
        'tangerine-md': '0 0 30px rgba(235, 125, 0, 0.35)',
        'tangerine-lg': '0 0 50px rgba(235, 125, 0, 0.45)',
        'brunswick-card': '0 20px 40px -15px rgba(18, 17, 6, 0.8), 0 0 1px 1px rgba(235, 227, 167, 0.12)',
        'glass-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'luxury-inner': 'inset 0 1px 1px 0 rgba(235, 227, 167, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
        'glow-breathe': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 12px rgba(235, 125, 0, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 24px rgba(235, 125, 0, 0.65))' },
        }
      }
    },
  },
  plugins: [],
}
