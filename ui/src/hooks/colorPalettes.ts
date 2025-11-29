export interface ColorPalette {
  id: string
  name: string
  description: string
  primary: string // cyan, charcoal, warm, cool, etc.
  secondary: string // accent color
  cssVariables: {
    [key: string]: string
  }
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'cyan',
    name: 'Cyan',
    description: 'Bright cyan with purple accents',
    primary: '#00d9ff',
    secondary: '#bb86fc',
    cssVariables: {
      '--accent-cyan': '#00d9ff',
      '--accent-purple': '#bb86fc',
    },
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    description: 'Soft charcoal with slate accents',
    primary: '#a0aec0',
    secondary: '#64748b',
    cssVariables: {
      '--accent-cyan': '#a0aec0',
      '--accent-purple': '#64748b',
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Warm amber with rose accents',
    primary: '#fbbf24',
    secondary: '#f87171',
    cssVariables: {
      '--accent-cyan': '#fbbf24',
      '--accent-purple': '#f87171',
    },
  },
  {
    id: 'cool',
    name: 'Cool',
    description: 'Cool teal with indigo accents',
    primary: '#14b8a6',
    secondary: '#6366f1',
    cssVariables: {
      '--accent-cyan': '#14b8a6',
      '--accent-purple': '#6366f1',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Bright neon pink with lime accents',
    primary: '#ec4899',
    secondary: '#84cc16',
    cssVariables: {
      '--accent-cyan': '#ec4899',
      '--accent-purple': '#84cc16',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep ocean blue with turquoise accents',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    cssVariables: {
      '--accent-cyan': '#0ea5e9',
      '--accent-purple': '#06b6d4',
    },
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    description: 'Bright neon green with magenta accents',
    primary: '#39ff14',
    secondary: '#ff10f0',
    cssVariables: {
      '--accent-cyan': '#39ff14',
      '--accent-purple': '#ff10f0',
    },
  },
]

export function getPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find((p) => p.id === id)
}

export function applyColorPalette(palette: ColorPalette) {
  const root = document.documentElement
  Object.entries(palette.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
