export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border-subtle bg-primary py-8 mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-text-tertiary">
            © {currentYear} sochoa. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com"
              className="text-text-secondary hover:text-accent-cyan focus-visible-ring rounded px-2 py-1 text-sm transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              className="text-text-secondary hover:text-accent-cyan focus-visible-ring rounded px-2 py-1 text-sm transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
