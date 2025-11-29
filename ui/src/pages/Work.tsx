import { PageContainer, PageHeader, Card, Tag } from '../components/ui'

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
    <PageContainer>
      <PageHeader
        title="Work & Projects"
        subtitle="A selection of projects I've led and contributed to, showcasing my experience in full-stack development, system design, and product delivery."
      />

      <div className="space-y-12">
        {projects.map((project) => (
          <Card key={project.id} variant="default" hover>
            {/* Title */}
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono">
              {project.title}
            </h2>

            {/* Description */}
            <p className="text-text-secondary mb-6">{project.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Problem */}
              <div>
                <h3 className="text-sm font-semibold text-accent-purple uppercase tracking-wider mb-2">
                  Problem
                </h3>
                <p className="text-text-secondary">{project.problem}</p>
              </div>

              {/* Role */}
              <div>
                <h3 className="text-sm font-semibold text-accent-purple uppercase tracking-wider mb-2">
                  My Role
                </h3>
                <p className="text-text-secondary">{project.role}</p>
              </div>

              {/* Outcome */}
              <div>
                <h3 className="text-sm font-semibold text-accent-purple uppercase tracking-wider mb-2">
                  Outcome
                </h3>
                <p className="text-text-secondary">{project.outcome}</p>
              </div>

              {/* Stack */}
              <div>
                <h3 className="text-sm font-semibold text-accent-purple uppercase tracking-wider mb-2">
                  Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <Tag key={tech} variant="outlined">{tech}</Tag>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 pt-6 border-t border-border-subtle/20">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-accent-cyan hover:text-text-primary focus-visible-ring rounded px-2 py-1 transition-colors"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
