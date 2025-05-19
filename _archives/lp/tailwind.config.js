/**
 * Tailwind configuration for the LumiClean landing page.
 * Scans all HTML and JS files inside lp folder to tree-shake unused utilities.
 */
module.exports = {
  content: [
    './index.html',
    './**/*.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#F5FBFE',
          500: '#1773B0',
        }
      }
    }
  },
  plugins: []
}; 