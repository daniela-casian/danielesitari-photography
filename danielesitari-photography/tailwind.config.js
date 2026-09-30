/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1E8',
        brown: {
          dark: '#3D2817',
          medium: '#6B4E37',
          light: '#D4C4B0',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
        montecarlo: ['Monte Carlo', 'cursive'],
      },
    },
  },
  plugins: [],
}
