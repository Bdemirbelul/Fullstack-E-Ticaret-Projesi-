import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(16,24,40,0.08)',
        soft2: '0 8px 20px rgba(16,24,40,0.10)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
} satisfies Config

