/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        teal: { 900: '#0B3B37', 700: '#0F766E', 600: '#128077', 500: '#14B8A6', 400: '#2DD4BF', 100: '#D8F5EE' },
      },
    },
  },
  plugins: [],
};