/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        hand: ['var(--font-caveat)', 'cursive'],
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        pink: { 50: '#12202e', 100: '#1c2f42', 200: '#22384f', 400: '#6aa9ff', 600: '#8bbaff', 800: '#b7d9ff', 900: '#eaf3ff' },
        coral: { 50: '#2a1a16', 400: '#ff8a65', 800: '#ffb199' },
        green: { 50: '#132a1c', 400: '#51cf66', 800: '#8ce99a' },
        blue: { 50: '#12202e', 400: '#6aa9ff', 800: '#b7d9ff' },
        amber: { 50: '#2a2213', 400: '#ffa94d', 800: '#ffd08a' },
        purple: { 50: '#201a2e', 400: '#9775fa', 800: '#c9b7fa' },
        teal: { 50: '#0f2620', 400: '#38d9a9', 800: '#8ce8d0' },
        bg: '#0b0e14',
      },
    },
  },
  plugins: [],
};