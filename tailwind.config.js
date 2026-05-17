/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50:  '#fafaf7',
          100: '#f5f3ee',
          200: '#ede9e1',
          300: '#ddd8ce',
          400: '#c5bfb3',
          500: '#a89f93',
          600: '#8a8078',
          700: '#6b6360',
          800: '#4d4845',
          900: '#2e2b28',
          950: '#1a1815',
        },
        accent: {
          DEFAULT: '#c2611f',
          50:  '#fdf3ec',
          100: '#fbe4cf',
          200: '#f5c79f',
          300: '#eda36b',
          400: '#e37f3c',
          500: '#c2611f',
          600: '#a3511a',
          700: '#7f3f14',
          800: '#5c2d0e',
          900: '#3a1c09',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
