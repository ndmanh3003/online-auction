/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.hbs",
    "./public/**/*.html",
    "./public/**/*.js",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      },
      borderRadius: {
        'sm': '1rem',
        'DEFAULT': '1.5rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '2.5rem',
        '2xl': '3rem',
        '3xl': '3.5rem',
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
