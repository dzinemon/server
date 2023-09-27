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
      // colors: {
      //   "blue": '#4791CE',
      //   "indigo": '#6610f2',
      //   "purple": '#6f42c1',
      //   "pink": '#e83e8c',
      //   "red": '#dc3545',
      //   "orange": '#fd7e14',
      //   "yellow": '#ffc107',
      //   "green": '#28a745',
      //   "teal": '#20c997',
      //   "cyan": '#17a2b8',
      //   "white": '#fff',
      //   "gray": '#6c757d',
      //   "gray-dark": '#343a40',
      //   "primary": '#4791CE',
      //   "secondary": '#6c757d',
      //   "success": '#28a745',
      //   "info": '#267fb1',
      //   "warning": '#ffc107',
      //   "danger": '#dc3545',
      //   "light": '#f8f9fa',
      //   "dark": '#343a40',
      // },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
