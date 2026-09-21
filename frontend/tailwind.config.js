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
        canvas: {
          DEFAULT: '#f8fafc',
          base: '#f8fafc',
          subtle: '#f1f5f9',
          card: '#ffffff',
          elevated: '#ffffff',
          muted: '#f1f5f9',
          border: '#e2e8f0',
          borderHover: '#cbd5e1'
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          indigo: '#4f46e5',
          violet: '#7c3aed',
          pink: '#db2777',
          rose: '#e11d48',
          amber: '#d97706',
          emerald: '#059669',
          cyan: '#0891b2',
          lime: '#65a30d'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'h2': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.04em' }],
        'cook-giant': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }]
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'glow-indigo': '0 10px 30px -5px rgba(99, 102, 241, 0.3)',
        'glow-emerald': '0 10px 30px -5px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 10px 30px -5px rgba(245, 158, 11, 0.3)',
        'glow-rose': '0 10px 30px -5px rgba(244, 63, 94, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' }
        }
      }
    },
  },
  plugins: [],
}
