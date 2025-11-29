import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleAuthCallback } from '../stores/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const success = await handleAuthCallback()
      if (success) {
        navigate('/')
      } else {
        navigate('/login?error=auth-failed')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Signing you in...
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  )
}
