import { PageContainer, Section, Card, Tag } from '../components/ui'

export default function About() {
  const timeline = [
    {
      year: '2023',
      title: 'Senior Software Engineer',
      company: 'Tech Company',
      description: 'Led development of core platform features, mentored junior engineers.',
    },
    {
      year: '2021',
      title: 'Full Stack Developer',
      company: 'StartUp Inc',
      description: 'Built and shipped customer-facing products, improved system performance.',
    },
    {
      year: '2019',
      title: 'Software Engineer',
      company: 'Early Stage Startup',
      description: 'Contributed to product development across frontend and backend.',
    },
  ]

  const expertise = [
    { category: 'Backend', skills: ['Go', 'Node.js', 'Python', 'PostgreSQL', 'Redis'] },
    { category: 'Frontend', skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js'] },
    { category: 'Infrastructure', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
    { category: 'Specialties', skills: ['System Design', 'Performance Optimization', 'Mentoring'] },
  ]

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Headshot Placeholder */}
          <div className="md:col-span-1">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center">
              <span className="text-text-primary text-6xl">👤</span>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-accent-purple mb-4 font-mono">
              About Me
            </h1>
            <p className="text-lg text-text-secondary mb-4">
              Hi! I'm a software engineer with a passion for building things that matter.
              I specialize in full-stack development, system design, and helping teams ship
              great products.
            </p>
            <p className="text-lg text-text-secondary mb-4">
              When I'm not coding, you'll find me writing about technology, mentoring junior
              developers, or exploring new ideas. I believe in clean code, good documentation,
              and making technology accessible to everyone.
            </p>
            <p className="text-lg text-text-secondary">
              Currently focused on building scalable systems and contributing to open source
              projects that make a real difference.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <Section title="Core Values" spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono">
              Quality
            </h3>
            <p className="text-text-secondary">
              I believe in writing code that's not just functional, but also maintainable,
              tested, and well-documented.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono">
              Collaboration
            </h3>
            <p className="text-text-secondary">
              The best solutions come from diverse perspectives. I thrive in collaborative
              environments where ideas are shared openly.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono">
              Impact
            </h3>
            <p className="text-text-secondary">
              I focus on building solutions that solve real problems and create tangible
              value for users and businesses.
            </p>
          </Card>
        </div>
      </Section>

      {/* Expertise Section */}
      <Section title="Expertise" spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {expertise.map((group) => (
            <div key={group.category}>
              <h3 className="text-lg font-semibold text-text-primary mb-4 font-mono">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Timeline Section */}
      <Section title="Experience" spacing="normal">
        <div className="space-y-8">
          {timeline.map((item, index) => (
            <div key={index} className="border-l-4 border-accent-cyan pl-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary font-mono">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.company}
                  </p>
                </div>
                <span className="text-sm font-medium text-accent-purple">
                  {item.year}
                </span>
              </div>
              <p className="text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>
    </PageContainer>
  )
}
