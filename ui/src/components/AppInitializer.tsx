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
          // Type assertion needed due to Amplify's strict type definitions
          Amplify.configure(cognitoConfig as any)
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
