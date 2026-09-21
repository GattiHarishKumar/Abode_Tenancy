/**
 * Abode Tenancy Design System Tokens (Bright / Light Theme)
 * Comprehensive centralized token definition for bright theme, typography, and semantic status colors.
 */

export const tokens = {
  colors: {
    canvas: {
      default: '#f8fafc',
      base: '#f8fafc',
      subtle: '#f1f5f9',
      card: '#ffffff',
      elevated: '#ffffff',
      muted: '#f1f5f9',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
    },
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      900: '#312e81',
      950: '#1e1b4b',
    },
    semantic: {
      success: '#059669',
      warning: '#d97706',
      danger: '#e11d48',
      info: '#0891b2',
      purple: '#7c3aed',
    }
  },
  typography: {
    fontFamily: {
      heading: '"Outfit", "Plus Jakarta Sans", sans-serif',
      body: '"Plus Jakarta Sans", Inter, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    scale: {
      display: '3.5rem', // 56px
      h1: '2.5rem',      // 40px
      h2: '2.0rem',      // 32px
      h3: '1.5rem',      // 24px
      h4: '1.25rem',     // 20px
      bodyLg: '1.125rem',// 18px
      body: '1.0rem',    // 16px (minimum body text size)
      caption: '0.875rem',// 14px
      cookGiant: '4.0rem',// 64px
    }
  },
  radius: {
    sm: '0.75rem', // 12px
    md: '1.0rem',  // 16px
    lg: '1.5rem',  // 24px
    xl: '2.0rem',  // 32px
    full: '9999px',
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07)',
    glowIndigo: '0 10px 30px -5px rgba(99, 102, 241, 0.3)',
    glowEmerald: '0 10px 30px -5px rgba(16, 185, 129, 0.3)',
    glowAmber: '0 10px 30px -5px rgba(245, 158, 11, 0.3)',
    glowRose: '0 10px 30px -5px rgba(244, 63, 94, 0.3)',
  }
} as const;

export default tokens;
