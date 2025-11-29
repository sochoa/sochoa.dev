import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="mb-20">
        <h1 className="text-5xl sm:text-6xl font-bold text-text-primary mb-4 leading-tight">
          Hey, I'm sochoa
        </h1>
        <p className="text-lg text-text-secondary mb-8 max-w-2xl leading-relaxed">
          Software engineer, writer, and builder. I create things that matter.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/about"
            className="inline-block px-6 py-2 bg-accent-cyan text-primary font-medium rounded border border-accent-cyan hover:bg-transparent hover:text-accent-cyan focus-visible-ring transition-all"
          >
            About Me
          </Link>
          <Link
            to="/work"
            className="inline-block px-6 py-2 border border-border-subtle text-text-primary rounded hover:border-border-accent hover:text-accent-cyan focus-visible-ring transition-colors"
          >
            View Work
          </Link>
          <Link
            to="/blog"
            className="inline-block px-6 py-2 border border-border-subtle text-text-primary rounded hover:border-border-accent hover:text-accent-cyan focus-visible-ring transition-colors"
          >
            Read Blog
          </Link>
          <Link
            to="/contact"
            className="inline-block px-6 py-2 border border-border-subtle text-text-primary rounded hover:border-border-accent hover:text-accent-cyan focus-visible-ring transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Featured Work */}
      <section className="mb-20">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-2xl font-bold text-text-primary">
            Featured Work
          </h2>
          <Link
            to="/work"
            className="text-accent-cyan hover:text-accent-teal focus-visible-ring rounded text-sm transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="border border-border-subtle bg-secondary rounded p-6 hover:border-border-accent hover:shadow-subtle-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Project {item}
              </h3>
              <p className="text-text-secondary mb-4 text-sm">
                Description of the project and the impact it made.
              </p>
              <a
                href="#"
                className="text-accent-cyan hover:text-accent-teal focus-visible-ring rounded text-sm transition-colors inline-block"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-8">
          Latest Posts
        </h2>
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="pb-6 border-b border-border-subtle last:border-b-0"
            >
              <Link
                to={`/blog/post-${item}`}
                className="text-lg font-semibold text-text-primary hover:text-accent-cyan focus-visible-ring rounded transition-colors"
              >
                Blog Post Title {item}
              </Link>
              <p className="text-xs text-text-tertiary mt-2">
                December {item}, 2024
              </p>
              <p className="text-text-secondary mt-3 text-sm">
                A brief excerpt of the blog post to entice readers...
              </p>
            </article>
          ))}
        </div>
        <Link
          to="/blog"
          className="inline-block mt-8 text-accent-cyan hover:text-accent-teal focus-visible-ring rounded text-sm transition-colors"
        >
          View all posts →
        </Link>
      </section>
    </div>
  )
}
