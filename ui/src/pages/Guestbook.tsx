import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { listGuestbookEntries, submitGuestbookEntry } from '@/api'

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-text-primary mb-4">
        Guestbook
      </h1>
      <p className="text-lg text-text-secondary mb-12">
        Sign the guestbook and leave a message!
      </p>

      {/* Submit Form */}
      {user ? (
        <div className="bg-secondary border border-border-subtle rounded p-6 mb-12 shadow-subtle">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Leave a Message
          </h2>

          {formState.submitted && (
            <div className="bg-tertiary border border-border-accent rounded p-4 mb-6">
              <p className="text-accent-teal">
                [OK] Thanks for signing the guestbook! Your entry is pending approval.
              </p>
            </div>
          )}

          {formState.error && (
            <div className="bg-tertiary border border-accent-magenta rounded p-4 mb-6">
              <p className="text-accent-magenta">
                Error: {formState.error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-primary mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formState.data.displayName}
                onChange={handleChange}
                disabled={formState.isSubmitting}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-border-subtle bg-tertiary text-text-primary rounded focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed hover:border-border-accent transition-colors"
                aria-invalid={!!formState.errors.displayName}
                aria-describedby={
                  formState.errors.displayName ? 'displayName-error' : undefined
                }
              />
              {formState.errors.displayName && (
                <p id="displayName-error" className="text-accent-magenta text-sm mt-2">
                  {formState.errors.displayName}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formState.data.message}
                onChange={handleChange}
                disabled={formState.isSubmitting}
                placeholder="Leave your message..."
                rows={4}
                className="w-full px-4 py-2 border border-border-subtle bg-tertiary text-text-primary rounded focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed hover:border-border-accent transition-colors resize-none"
                aria-invalid={!!formState.errors.message}
                aria-describedby={
                  formState.errors.message ? 'message-error' : undefined
                }
              />
              {formState.errors.message && (
                <p id="message-error" className="text-accent-magenta text-sm mt-2">
                  {formState.errors.message}
                </p>
              )}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full px-6 py-3 bg-accent-cyan text-primary font-medium rounded border border-accent-cyan hover:bg-transparent hover:text-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring transition-all"
            >
              {formState.isSubmitting ? 'Submitting...' : 'Sign Guestbook'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-secondary border border-border-subtle rounded p-6 mb-12 shadow-subtle">
          <p className="text-text-secondary">
            <a href="/login" className="text-accent-cyan hover:text-accent-teal">
              Sign in
            </a>
            {' '}to leave a message in the guestbook.
          </p>
        </div>
      )}

      {/* Entries List */}
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          Recent Entries
        </h2>

        {error && (
          <div className="bg-secondary border border-accent-magenta rounded p-4 mb-6 shadow-subtle">
            <p className="text-accent-magenta">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              Loading entries...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              No entries yet. Be the first to sign!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border border-border-subtle bg-secondary rounded p-6 shadow-subtle hover:border-border-accent transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-text-primary">
                    {entry.displayName}
                  </h3>
                  <time className="text-xs text-text-tertiary">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
