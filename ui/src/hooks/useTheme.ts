import { useEffect, useState } from 'react'
import { COLOR_PALETTES, applyColorPalette, getPaletteById } from './colorPalettes'

const AVAILABLE_THEMES = [
  'dark',
  'synthwave',
  'cyberpunk',
  'dracula',
  'night',
  'nord',
  'dim',
]

export function useTheme() {
  const [theme, setThemeState] = useState<string>('dim')
  const [palette, setPaletteState] = useState<string>('cyan')

  useEffect(() => {
    // Check if user has saved preferences
    const savedTheme = localStorage.getItem('daisyui-theme')
    const initialTheme = savedTheme && AVAILABLE_THEMES.includes(savedTheme) ? savedTheme : 'dim'

    const savedPalette = localStorage.getItem('color-palette')
    const initialPalette = savedPalette && COLOR_PALETTES.some((p) => p.id === savedPalette) ? savedPalette : 'cyan'

    setThemeState(initialTheme)
    setPaletteState(initialPalette)
    applyTheme(initialTheme)
    applyPalette(initialPalette)
  }, [])

  function applyTheme(themeName: string) {
    // DaisyUI uses data-theme attribute
    document.documentElement.setAttribute('data-theme', themeName)
    localStorage.setItem('daisyui-theme', themeName)
  }

  function applyPalette(paletteId: string) {
    const paletteObj = getPaletteById(paletteId)
    if (paletteObj) {
      applyColorPalette(paletteObj)
      localStorage.setItem('color-palette', paletteId)
    }
  }

  return {
    theme,
    palette,
    setTheme: (newTheme: string) => {
      if (AVAILABLE_THEMES.includes(newTheme)) {
        setThemeState(newTheme)
        applyTheme(newTheme)
      }
    },
    setPalette: (newPalette: string) => {
      if (COLOR_PALETTES.some((p) => p.id === newPalette)) {
        setPaletteState(newPalette)
        applyPalette(newPalette)
      }
    },
    availableThemes: AVAILABLE_THEMES,
    availablePalettes: COLOR_PALETTES,
    isDark: ['dark', 'synthwave', 'cyberpunk', 'dracula', 'night', 'nord', 'dim'].includes(
      theme
    ),
  }
}
