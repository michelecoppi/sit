import { useContext } from 'react'
import { AuthContext } from './authContextStore'

export { AuthProvider } from './AuthProvider'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

/** Optional for shell-level preferences that must also work before sign-in. */
export function useOptionalAuth() {
  return useContext(AuthContext)
}
