import { createContext } from 'react'
import type { MeResponse } from '../types/profile'

export type AuthStatus = 'anonymous' | 'loading' | 'authenticated'

export interface AuthContextValue {
  me: MeResponse | null
  status: AuthStatus
  authError: string | null
  isBootstrapping: boolean
  completeLogin: () => Promise<void>
  refreshMe: () => Promise<MeResponse | null>
  logout: () => Promise<void>
  clearAuthError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
