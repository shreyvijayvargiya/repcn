import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        success: 'var(--success)',
        folder: 'var(--folder)',
        'code-bg': 'var(--code-bg)',
      },
    },
  },
  plugins: [],
}

export default config
