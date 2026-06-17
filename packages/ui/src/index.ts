/**
 * Shared Tailwind preset for Neviso (ARD §3.2.1 design tokens).
 *
 * Colors reference the CSS variables defined in `@neviso/ui/tokens.css`, so the
 * single source of truth for actual hex values is that file. The web and admin
 * apps add this preset to their Tailwind config and import the tokens CSS once.
 *
 * The Vazirmatn font is loaded per-app via `next/font/local` (self-hosted, no
 * CDN) and exposed as `--font`; the preset just wires the family token.
 */
import type { Config } from 'tailwindcss';
import rtl from 'tailwindcss-rtl';

const v = (name: string) => `var(--${name})`;

export const tailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: v('paper'), 2: v('paper-2'), edge: v('paper-edge') },
        card: { DEFAULT: v('card'), soft: v('card-soft') },
        ink: { DEFAULT: v('ink'), 2: v('ink-2'), 3: v('ink-3'), 4: v('ink-4') },
        saffron: { DEFAULT: v('saffron'), deep: v('saffron-deep'), soft: v('saffron-soft') },
        slate: { DEFAULT: v('slate'), 2: v('slate-2') },
        sage: { DEFAULT: v('sage'), soft: v('sage-soft') },
        ruby: { DEFAULT: v('ruby'), soft: v('ruby-soft') },
        indigo: { DEFAULT: v('indigo'), soft: v('indigo-soft') },
      },
      fontFamily: {
        sans: [v('font'), 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        's-1': v('s-1'),
        's-2': v('s-2'),
        's-3': v('s-3'),
        's-4': v('s-4'),
        's-5': v('s-5'),
        's-6': v('s-6'),
        's-7': v('s-7'),
        's-8': v('s-8'),
      },
      borderRadius: {
        xs: v('r-xs'),
        sm: v('r-sm'),
        md: v('r-md'),
        lg: v('r-lg'),
        xl: v('r-xl'),
      },
      boxShadow: {
        1: v('sh-1'),
        2: v('sh-2'),
        3: v('sh-3'),
        spine: v('sh-spine'),
      },
    },
  },
  plugins: [rtl as never],
};

export default tailwindPreset;
