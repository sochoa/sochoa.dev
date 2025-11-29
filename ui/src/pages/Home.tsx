import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-32">
      {/* Hero Section */}
      <section className="mb-32 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Text content */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-sm font-medium text-accent-purple uppercase tracking-wide">
              Full-stack developer
            </p>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Hey, I'm sochoa
          </h1>
          <p className="text-lg text-text-secondary mb-8 max-w-xl leading-relaxed">
            Software engineer, writer, and builder. I create things that matter—from elegant code to thoughtful experiences.
          </p>
        </div>

        {/* Right: Now card */}
        <div className="lg:col-span-1 lg:mt-4">
          <div className="p-6 bg-secondary/50 border border-accent-cyan/20 rounded-xl backdrop-blur-sm">
            <p className="text-xs font-semibold text-accent-purple uppercase tracking-wide mb-3">
              Now
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-tertiary">Location</p>
                <p className="text-text-primary font-medium">San Francisco, CA</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Focus</p>
                <p className="text-text-primary font-medium">Building in public</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Status</p>
                <p className="text-text-primary font-medium">Open to collab</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-border-subtle/20 mb-32" />

      {/* Featured Work */}
      <section className="mb-32">
        <div className="flex justify-between items-baseline mb-12">
          <h2 className="text-3xl font-bold text-accent-purple">
            Featured Work
          </h2>
          <Link
            to="/work"
            className="text-accent-cyan hover:text-text-primary focus-visible-ring rounded text-sm transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="group relative bg-secondary/40 border border-accent-cyan/20 rounded-2xl p-8 transition-all duration-300 hover:border-accent-cyan/50"
              style={{
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.05)',
              }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(0, 217, 255, 0.1)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent-cyan transition-colors">
                  Project {item}
                </h3>
                <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                  Description of the project and the impact it made.
                </p>
                <a
                  href="#"
                  className="text-accent-cyan hover:text-text-primary focus-visible-ring rounded text-sm transition-colors inline-block"
                >
                  Learn more →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <h2 className="text-3xl font-bold text-accent-purple mb-12">
          Latest Posts
        </h2>
        <div className="space-y-8">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="pb-8 border-b border-border-subtle/20 last:border-b-0"
            >
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <Link
                  to={`/blog/post-${item}`}
                  className="text-xl font-semibold text-text-primary hover:text-accent-cyan focus-visible-ring rounded transition-colors"
                >
                  Blog Post Title {item}
                </Link>
                <p className="text-sm text-accent-purple font-medium whitespace-nowrap">
                  December {item}, 2024
                </p>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                A brief excerpt of the blog post to entice readers and showcase the key ideas discussed in the full article...
              </p>
            </article>
          ))}
        </div>
        <Link
          to="/blog"
          className="inline-block mt-12 text-accent-cyan hover:text-accent-teal focus-visible-ring rounded text-sm transition-colors font-medium"
        >
          View all posts →
        </Link>
      </section>
    </div>
  )
}
