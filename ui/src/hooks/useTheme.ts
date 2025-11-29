import { useEffect, useState } from 'react'

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
  const [theme, setTheme] = useState<string>('dracula')

  useEffect(() => {
    // Check if user has a saved preference, default to dracula
    const saved = localStorage.getItem('daisyui-theme')
    const initialTheme = saved && AVAILABLE_THEMES.includes(saved) ? saved : 'dracula'
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  function applyTheme(themeName: string) {
    // DaisyUI uses data-theme attribute
    document.documentElement.setAttribute('data-theme', themeName)
    localStorage.setItem('daisyui-theme', themeName)
  }

  return {
    theme,
    setTheme: (newTheme: string) => {
      if (AVAILABLE_THEMES.includes(newTheme)) {
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    },
    availableThemes: AVAILABLE_THEMES,
    isDark: ['dark', 'synthwave', 'cyberpunk', 'dracula', 'night', 'nord', 'dim'].includes(
      theme
    ),
  }
}
