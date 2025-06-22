/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 10s linear infinite',
      },
      colors: {
        primary: {
          DEFAULT: '#0098EB', // Your new blue
          50: '#E0F4FF',
          100: '#B3E2FF',
          200: '#80CEFF',
          300: '#4DBAFF',
          400: '#1AA7FF',
          500: '#0098EB',
          600: '#007AC2',
          700: '#005D99',
          800: '#004070',
          900: '#002447',
        },
        accent: {
          DEFAULT: '#EB5300', // Your new orange
          50: '#FFEDE0',
          100: '#FFD3B3',
          200: '#FFB580',
          300: '#FF964D',
          400: '#FF781A',
          500: '#EB5300',
          600: '#C44600',
          700: '#9D3900',
          800: '#762C00',
          900: '#4F1F00',
        },
      },
    },
  },
  plugins: [],
}
