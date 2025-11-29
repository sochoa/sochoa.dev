import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { listGuestbookEntries, submitGuestbookEntry } from '@/api'
import { PageContainer, PageHeader, Section, Card, Button, Input, Textarea, Alert } from '../components/ui'

interface GuestbookEntry {
  id: string
  displayName?: string
  message?: string
  createdAt: string
}

interface FormData {
  displayName: string
  message: string
  honeypot: string
}

interface FormState {
  data: FormData
  errors: Record<string, string>
  isSubmitting: boolean
  submitted: boolean
  error?: string
}

export default function Guestbook() {
  const user = useAuthStore((s) => s.user)
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>({
    data: { displayName: '', message: '', honeypot: '' },
    errors: {},
    isSubmitting: false,
    submitted: false,
  })

  // Fetch approved entries on mount
  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      setLoading(true)
      const data = await listGuestbookEntries()
      setEntries(
        (data || []).map((entry) => ({
          id: entry.id,
          displayName: entry.display_name,
          message: entry.message,
          createdAt: entry.created_at,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  function validateForm(data: FormData) {
    const errors: Record<string, string> = {}

    if (!data.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (data.displayName.length > 50) {
      errors.displayName = 'Display name must be 50 characters or less'
    }

    if (!data.message.trim()) {
      errors.message = 'Message is required'
    } else if (data.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    } else if (data.message.length > 500) {
      errors.message = 'Message must be 500 characters or less'
    }

    if (data.honeypot) {
      errors.honeypot = 'Invalid submission'
    }

    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errors = validateForm(formState.data)
    if (Object.keys(errors).length > 0) {
      setFormState((s) => ({ ...s, errors }))
      return
    }

    setFormState((s) => ({ ...s, isSubmitting: true, error: undefined }))

    try {
      await submitGuestbookEntry({
        display_name: formState.data.displayName,
        message: formState.data.message,
        honeypot: formState.data.honeypot,
      })

      setFormState({
        data: { displayName: '', message: '', honeypot: '' },
        errors: {},
        isSubmitting: false,
        submitted: true,
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormState((s) => ({ ...s, submitted: false }))
      }, 5000)

      // Refresh entries
      fetchEntries()
    } catch (error) {
      setFormState((s) => ({
        ...s,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }))
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormState((s) => ({
      ...s,
      data: { ...s.data, [name]: value },
      errors: { ...s.errors, [name]: '' },
    }))
  }

  return (
    <PageContainer>
      <PageHeader
        title="Guestbook"
        subtitle="Sign the guestbook and leave a message!"
      />

      {/* Submit Form */}
      <Section spacing="normal">
        {user ? (
          <Card>
            <h2 className="text-2xl font-semibold text-text-primary mb-6 font-mono">
              Leave a Message
            </h2>

            {formState.submitted && (
              <Alert type="success">Thanks for signing the guestbook! Your entry is pending approval.</Alert>
            )}

            {formState.error && <Alert type="error">Error: {formState.error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                id="displayName"
                name="displayName"
                label="Display Name (optional)"
                value={formState.data.displayName}
                onChange={handleChange}
                disabled={formState.isSubmitting}
                placeholder="Your name"
                error={formState.errors.displayName}
              />

              <div>
                <Textarea
                  id="message"
                  name="message"
                  label="Message"
                  value={formState.data.message}
                  onChange={handleChange}
                  disabled={formState.isSubmitting}
                  placeholder="Leave your message..."
                  rows={4}
                  error={formState.errors.message}
                />
                <p className="text-xs text-text-tertiary mt-2">
                  {formState.data.message.length} / 500
                </p>
              </div>

              {/* Honeypot (hidden) */}
              <input
                type="text"
                name="honeypot"
                value={formState.data.honeypot}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={formState.isSubmitting}
                className="w-full"
              >
                {formState.isSubmitting ? 'Submitting...' : 'Sign Guestbook'}
              </Button>
            </form>
          </Card>
        ) : (
          <Card>
            <p className="text-text-secondary">
              <a href="/login" className="text-accent-cyan hover:text-text-primary transition-colors">
                Sign in
              </a>
              {' '}to leave a message in the guestbook.
            </p>
          </Card>
        )}
      </Section>

      {/* Entries List */}
      <Section title="Recent Entries" spacing="normal">
        {error && <Alert type="error">Error: {error}</Alert>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No entries yet. Be the first to sign!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <Card key={entry.id} hover>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-text-primary font-mono">
                    {entry.displayName || 'Anonymous'}
                  </h3>
                  <time className="text-xs text-accent-purple">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {entry.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  )
}
