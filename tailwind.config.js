/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1F3A2E',
          50: '#EEF2EF',
          100: '#D7E1D9',
          200: '#B0C3B4',
          300: '#88A58F',
          400: '#5A7F63',
          500: '#365E42',
          600: '#274A32',
          700: '#1F3A2E',
          800: '#152820',
          900: '#0C1712',
        },
        cream: {
          DEFAULT: '#F7F2E9',
          50: '#FFFFFF',
          100: '#FBF8F1',
          200: '#F7F2E9',
          300: '#EFE6D3',
        },
        sand: '#E7DCC3',
        gold: {
          DEFAULT: '#A9873F',
          light: '#C9A961',
          dark: '#8A6D2F',
        },
        charcoal: '#26241F',
        clay: '#B5654A',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,58,46,0.06), 0 8px 24px -12px rgba(31,58,46,0.18)',
        lift: '0 12px 32px -12px rgba(31,58,46,0.28)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        shimmer: 'shimmer 1.6s infinite linear',
        scan: 'scan 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
