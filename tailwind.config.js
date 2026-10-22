// Run `npm run build:css` after changing Tailwind classes in any page; it writes assets/site.css.
export default {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#091B33', raised: '#0F2547', line: '#1D3559' },
        royal: { DEFAULT: '#1A73E8', deep: '#155FC2' },
        teal: { DEFAULT: '#10B981' },
        mist: '#A9B8D0',
        paper: '#F3F6FB',
        ink: '#091B33',
        slate: '#4A5B76',
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
