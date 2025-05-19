/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "manhood-reboot/index.html",
    "./manhood-reboot/**/*.html",
    "./manhood-reboot/src/**/*.{js,css}",
    "young-at-52/index.html",
    "./young-at-52/**/*.html",
    "./young-at-52/src/**/*.{js,css}",
    "saved-my-marriage/index.html",
    "./saved-my-marriage/**/*.html",
    "./saved-my-marriage/src/**/*.{js,css}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "#dc2626", // Red-600
        "accent-dark": "#b91c1c", // Red-700
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 