import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPostBySlug } from '@/api'
import { PageContainer, PageHeader, Alert, Link, Tag } from '../components/ui'

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
      <PageContainer>
        <p className="text-text-secondary">Loading post...</p>
      </PageContainer>
    )
  }

  if (error || !post) {
    return (
      <PageContainer>
        <Alert type="error">{error || 'Post not found'}</Alert>
        <Link to="/blog" variant="text">
          ← Back to blog
        </Link>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Navigation */}
      <Link to="/blog" variant="text" className="mb-8 inline-block">
        ← Back to blog
      </Link>

      {/* Header */}
      <PageHeader title={post.title} />

      {/* Date */}
      <p className="text-lg text-accent-purple mb-8 font-mono">
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border-subtle/20">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
          {post.body}
        </div>
      </div>
    </PageContainer>
  )
}
