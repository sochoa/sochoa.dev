import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPostBySlug } from '@/api'

interface Post {
  id: string
  slug: string
  title: string
  body: string
  createdAt: string
  tags?: string[]
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [slug])

  async function fetchPost() {
    if (!slug) return

    try {
      setLoading(true)
      const data = await getPostBySlug(slug)
      setPost({
        id: data.id,
        slug: data.slug,
        title: data.title,
        body: data.body,
        createdAt: data.created_at,
        tags: data.tags,
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setError('Post not found')
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-slate-600 dark:text-slate-300">Loading post...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error || 'Post not found'}
          </p>
        </div>
        <Link
          to="/blog"
          className="text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded"
        >
          ← Back to blog
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Navigation */}
      <Link
        to="/blog"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline focus-visible-ring rounded mb-8"
      >
        ← Back to blog
      </Link>

      {/* Header */}
      <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
        {post.title}
      </h1>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
          {post.body}
        </div>
      </div>
    </article>
  )
}
