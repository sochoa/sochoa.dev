import { useState } from 'react'
import { submitContact } from '@/api'
import { PageContainer, PageHeader, Section, Card, Button, Input, Textarea, Alert } from '../components/ui'

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
      await submitContact({
        name: state.data.name,
        email: state.data.email,
        message: state.data.message,
      })

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
    <PageContainer>
      <PageHeader
        title="Get in Touch"
        subtitle="Have a question or want to work together? Send me a message."
      />

      <Section>
        <Card>
          {state.submitted && <Alert type="success">Thank you! I'll get back to you soon.</Alert>}
          {state.error && <Alert type="error">Error: {state.error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              id="name"
              name="name"
              label="Your Name"
              value={state.data.name}
              onChange={handleChange}
              disabled={state.isSubmitting}
              error={state.errors.name}
            />

            <Input
              type="email"
              id="email"
              name="email"
              label="Your Email"
              value={state.data.email}
              onChange={handleChange}
              disabled={state.isSubmitting}
              error={state.errors.email}
            />

            <div>
              <Textarea
                id="message"
                name="message"
                label="How can I help?"
                value={state.data.message}
                onChange={handleChange}
                disabled={state.isSubmitting}
                rows={6}
                error={state.errors.message}
              />
              <p className="text-xs text-text-tertiary mt-2">
                {state.data.message.length} / 5000
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={state.isSubmitting}
              className="w-full"
            >
              {state.isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Card>
      </Section>
    </PageContainer>
  )
}
