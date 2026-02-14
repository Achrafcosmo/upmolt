import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'um-bg': '#0a0a0b',
        'um-card': '#141416',
        'um-border': '#222228',
        'um-purple': '#8b5cf6',
        'um-pink': '#d946ef',
        'um-cyan': '#06b6d4',
      },
    },
  },
  plugins: [],
}
export default config
