import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@neviso/ui';

const config: Config = {
  presets: [tailwindPreset as Partial<Config>],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
