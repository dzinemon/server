/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '960px', // add required value here
          },
        },
      },
      colors: {
        kruze: {
          blue: '#4791CE',
          secondary: '#59595b',
          dark: '#434344',
          light: '#f8f9fa',
          blueLight: '#02ABE3',
          blueDark: '#024D7C',
          danger: '#D9534F',
          warning: '#F0AD4E',
          success: '#4cae4c',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
