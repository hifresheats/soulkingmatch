/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
      },
      colors: {
        royal: {
          50: '#faf5eb',
          100: '#f3e6c8',
          200: '#e9d092',
          300: '#dab55c',
          400: '#d4a439',
          500: '#c68f1d',
          600: '#a87716',
          700: '#8a5f12',
          800: '#6c4a0e',
          900: '#4e350a',
        },
      },
    },
  },
  plugins: [],
};
