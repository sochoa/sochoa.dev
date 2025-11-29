import { PageContainer, Section, Card, Tag } from '../components/ui'

export default function About() {
  const timeline = [
    {
      year: '2025',
      title: 'Senior Systems Engineer',
      company: 'Global Cloud Infrastructure Company',
      description:
        'Focused on large-scale systems reliability, security workflows, and infrastructure automation across hundreds of technical sites.',
    },
    {
      year: '2021',
      title: 'Lead Software Engineer',
      company: 'Enterprise Software Platform Provider',
      description:
        'Designed and delivered distributed deployment systems, improved CI/CD workflows, and provided technical mentorship across engineering teams.',
    },
    {
      year: '2017',
      title: 'Principal Engineer',
      company: 'Global Cloud Services Provider',
      description:
        'Built access control, security, and orchestration services used across large-scale cloud environments, and led compliance and automation initiatives.',
    },
  ]

  const expertise = [
    { category: 'Backend', skills: ['PostgreSQL', 'Redis', 'Memcache'] },
    { category: 'Frontend', skills: ['React', 'TypeScript', 'TailwindCSS'] },
    { category: 'Infrastructure', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
    { category: 'Languages', skills: ['Go', 'Javascript/Typescript', 'Python', 'Bash', 'Java', 'Ruby', 'Powershell'] },
    { category: 'Specialties', skills: ['Systems Design', 'Security Engineering', 'Mentoring'] },
    { category: 'Configuration', skills: ['Chef', 'Puppet', 'Ansible', 'Salt'] },
  ]

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* Bio */}
          <div className="md:col-span-4">
            <h1 className="text-4xl font-bold text-accent-purple mb-4 font-mono">
              About Me
            </h1>
            <p className="text-lg text-text-secondary mb-2">
                I am an experienced software, systems, security, and infrastructure engineer.  My work spans
                distributed backend services, infrastructure automation, cloud native systems, security
                infrastructure, and developer tooling that helps teams move faster and safer.
              When I'm not building or designing, you'll find me tinkering, writing, mentoring, and exploring
              new ideas. I believe in clean self-documenting code, automated security validation, and enabling
              my team to do more with less.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <Section title="Core Values" spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono">
              Reliability with Integrity
            </h3>
            <p className="text-text-secondary">
                I build systems and make decisions that people can trust, especially when accuracy, safety, and uptime matter most.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono">
              Craftsmanship that Serves People
            </h3>
            <p className="text-text-secondary">
                I focus on thoughtful engineering—clear, maintainable, and elegant—so the teams and operators who rely on my work can do theirs with confidence.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono">
              Impact
            </h3>
            <p className="text-text-secondary">
                I choose work that creates real, measurable change.  I improve systems, elevating teams, or advancing technology in measurable ways that impact the business.
            </p>
          </Card>
        </div>
      </Section>

      {/* Expertise Section */}
      <Section title="Expertise" spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
