import { useEffect, useState } from 'react'
import { listPosts } from '@/api'
import { PageContainer, PageHeader, Alert, Link, Tag, Button } from '../components/ui'

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
    <PageContainer>
      <PageHeader title="Blog" />

      {error && <Alert type="error">Error: {error}</Alert>}

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
                <Button
                  variant={selectedTag === null ? 'primary' : 'secondary'}
                  onClick={() => setSelectedTag(null)}
                  className="text-sm px-4 py-2"
                >
                  All
                </Button>
                {Array.from(
                  new Set(posts.flatMap((p) => p.tags || []))
                ).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'primary' : 'secondary'}
                    onClick={() => setSelectedTag(tag)}
                    className="text-sm px-4 py-2"
                  >
                    {tag}
                  </Button>
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
                  variant="text"
                >
                  <h2 className="text-2xl font-semibold text-accent-purple group-hover:text-accent-cyan transition-colors mb-2 font-mono">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-sm text-accent-purple mb-3 font-mono">
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
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  variant="accent"
                  className="inline-block mt-4"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  )
}
