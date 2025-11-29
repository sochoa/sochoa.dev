export default function Work() {
  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform Redesign',
      problem:
        'Legacy platform suffered from slow load times and poor user experience, leading to high cart abandonment rates.',
      role: 'Lead Backend Engineer',
      stack: ['Go', 'PostgreSQL', 'Redis', 'Kubernetes'],
      outcome: '40% improvement in page load time, 25% reduction in cart abandonment.',
      description:
        'Redesigned the backend API for scalability, implemented caching layer, and optimized database queries.',
      links: [
        { label: 'Case Study', href: '#' },
        { label: 'Live Site', href: '#' },
      ],
    },
    {
      id: 2,
      title: 'Real-Time Analytics Dashboard',
      problem:
        'Business lacked visibility into real-time data, making it difficult to respond to market changes quickly.',
      role: 'Full Stack Engineer',
      stack: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'TimescaleDB'],
      outcome: 'Enabled real-time insights, reduced decision-making time from days to hours.',
      description:
        'Built a real-time dashboard with live data updates, implemented data pipeline, and created performance monitoring.',
      links: [
        { label: 'Demo', href: '#' },
        { label: 'GitHub', href: '#' },
      ],
    },
    {
      id: 3,
      title: 'Microservices Migration',
      problem:
        'Monolithic architecture became a bottleneck for scaling, slowing down feature development.',
      role: 'Senior Engineer & Architecture Lead',
      stack: ['Go', 'Docker', 'Kubernetes', 'gRPC', 'PostgreSQL'],
      outcome: 'Reduced deployment time by 80%, enabled independent service scaling.',
      description:
        'Led migration of monolithic system to microservices, implemented service discovery, and set up CI/CD pipeline.',
      links: [
        { label: 'Architecture', href: '#' },
        { label: 'Lessons Learned', href: '#' },
      ],
    },
    {
      id: 4,
      title: 'Developer Portal',
      problem:
        'Third-party developers struggled to integrate with API due to poor documentation and limited tools.',
      role: 'Full Stack Developer',
      stack: ['React', 'Next.js', 'TypeScript', 'GraphQL', 'Node.js'],
      outcome:
        'Increased third-party integrations by 300%, improved time-to-integration from weeks to days.',
      description:
        'Created comprehensive developer portal with API documentation, code examples, SDKs, and sandbox environment.',
      links: [
        { label: 'Portal', href: '#' },
        { label: 'Docs', href: '#' },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Work & Projects
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          A selection of projects I've led and contributed to, showcasing my experience in
          full-stack development, system design, and product delivery.
        </p>
      </section>

      {/* Projects Grid */}
      <div className="space-y-12">
        {projects.map((project) => (
          <article
            key={project.id}
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {project.title}
            </h2>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300 mb-6">{project.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Problem */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Problem
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{project.problem}</p>
              </div>

              {/* Role */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  My Role
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{project.role}</p>
              </div>

              {/* Outcome */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Outcome
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{project.outcome}</p>
              </div>

              {/* Stack */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded px-2 py-1"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
