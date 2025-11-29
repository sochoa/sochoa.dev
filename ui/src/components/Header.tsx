import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const navLinkClass = (path: string) => {
    const baseClass = 'text-sm transition-colors focus-visible-ring rounded px-2 py-1'
    const activeClass = isActive(path) ? 'text-accent-cyan' : 'text-text-secondary hover:text-accent-cyan'
    return `${baseClass} ${activeClass}`
  }

  return (
    <header className="border-b border-border-subtle/30 bg-primary/40 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-bold text-text-primary hover:text-accent-cyan transition-colors focus-visible-ring rounded px-2 py-1"
        >
          <span className="text-accent-cyan">&gt;</span> sochoa.dev
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/about" className={navLinkClass('/about')}>
            About
          </Link>
          <Link to="/work" className={navLinkClass('/work')}>
            Work
          </Link>
          <Link to="/blog" className={navLinkClass('/blog')}>
            Blog
          </Link>
          <Link to="/guestbook" className={navLinkClass('/guestbook')}>
            Guestbook
          </Link>
          <Link to="/contact" className={navLinkClass('/contact')}>
            Contact
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-border-subtle/30">
              <span className="text-xs text-text-secondary">{user.email}</span>
              <button
                onClick={logout}
                className="text-xs text-text-secondary hover:text-accent-cyan transition-colors focus-visible-ring rounded px-2 py-1"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs text-text-secondary hover:text-accent-cyan transition-colors focus-visible-ring rounded px-2 py-1"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
