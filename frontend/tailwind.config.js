/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        sage: {
          50: '#F4F6F4',
          100: '#E5EBE5',
          200: '#CBD7CC',
          300: '#A7BCA9',
          400: '#7B9B7E',
          500: '#526B55',
          600: '#425745',
          700: '#344436',
          800: '#2A362C',
          900: '#232D24',
        },
        paper: {
          50: '#FCFBF8',
          100: '#F8F7F2',
          200: '#EFECE3',
          300: '#E5E0D4',
          400: '#D2CBB9',
          500: '#B6AB93',
        },
        charcoal: {
          50: '#F5F5F4',
          100: '#E7E6E4',
          200: '#CFCCC8',
          300: '#AFA9A3',
          400: '#78736B',
          500: '#524F49',
          600: '#3F3C37',
          700: '#2E2B27',
          800: '#252923',
          900: '#1A1C19',
        }
      }
    },
  },
  plugins: [],
}
