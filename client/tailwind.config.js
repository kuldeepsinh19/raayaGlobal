/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['80px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        hero: ['56px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        headline: ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'xl-body': ['20px', { lineHeight: '1.6' }],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
};
