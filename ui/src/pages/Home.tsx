import { useEffect, useState } from 'react'
import { listPosts } from '@/api'
import { Link } from '../components/ui'

interface Post {
  id: string
  slug: string
  title: string
  summary?: string
  createdAt: string
  tags?: string[]
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setPostsLoading(true)
      const data = await listPosts()
      setPosts(
        (data || []).map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          createdAt: post.created_at,
          tags: post.tags,
        }))
      )
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setPostsLoading(false)
    }
  }

  const latestPosts = posts.slice(0, 3)

	const featuredWork = [
		{
			title: 'Security Risk & Remediation Program',
			description:
				'Designed and implemented a security program to track and prioritize CVEs, application security issues, cloud misconfigurations, and network vulnerabilities across 2,500+ hosts and 340+ sites, driving SLA-compliant remediation at scale.',
			href: '#', // TODO: link to case study or /work/security-program
		},
		{
			title: 'Network Policy Risk Ranking Service',
			description:
				'Built a network security service to analyze and rank the risk of network policies across large cloud environments, helping teams identify high-risk exposure, standardize configurations, and strengthen their overall security posture.',
			href: '#', // TODO: link to case study or /work/network-policy-risk
		},
	]


  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-16">
      {/* Hero Section */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Text content */}
        <div className="lg:col-span-2">
          <h1 className="
            text-5xl sm:text-6xl lg:text-7xl
            font-bold text-text-primary
            mb-3 leading-none tracking-tight
          ">
            Sean Ochoa
          </h1>
          <div className="space-y-1">
            <p className="text-sm sm:text-base text-text-tertiary font-mono tracking-[0.2em] uppercase">
              scientist • writer • builder
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 lg:mt-4">
          <div className="p-6 bg-secondary/50 border border-accent-cyan/20 rounded-xl backdrop-blur-sm">
            <p className="text-xs font-semibold text-accent-purple uppercase tracking-wide mb-3">
              Now
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-tertiary">Location</p>
                <p className="text-text-primary font-medium">Seattle, WA</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Current Focus</p>
                <p className="text-text-primary font-medium">Security Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-border-subtle/20 mb-12" />

      {/* Featured Work */}
      <section className="mb-12">
        <div className="flex justify-between items-baseline mb-12">
          <h2 className="text-3xl font-bold text-accent-purple font-mono">
            Featured Work
          </h2>
        </div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredWork.map((project) => (
            <div
              key={project.title}
              className="group relative bg-secondary/40 border border-accent-cyan/20 rounded-2xl p-8 transition-all duration-300 hover:border-accent-cyan/50"
              style={{
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.05)',
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(0, 217, 255, 0.1)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent-cyan transition-colors font-mono">
                  {project.title}
                </h3>
                <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <h2 className="text-3xl font-bold text-accent-purple mb-12 font-mono">
          Latest Posts
        </h2>
        <div className="space-y-8">
          {postsLoading ? (
            <p className="text-text-secondary">Loading posts...</p>
          ) : postsError ? (
            <p className="text-accent-purple">Error loading posts: {postsError}</p>
          ) : latestPosts.length === 0 ? (
            <p className="text-text-secondary">No posts yet.</p>
          ) : (
            latestPosts.map((post) => (
              <article
                key={post.id}
                className="pb-8 border-b border-border-subtle/20 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <Link
                    to={`/blog/${post.slug}`}
                    variant="text"
                    className="text-xl font-semibold font-mono"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-accent-purple font-medium whitespace-nowrap font-mono">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {post.summary && (
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {post.summary}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
        <Link
          to="/blog"
          variant="accent"
          className="inline-block mt-12 text-sm font-medium"
        >
          View all posts →
        </Link>
      </section>
    </div>
  )
}
