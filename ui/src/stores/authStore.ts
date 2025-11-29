import { create } from 'zustand'
import { signInWithRedirect, signOut, fetchAuthSession } from '@aws-amplify/auth'

export interface User {
  id: string
  email: string
  name?: string
  groups: string[]
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  token: string | null
  isInitialized: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
  setIsInitialized: (initialized: boolean) => void
  logout: () => Promise<void>
  isAdmin: () => boolean
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  token: null,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    set({ token })
  },

  setError: (error) => set({ error }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setIsInitialized: (initialized) => set({ isInitialized: initialized }),

  logout: async () => {
    try {
      await signOut()
      set({ user: null, token: null, error: null })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Logout failed' })
    }
  },

  isAdmin: () => {
    const state = get()
    return state.user?.groups?.includes('admin') ?? false
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true })
      const session = await fetchAuthSession()

      if (session?.tokens?.accessToken) {
        const idToken = session.tokens.idToken
        const claims = idToken?.payload

        const user: User = {
          id: claims?.['cognito:username'] as string || '',
          email: claims?.email as string || '',
          name: claims?.name as string,
          groups: (claims?.['cognito:groups'] as string[]) || [],
        }

        set({
          user,
          token: session.tokens.accessToken.toString(),
          isInitialized: true,
        })
      } else {
        set({ isInitialized: true })
      }
    } catch (error) {
      console.log('Not authenticated or session expired')
      set({ isInitialized: true })
    } finally {
      set({ isLoading: false })
    }
  },
}))

/**
 * Sign in with an OAuth provider (google or linkedin)
 */
export async function signInWithProvider(provider: 'google' | 'linkedin') {
  try {
    const store = useAuthStore.getState()
    store.setIsLoading(true)

    await signInWithRedirect({
      provider: provider as any,
    })
  } catch (error) {
    useAuthStore.getState().setError(
      error instanceof Error ? error.message : 'Sign in failed'
    )
  }
}

/**
 * Handle the OAuth callback redirect
 */
export async function handleAuthCallback() {
  try {
    const store = useAuthStore.getState()
    store.setIsLoading(true)

    const session = await fetchAuthSession()

    if (session?.tokens?.accessToken) {
      const idToken = session.tokens.idToken
      const claims = idToken?.payload

      const user: User = {
        id: claims?.['cognito:username'] as string || '',
        email: claims?.email as string || '',
        name: claims?.name as string,
        groups: (claims?.['cognito:groups'] as string[]) || [],
      }

      store.setUser(user)
      store.setToken(session.tokens.accessToken.toString())
      store.setError(null)
      return true
    }
    return false
  } catch (error) {
    useAuthStore.getState().setError(
      error instanceof Error ? error.message : 'Authentication failed'
    )
    return false
  } finally {
    useAuthStore.getState().setIsLoading(false)
  }
}
