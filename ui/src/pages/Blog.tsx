import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listPosts, type PostResponse } from '@/api'

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
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
        Blog
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-300">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-300">No posts yet.</p>
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
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
                className="border-b border-slate-200 dark:border-slate-800 pb-8 last:border-b-0"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block"
                >
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {post.summary}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded"
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
