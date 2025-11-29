import { create } from 'zustand'

export interface User {
  id: string
  email: string
  groups: string[]
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  token: localStorage.getItem('auth_token'),

  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
    set({ token })
  },

  setError: (error) => set({ error }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, token: null, error: null })
  },

  isAdmin: () => {
    const state = get()
    return state.user?.groups?.includes('admin') ?? false
  },
}))
