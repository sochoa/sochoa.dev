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
        // Use DaisyUI CSS variables for theme-aware colors
        // These automatically update when data-theme changes
        primary: 'hsl(var(--p) / <alpha-value>)',
        secondary: 'hsl(var(--s) / <alpha-value>)',
        tertiary: 'hsl(var(--b3) / <alpha-value>)',
        accent: {
          // Primary accent: cyan for links, hovers, interactive elements
          // Uses custom CSS variable set by palette system
          cyan: 'var(--accent-cyan)',
          // Secondary accent: purple for headings and metadata (used sparingly)
          // Uses custom CSS variable set by palette system
          purple: 'var(--accent-purple)',
        },
        text: {
          primary: 'hsl(var(--bc) / <alpha-value>)',
          secondary: 'hsl(var(--bc) / 0.7)',
          tertiary: 'hsl(var(--bc) / 0.5)',
        },
        border: {
          subtle: 'hsl(var(--b2) / <alpha-value>)',
          accent: 'var(--accent-cyan)',
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
            // Use CSS variables so typography changes with theme
            color: 'hsl(var(--bc))',
            backgroundColor: 'transparent',
            'h1, h2, h3, h4, h5, h6': {
              color: 'hsl(var(--bc))',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
            'a': {
              color: 'hsl(var(--a))',
              '&:hover': {
                color: '#00ffd1', // Teal accent on hover
              },
            },
            'code': {
              color: 'hsl(var(--a))',
              backgroundColor: 'hsl(var(--b2))',
              padding: '2px 6px',
              borderRadius: '4px',
            },
            'pre': {
              backgroundColor: 'hsl(var(--b2))',
              color: 'hsl(var(--bc))',
              borderRadius: '4px',
            },
            'blockquote': {
              color: 'hsl(var(--bc) / 0.7)',
              borderLeftColor: 'hsl(var(--a))',
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
