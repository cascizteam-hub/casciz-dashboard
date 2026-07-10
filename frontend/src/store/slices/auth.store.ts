import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface AuthState {
  user:          UserProfile | null
  isLoading:     boolean
  isInitialized: boolean

  setUser:        (user: UserProfile | null) => void
  setLoading:     (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  clearAuth:      () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user:          null,
      isLoading:     false,
      isInitialized: false,

      setUser:        (user)          => set({ user }),
      setLoading:     (isLoading)     => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      clearAuth:      ()              => set({ user: null, isLoading: false }),
    }),
    { name: 'AuthStore' },
  ),
)
