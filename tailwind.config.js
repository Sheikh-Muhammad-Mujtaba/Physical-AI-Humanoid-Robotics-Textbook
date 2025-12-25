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
        'chat-green': {
          light: '#1cd98e',
          dark: '#d8b4fe',
          accent: '#15a860',
          darkAccent: '#a855f7',
        },
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'slide-up': 'slideUp 300ms ease-out forwards',
        'message-enter': 'messageEnter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        messageEnter: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // CRITICAL: This prevents Tailwind from breaking Docusaurus styles
  },
  darkMode: ['class', '[data-theme="dark"]'], // Integrates with Docusaurus dark mode
}