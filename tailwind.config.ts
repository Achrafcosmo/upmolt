import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'um-bg': '#0A0E1A',
        'um-card': '#111827',
        'um-border': '#1F2937',
        'um-purple': '#CC3333',
        'um-pink': '#991B1B',
        'um-cyan': '#E85D4A',
      },
    },
  },
  plugins: [],
}
export default config
