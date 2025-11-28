import { useState } from 'react'

interface FormData {
  name: string
  email: string
  message: string
}

interface FormState {
  data: FormData
  errors: Record<string, string>
  isSubmitting: boolean
  submitted: boolean
  error?: string
}

export default function Contact() {
  const [state, setState] = useState<FormState>({
    data: { name: '', email: '', message: '' },
    errors: {},
    isSubmitting: false,
    submitted: false,
  })

  function validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function validateForm(data: FormData) {
    const errors: Record<string, string> = {}

    if (!data.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!data.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(data.email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!data.message.trim()) {
      errors.message = 'Message is required'
    } else if (data.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    } else if (data.message.length > 5000) {
      errors.message = 'Message must be less than 5000 characters'
    }

    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errors = validateForm(state.data)
    if (Object.keys(errors).length > 0) {
      setState((s) => ({ ...s, errors }))
      return
    }

    setState((s) => ({ ...s, isSubmitting: true, error: undefined }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setState({
        data: { name: '', email: '', message: '' },
        errors: {},
        isSubmitting: false,
        submitted: true,
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setState((s) => ({ ...s, submitted: false }))
      }, 5000)
    } catch (error) {
      setState((s) => ({
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
    setState((s) => ({
      ...s,
      data: { ...s.data, [name]: value },
      errors: { ...s.errors, [name]: '' },
    }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Get in Touch
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
        Have a question or want to work together? Send me a message.
      </p>

      {state.submitted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <p className="text-green-800 dark:text-green-200">
            ✓ Thank you! I'll get back to you soon.
          </p>
        </div>
      )}

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <p className="text-red-800 dark:text-red-200">Error: {state.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={state.data.name}
            onChange={handleChange}
            disabled={state.isSubmitting}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus-visible-ring disabled:opacity-50"
            aria-invalid={!!state.errors.name}
            aria-describedby={state.errors.name ? 'name-error' : undefined}
          />
          {state.errors.name && (
            <p id="name-error" className="text-red-600 dark:text-red-400 text-sm mt-2">
              {state.errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={state.data.email}
            onChange={handleChange}
            disabled={state.isSubmitting}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus-visible-ring disabled:opacity-50"
            aria-invalid={!!state.errors.email}
            aria-describedby={state.errors.email ? 'email-error' : undefined}
          />
          {state.errors.email && (
            <p id="email-error" className="text-red-600 dark:text-red-400 text-sm mt-2">
              {state.errors.email}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={state.data.message}
            onChange={handleChange}
            disabled={state.isSubmitting}
            rows={6}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus-visible-ring disabled:opacity-50 resize-none"
            aria-invalid={!!state.errors.message}
            aria-describedby={state.errors.message ? 'message-error' : undefined}
          />
          {state.errors.message && (
            <p id="message-error" className="text-red-600 dark:text-red-400 text-sm mt-2">
              {state.errors.message}
            </p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {state.data.message.length} / 5000
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={state.isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring font-medium transition-colors"
        >
          {state.isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
