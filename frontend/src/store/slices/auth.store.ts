import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UserProfile } from '@/types'

// ── State shape ───────────────────────────────────────────────────────────

interface AuthState {
  user:          UserProfile | null
  isLoading:     boolean
  isInitialized: boolean

  setUser:        (user: UserProfile | null) => void
  setLoading:     (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  clearAuth:      () => void
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user:          null,
      isLoading:     false,
      isInitialized: false,

      setUser: (user) => set({ user }, false, 'setUser'),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      setInitialized: (isInitialized) => set({ isInitialized }, false, 'setInitialized'),

      clearAuth: () =>
        set({ user: null, isLoading: false }, false, 'clearAuth'),
    }),
    { name: 'AuthStore' },
  ),
)
