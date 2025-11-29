import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAuthStore } from '../stores/authStore'

export default function Header() {
  const { isDark, toggle } = useTheme()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="border-b border-border-subtle bg-primary">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-bold text-text-primary hover-text-accent focus-visible-ring rounded px-2 py-1"
        >
          sochoa.dev
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-sm"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-sm"
          >
            About
          </Link>
          <Link
            to="/work"
            className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-sm"
          >
            Work
          </Link>
          <Link
            to="/blog"
            className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-sm"
          >
            Blog
          </Link>
          <Link
            to="/guestbook"
            className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-sm"
          >
            Guestbook
          </Link>
          <Link
            to="/contact"
            className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-sm"
          >
            Contact
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-4 border-l border-border-subtle">
              <span className="text-xs text-text-secondary">{user.email}</span>
              <button
                onClick={logout}
                className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-xs"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-text-secondary hover-text-accent focus-visible-ring rounded px-2 py-1 text-xs"
            >
              Sign in
            </Link>
          )}

          {/* Theme Toggle - text instead of emoji */}
          <button
            onClick={toggle}
            className="ml-2 px-3 py-1 text-xs text-text-secondary bg-secondary rounded border border-border-subtle hover:border-border-accent hover:text-accent-cyan focus-visible-ring transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            [{isDark ? 'light' : 'dark'}]
          </button>
        </div>
      </nav>
    </header>
  )
}
