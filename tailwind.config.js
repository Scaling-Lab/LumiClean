/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      // Add any custom theme extensions here
      colors: {
        primary: {
          DEFAULT: '#00436C',
          50: '#E6EEF3',
          100: '#CCDDE7',
          200: '#99BBCF',
          300: '#6699B7',
          400: '#33779F',
          500: '#00436C',
          600: '#003658',
          700: '#002844',
          800: '#001B30',
          900: '#000D1C',
        },
        secondary: {
          DEFAULT: '#00B2CB',
          50: '#E6F9FC',
          100: '#CCF3F9',
          200: '#99E7F3',
          300: '#66DBEC',
          400: '#33CFE6',
          500: '#00B2CB',
          600: '#008EA2',
          700: '#006B7A',
          800: '#004751',
          900: '#002429',
        },
        accent: {
          DEFAULT: '#D3000E',
          50: '#FFEBEC',
          100: '#FFD6D9',
          200: '#FFADB3',
          300: '#FF858D',
          400: '#FF5C67',
          500: '#D3000E',
          600: '#A9000B',
          700: '#7F0009',
          800: '#550006',
          900: '#2A0003',
        },
        gold: {
          DEFAULT: '#FFD700',
          50: '#FFFAE6',
          100: '#FFF5CC',
          200: '#FFEB99',
          300: '#FFE066',
          400: '#FFD633',
          500: '#FFD700',
          600: '#CCAC00',
          700: '#998100',
          800: '#665600',
          900: '#332B00',
        },
        gray: {
          DEFAULT: '#191D21',
          50: '#F5F5F6',
          100: '#EAEBED',
          200: '#D5D7DB',
          300: '#C0C3C9',
          400: '#ABAEB7',
          500: '#8E9299',
          600: '#6D717A',
          700: '#4D505A',
          800: '#2E303A',
          900: '#191D21',
        },
      },
      fontFamily: {
        // Add any custom fonts needed
      },
      spacing: {
        // Add any custom spacing values
      },
      // Add slider styles
      '.swiper-slide': {
        transition: 'transform 0.3s ease',
      },
      '.swiper-slide img': {
        width: '100%',
        height: 'auto',
        'object-fit': 'cover',
        'border-radius': '0.5rem',
        'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      '.testimonial-prev, .testimonial-next': {
        background: 'white',
        width: '40px',
        height: '40px',
        'border-radius': '50%',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      },
      '.testimonial-prev:hover, .testimonial-next:hover': {
        transform: 'scale(1.1)',
        background: '#f3f4f6',
      },
      '.swiper-pagination-bullet': {
        width: '8px',
        height: '8px',
        background: '#D1D5DB',
        opacity: '1',
      },
      '.swiper-pagination-bullet-active': {
        background: '#00436C',
      },
      '.swiper-slide': {
        height: 'auto',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
    },
  },
  plugins: [],
} 