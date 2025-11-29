import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Hey, I'm sochoa
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
          Software engineer, writer, and builder. I create things that matter.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/about"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible-ring"
          >
            About Me
          </Link>
          <Link
            to="/work"
            className="inline-block px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 focus-visible-ring"
          >
            View Work
          </Link>
          <Link
            to="/blog"
            className="inline-block px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 focus-visible-ring"
          >
            Read Blog
          </Link>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 focus-visible-ring"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Featured Work */}
      <section className="mb-16">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Featured Work
          </h2>
          <Link
            to="/work"
            className="text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Project {item}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Description of the project and the impact it made.
              </p>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Latest Posts
        </h2>
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="border-b border-slate-200 dark:border-slate-800 pb-6"
            >
              <Link
                to={`/blog/post-${item}`}
                className="text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus-visible-ring rounded"
              >
                Blog Post Title {item}
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                December {item}, 2024
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-3">
                A brief excerpt of the blog post to entice readers...
              </p>
            </article>
          ))}
        </div>
        <Link
          to="/blog"
          className="inline-block mt-8 text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded"
        >
          View all posts →
        </Link>
      </section>
    </div>
  )
}
