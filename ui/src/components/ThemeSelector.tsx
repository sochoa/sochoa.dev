import { useTheme } from '../hooks/useTheme'

export default function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme()

  const getThemeLabel = (t: string) => {
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-sm btn-ghost gap-2"
        aria-label="Select theme"
      >
        <span className="text-sm">[{theme}]</span>
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
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
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
  )
}
