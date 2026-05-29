import type { Config } from 'tailwindcss';

/**
 * Neviso design tokens (from Ui_sample.html / frontend skill).
 * Use semantic token names, never hardcoded hex, in components.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FAF6EC', 2: '#F2EBD9', edge: '#E7DEC4' },
        card: { DEFAULT: '#FFFFFF', soft: '#FDFBF5' },
        ink: { DEFAULT: '#1B1B1F', 2: '#3B3A3F', 3: '#6A6766', 4: '#9C9690' },
        saffron: { DEFAULT: '#E8A53D', deep: '#B97A1E', soft: '#FBEACB' },
        slate: { DEFAULT: '#1F2937', 2: '#2D3748' },
        sage: { DEFAULT: '#6B8B6E', soft: '#DFEAD9' },
        ruby: { DEFAULT: '#B0413E', soft: '#F6DEDC' },
        indigo: { DEFAULT: '#455A8F', soft: '#DDE3F0' },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        's-1': '4px',
        's-2': '8px',
        's-3': '12px',
        's-4': '16px',
        's-5': '24px',
        's-6': '32px',
        's-7': '48px',
        's-8': '64px',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        1: '0 1px 2px rgba(31,27,18,0.06)',
        2: '0 2px 8px rgba(31,27,18,0.08), 0 1px 2px rgba(31,27,18,0.04)',
        3: '0 12px 32px -8px rgba(31,27,18,0.18), 0 4px 12px rgba(31,27,18,0.06)',
        spine: '0 6px 16px -4px rgba(60,40,10,0.22), inset -1px 0 0 rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
