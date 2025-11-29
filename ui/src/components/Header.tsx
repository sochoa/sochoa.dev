import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAuthStore } from '../stores/authStore'

export default function Header() {
  const { isDark, toggle } = useTheme()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-slate-900 dark:text-white focus-visible-ring rounded"
        >
          sochoa.dev
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible-ring rounded px-2 py-1"
          >
            Home
          </Link>
          <Link
            to="/blog"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible-ring rounded px-2 py-1"
          >
            Blog
          </Link>
          <Link
            to="/guestbook"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible-ring rounded px-2 py-1"
          >
            Guestbook
          </Link>
          <Link
            to="/contact"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible-ring rounded px-2 py-1"
          >
            Contact
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible-ring rounded px-2 py-1 text-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible-ring rounded px-2 py-1 text-sm"
            >
              Sign in
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus-visible-ring"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  )
}
