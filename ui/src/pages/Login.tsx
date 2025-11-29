import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore, signInWithProvider } from '../stores/authStore'
import { isConfigured } from '../config/cognito'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const setError = useAuthStore((s) => s.setError)

  const errorParam = searchParams.get('error')
  const cognitoConfigured = isConfigured()

  useEffect(() => {
    // If already authenticated, redirect to home
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  async function handleSignIn(provider: 'google' | 'linkedin') {
    setError(null)
    await signInWithProvider(provider)
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
        Sign In
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Sign in with your Google or LinkedIn account
      </p>

      {(error || errorParam) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">
            {error || 'Authentication failed. Please try again.'}
          </p>
        </div>
      )}

      {!cognitoConfigured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ Cognito is not configured. Please set up environment variables:
            VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, VITE_COGNITO_DOMAIN
          </p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => handleSignIn('google')}
          disabled={isLoading || !cognitoConfigured}
          className="w-full px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring font-medium transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.456,12.545,1.456 c-6.258,0-11.33,5.072-11.33,11.33c0,6.258,5.072,11.33,11.33,11.33c10.33,0,17.08-7.75,17.08-11.33 c0-0.713-0.082-1.405-0.235-2.08H12.545z"
            />
          </svg>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <button
          onClick={() => handleSignIn('linkedin')}
          disabled={isLoading || !cognitoConfigured}
          className="w-full px-6 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#094199] disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring font-medium transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853,0-2.136,1.445-2.136,2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9,1.637-1.85,3.37-1.85,3.601,0,4.267,2.37,4.267,5.455v6.286zM5.337,7.433c-1.144,0-2.063-.926-2.063-2.065,0-1.138.92-2.063,2.063-2.063,1.14,0,2.064.925,2.064,2.063,0,1.139-.925,2.065-2.064,2.065zm1.782,13.019H3.555V9h3.564v11.452zM22.225,0H1.771C.792,0,0,.774,0,1.729v20.542C0,23.227.792,24,1.771,24h20.451C23.2,24,24,23.227,24,22.271V1.729C24,.774,23.2,0,22.225,0z" />
          </svg>
          {isLoading ? 'Signing in...' : 'Sign in with LinkedIn'}
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mt-8 text-center">
        This uses AWS Cognito with federated OAuth providers. Your data is secure and encrypted.
      </p>
    </div>
  )
}
