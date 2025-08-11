/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ecff',
          500: '#1d6fd8',
          600: '#145db8',
          700: '#0d4b94'
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
