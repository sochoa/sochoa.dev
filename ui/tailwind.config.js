/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  daisyui: {
    themes: [
      {
        dark: {
          primary: '#00d9ff',
          secondary: '#00ffd1',
          accent: '#ff006e',
          neutral: '#1a1f3a',
          'base-100': '#0a0e27',
          'base-200': '#1a1f3a',
          'base-300': '#242d47',
          'base-content': '#e8ecf1',
        },
      },
      'synthwave',
      'cyberpunk',
      'dracula',
      'night',
      'nord',
      'dim',
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        primary: '#0a0e27',
        secondary: '#1a1f3a',
        tertiary: '#242d47',
        accent: {
          cyan: '#00d9ff',
          teal: '#00ffd1',
          magenta: '#ff006e',
        },
        text: {
          primary: '#e8ecf1',
          secondary: '#8892a6',
          tertiary: '#5a6578',
        },
        border: {
          subtle: '#2d3748',
          accent: '#00d9ff',
        },
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#e8ecf1',
            backgroundColor: 'transparent',
            'h1, h2, h3, h4, h5, h6': {
              color: '#e8ecf1',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
            'a': {
              color: '#00d9ff',
              '&:hover': {
                color: '#00ffd1',
              },
            },
            'code': {
              color: '#00d9ff',
              backgroundColor: '#1a1f3a',
              padding: '2px 6px',
              borderRadius: '4px',
            },
            'pre': {
              backgroundColor: '#1a1f3a',
              color: '#e8ecf1',
              borderRadius: '4px',
            },
            'blockquote': {
              color: '#8892a6',
              borderLeftColor: '#00d9ff',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}
