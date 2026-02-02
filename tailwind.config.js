/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': 'var(--terminal-bg)',
        'terminal-surface': 'var(--terminal-surface)',
        'terminal-border': 'var(--terminal-border)',
        'terminal-text': 'var(--terminal-text)',
        'terminal-muted': 'var(--terminal-muted)',
        'terminal-violet': 'var(--terminal-violet)',
        'terminal-violet-light': 'var(--terminal-violet-light)',
        'terminal-violet-dark': 'var(--terminal-violet-dark)',
        'terminal-green': 'var(--terminal-green)',
        'terminal-red': 'var(--terminal-red)',
        'terminal-yellow': 'var(--terminal-yellow)',
        'terminal-cyan': 'var(--terminal-cyan)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}