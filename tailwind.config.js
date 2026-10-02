/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FCF9EE',
          100: '#F7EFCF',
          200: '#EEDD9E',
          300: '#E3C769',
          400: '#D8B23E',
          500: '#C59A27',
          600: '#A87D1B',
          700: '#855E15',
          800: '#6B4916',
          900: '#583C15',
        }
      }
    },
  },
  plugins: [],
}
