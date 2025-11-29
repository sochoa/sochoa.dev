export default function Resume() {
  const experience = [
    {
      company: 'Infrastructure & Security Company',
      role: 'Senior Platform Engineer',
      period: 'April 2025 - Present',
      achievements: [
        'Designed and implemented security program for vulnerability tracking and remediation across 2,500+ hosts and 340+ sites',
        'Developed Just-in-Time access model for secure, time-limited system access with corporate identity integration',
        'Architected supply chain and distributed configuration management solution for third-party software compliance at scale',
        'Developed network switch configuration parsers for cross-site analysis, identifying and remedying 18 sites with configuration mismatches',
        'Built Python-based analytics platforms for ticket analysis and temporal CloudWatch metrics aggregation',
        'Served as Application Security Guardian, developing threat modeling workflows and providing security consultation across engineering teams',
      ],
    },
    {
      company: 'Enterprise Software Company',
      role: 'Lead Infrastructure Engineer',
      period: 'December 2021 - April 2025',
      achievements: [
        'Designed and implemented deployment automation service in Golang, reducing support inquiries by 27%',
        'Provided on-call support for Kubernetes and Infrastructure-as-Code deployments across 15+ environments in commercial and restricted settings',
        'Designed cross-account IAM role-based implementation with Terraform enabling multi-team ownership and cross-account deployments',
        'Mentored junior engineers and fostered culture of continuous learning and technical excellence',
        'Implemented key management tools for encrypted repository credentials',
        'Designed and deployed feature flag services and monitoring/alerting systems with comprehensive dashboards',
      ],
    },
    {
      company: 'Cloud Infrastructure Provider',
      role: 'Principal Systems Engineer',
      period: 'January 2017 - December 2021',
      achievements: [
        'Designed access enforcement tooling and authorization integration for system security',
        'Implemented network security service to prioritize and manage security group and firewall rules across cloud infrastructure',
        'Designed SSH configuration management ensuring compliance across all systems',
        'Developed and maintained authentication components and Just-In-Time password services for regional authentication',
        'Acted as compliance champion and point of contact for audit evidence gathering and regulatory compliance',
        'Designed and documented comprehensive auditor walkthrough for access control ecosystem',
      ],
    },
    {
      company: 'Entertainment & Media Company',
      role: 'Senior Systems Engineer',
      period: 'May 2015 - January 2017',
      achievements: [
        'Lead systems engineer providing subject-matter expertise on Agile/Scrum workflows across multi-region teams',
        'Provided guidance on public cloud security best practices and infrastructure management',
        'Managed large-scale AWS infrastructure with Terraform and orchestrated deployments with Ansible',
        'Developed distributed multi-tier application for large-scale cloud storage operations and file transfers',
        'Created web application providing audit and management layer for distributed key/value store',
        'Developed automation tools including Chat Ops and automated security reporting',
      ],
    },
    {
      company: 'Digital Media Company',
      role: 'Systems Administrator',
      period: 'December 2014 - May 2015',
      achievements: [
        'Developed and maintained configuration management codebase for 1,000+ virtual machines using infrastructure-as-code patterns',
        'Designed and maintained comprehensive monitoring dashboards for critical services',
        'Developed Python monitoring tools for load balancer health and performance tracking',
      ],
    },
    {
      company: 'Transportation Systems Company',
      role: 'Software Engineer',
      period: 'March 2013 - December 2014',
      achievements: [
        'Developed and maintained distributed safety communication systems in C++',
        'Developed automated public key infrastructure tools',
        'Developed deployment and configuration management tools for enterprise systems',
      ],
    },
  ]

  const skills = [
    {
      category: 'Languages',
      items: ['Go', 'Python', 'Terraform', 'React/TypeScript', 'Java', 'Ruby', 'C++'],
    },
    {
      category: 'Infrastructure & DevOps',
      items: ['AWS', 'AWS EKS', 'Kubernetes', 'Docker', 'Ansible', 'Chef', 'Jenkins', 'Argo Workflows'],
    },
    {
      category: 'Databases & Data',
      items: ['PostgreSQL', 'Redis', 'Memcache', 'SQLite', 'Elasticsearch'],
    },
    {
      category: 'Frameworks & Tools',
      items: ['Gin', 'GORM', 'FastAPI', 'Terraform', 'Vim', 'Git', 'LaunchDarkly'],
    },
    {
      category: 'Specialties',
      items: ['System Design', 'Infrastructure Architecture', 'Security & Compliance', 'Access Control', 'Cloud Infrastructure', 'Mentoring'],
    },
  ]

  const education = [
    {
      school: 'Cedar Park Christian',
      degree: 'High School',
      year: '2000',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header with Download Link */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-accent-purple mb-2">
            Resume
          </h1>
          <p className="text-lg text-text-secondary">
            Infrastructure engineer with 10+ years building secure, scalable systems at scale
          </p>
        </div>
        <a
          href="#"
          className="px-6 py-3 bg-accent-cyan text-primary rounded-lg hover:bg-accent-cyan/90 focus-visible-ring font-medium transition-colors whitespace-nowrap"
        >
          Download PDF
        </a>
      </div>

      {/* Experience Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-accent-purple mb-12">
          Experience
        </h2>
        <div className="space-y-8">
          {experience.map((job, index) => (
            <div
              key={index}
              className="border border-border-subtle/20 bg-secondary/30 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">
                    {job.role}
                  </h3>
                  <p className="text-text-secondary text-sm">{job.company}</p>
                </div>
                <span className="text-sm font-medium text-accent-purple whitespace-nowrap ml-4">
                  {job.period}
                </span>
              </div>
              <ul className="space-y-2">
                {job.achievements.map((achievement, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-text-secondary text-sm"
                  >
                    <span className="text-accent-cyan font-semibold mt-0.5">
                      •
                    </span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-12 pt-12 border-t border-border-subtle/20">
        <h2 className="text-3xl font-bold text-accent-purple mb-12">
          Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-secondary/50 border border-accent-cyan/20 text-text-secondary rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="pt-12 border-t border-border-subtle/20">
        <h2 className="text-3xl font-bold text-accent-purple mb-12">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div
              key={index}
              className="border border-border-subtle/20 bg-secondary/30 rounded-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {edu.degree}
                  </h3>
                  <p className="text-text-secondary text-sm">{edu.school}</p>
                </div>
                <span className="text-sm font-medium text-accent-purple">
                  {edu.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
