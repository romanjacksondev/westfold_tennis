/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      rolandGarrosRed: '#BB4915',
      rolandGarrosOrange: '#D06B28',
      primary: '#AAC0C7',
      secondary: '#8EB4C0',
      tertiary: '#F0F6FA',
      cta: '#EC0039',
      success: '#4EC291',
      error: '#F52046',
      disabled: '#AAB4BD',
      'disabled-gray': '#D0D0D0',
      hover: '#D60033',
      focus: '#6395AA',
      black: '#131313',
      white: '#FFFFFF',
      gray: {
        600: '#414141',
        500: '#929292',
        400: '#C8C8C8',
        300: '#E8E8E8',
        200: '#F3F3F3',
        100: '#F9F9F9',
      },
      red: {
        300: '#EA1D25',
        400: '#EA1D25',
        500: '#EA1D25',
      },
      border: '#B7B7B7',
      'input-border': '#B2D2DF',
      input: '#3F8EAF',
      link: '#3F8EAF',
      subtitle: '#69717A',
      placeholder: '#808B95',
    },
  extend: {
    screens: {
      'mobile-xs': { raw: '(min-width: 280px)' },
      'mobile-sm': { raw: '(min-width: 320px)' },
      'mobile-md': { raw: '(min-width: 360px)' },
      'mobile-lg': { raw: '(min-width: 480px)' },
      'sm-h': { raw: '(min-height: 768px)' },
      'md-h': { raw: '(min-height: 900px)' },
      'lg-h': { raw: '(min-height: 1080px)' },
    },
  }}
}

