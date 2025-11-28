import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible-ring"
      >
        Go Home
      </Link>
    </div>
  )
}
