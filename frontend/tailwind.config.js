/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
        },
        accent: {
          500: '#00bcd4',
          600: '#0097a7',
        },
        success: '#4caf50',
        danger: '#f44336',
        warning: '#ff9800',
      },
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontSize: {
        'xs': '0.75rem',
        'base': '22px',
      }
    },
  },
  plugins: [],
}
