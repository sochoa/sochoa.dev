import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listPosts } from '@/api'

interface Post {
  id: string
  slug: string
  title: string
  summary?: string
  createdAt: string
  tags?: string[]
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
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
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-accent-purple mb-8">
        Blog
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No posts yet.</p>
        </div>
      ) : (
        <>
          {/* Tags Filter */}
          {posts.some((p) => p.tags?.length) && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === null
                      ? 'bg-accent-cyan text-primary'
                      : 'bg-secondary text-text-primary hover:bg-tertiary'
                  } focus-visible-ring`}
                >
                  All
                </button>
                {Array.from(
                  new Set(posts.flatMap((p) => p.tags || []))
                ).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-accent-cyan text-primary'
                        : 'bg-secondary text-text-primary hover:bg-tertiary'
                    } focus-visible-ring`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="border-b border-border-subtle pb-8 last:border-b-0"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block"
                >
                  <h2 className="text-2xl font-semibold text-accent-purple group-hover:text-accent-cyan transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-sm text-accent-purple mb-3">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-text-secondary mb-4">
                  {post.summary}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 bg-secondary text-text-secondary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-block mt-4 text-accent-cyan hover:text-accent-cyan focus-visible-ring rounded transition-colors"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
