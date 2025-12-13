/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./docs/**/*.{md,mdx}",
    "./blog/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--ifm-color-primary)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // CRITICAL: This prevents Tailwind from breaking Docusaurus styles
  },
  darkMode: ['class', '[data-theme="dark"]'], // Integrates with Docusaurus dark mode
}