/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#3b82f6',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'rgb(51 65 85 / var(--tw-text-opacity))',
            'h1, h2, h3, h4, h5, h6': {
              color: 'rgb(15 23 42 / var(--tw-text-opacity))',
            },
            'a': {
              color: 'rgb(59 130 246 / var(--tw-text-opacity))',
              '&:hover': {
                color: 'rgb(37 99 235 / var(--tw-text-opacity))',
              },
            },
            'code': {
              color: 'rgb(55 65 81 / var(--tw-text-opacity))',
              backgroundColor: 'rgb(243 244 246 / var(--tw-bg-opacity))',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
