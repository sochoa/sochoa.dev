export default function Resume() {
  const experience = [
    {
      company: 'Tech Company',
      role: 'Senior Software Engineer',
      period: '2023 - Present',
      achievements: [
        'Led development of core platform features serving 100K+ users',
        'Mentored 5 junior engineers and established best practices',
        'Improved API performance by 40% through optimization and caching',
        'Designed and implemented microservices architecture',
      ],
    },
    {
      company: 'StartUp Inc',
      role: 'Full Stack Developer',
      period: '2021 - 2023',
      achievements: [
        'Built and shipped customer-facing products from concept to production',
        'Improved system performance resulting in 50% reduction in load times',
        'Reduced infrastructure costs by 30% through optimization',
        'Implemented CI/CD pipeline reducing deployment time by 75%',
      ],
    },
    {
      company: 'Early Stage Startup',
      role: 'Software Engineer',
      period: '2019 - 2021',
      achievements: [
        'Contributed to product development across frontend and backend',
        'Built real-time dashboard with WebSockets for live data visualization',
        'Implemented database migrations and scaling strategies',
      ],
    },
  ]

  const skills = [
    {
      category: 'Backend',
      items: ['Go', 'Node.js', 'Python', 'PostgreSQL', 'Redis', 'gRPC'],
    },
    {
      category: 'Frontend',
      items: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'GraphQL'],
    },
    {
      category: 'Infrastructure',
      items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    },
    {
      category: 'Specialties',
      items: ['System Design', 'Performance Optimization', 'Mentoring', 'Agile'],
    },
  ]

  const education = [
    {
      school: 'University Name',
      degree: 'Bachelor of Science in Computer Science',
      year: '2019',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header with Download Link */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Resume
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Full-stack engineer with experience in building scalable systems
          </p>
        </div>
        <a
          href="#"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible-ring font-medium transition-colors whitespace-nowrap"
        >
          Download PDF
        </a>
      </div>

      {/* Experience Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Experience
        </h2>
        <div className="space-y-8">
          {experience.map((job, index) => (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {job.role}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{job.company}</p>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                  {job.period}
                </span>
              </div>
              <ul className="space-y-2">
                {job.achievements.map((achievement, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
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
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
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
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {edu.degree}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{edu.school}</p>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
