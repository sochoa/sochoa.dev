import { useTheme } from '../hooks/useTheme'

export default function ThemeSelector() {
  const { theme, palette, setTheme, setPalette, availableThemes, availablePalettes } = useTheme()

  const getThemeLabel = (t: string) => {
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Dropdown */}
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          className="btn btn-sm btn-ghost gap-2"
          aria-label="Select theme"
          title="Select base theme"
        >
          <span className="text-xs text-text-secondary">{getThemeLabel(theme)}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
        >
          {availableThemes.map((t) => (
            <li key={t}>
              <button
                onClick={() => setTheme(t)}
                className={theme === t ? 'active' : ''}
                aria-current={theme === t ? 'true' : 'false'}
              >
                {getThemeLabel(t)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Palette Dropdown */}
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          className="btn btn-sm btn-ghost gap-2"
          aria-label="Select color palette"
          title="Select color palette"
        >
          <span className="text-xs text-text-secondary">{availablePalettes.find(p => p.id === palette)?.name}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-56"
        >
          {availablePalettes.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setPalette(p.id)}
                className={palette === p.id ? 'active' : ''}
                aria-current={palette === p.id ? 'true' : 'false'}
                title={p.description}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: p.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: p.secondary }}
                    />
                  </div>
                  <span>{p.name}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
