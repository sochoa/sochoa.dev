import { useEffect } from 'react'
import { Amplify } from '@aws-amplify/core'
import { cognitoConfig, isConfigured } from '../config/cognito'
import { useAuthStore } from '../stores/authStore'

export function AppInitializer() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    async function setup() {
      // Configure Amplify with Cognito settings if available
      if (isConfigured()) {
        try {
          Amplify.configure(cognitoConfig)
        } catch (error) {
          console.error('Failed to configure Amplify:', error)
        }
      }

      // Initialize auth state from session
      await initializeAuth()
    }

    if (!isInitialized) {
      setup()
    }
  }, [initializeAuth, isInitialized])

  return null
}
