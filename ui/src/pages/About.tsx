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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Headshot Placeholder */}
          <div className="md:col-span-1">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-6xl">👤</span>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              About Me
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              Hi! I'm a software engineer with a passion for building things that matter.
              I specialize in full-stack development, system design, and helping teams ship
              great products.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              When I'm not coding, you'll find me writing about technology, mentoring junior
              developers, or exploring new ideas. I believe in clean code, good documentation,
              and making technology accessible to everyone.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Currently focused on building scalable systems and contributing to open source
              projects that make a real difference.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Quality
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              I believe in writing code that's not just functional, but also maintainable,
              tested, and well-documented.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Collaboration
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              The best solutions come from diverse perspectives. I thrive in collaborative
              environments where ideas are shared openly.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Impact
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              I focus on building solutions that solve real problems and create tangible
              value for users and businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Expertise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {expertise.map((group) => (
            <div key={group.category}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Experience
        </h2>
        <div className="space-y-8">
          {timeline.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.company}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.year}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
