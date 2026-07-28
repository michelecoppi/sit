import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { logoutSession } from '../services/authService'
import { ApiClientError } from '../services/apiClient'
import { getMe } from '../services/profileService'
import type { MeResponse } from '../types/profile'
import { setUnauthorizedHandler } from '../utils/authSession'

type AuthStatus = 'anonymous' | 'loading' | 'authenticated'

interface AuthContextValue {
  me: MeResponse | null
  status: AuthStatus
  authError: string | null
  isBootstrapping: boolean
  completeLogin: () => Promise<void>
  refreshMe: () => Promise<MeResponse | null>
  logout: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(false)

  const loadSession = useCallback(async (propagateError: boolean) => {
    setIsBootstrapping(true)

    try {
      const profile = await getMe()
      setMe(profile)
      setStatus('authenticated')
      setAuthError(null)
      return profile
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to restore the session.'
      const unauthorized = error instanceof ApiClientError && error.status === 401

      if (unauthorized) {
        setMe(null)
        setStatus('anonymous')
      } else {
        setStatus((current) => current === 'authenticated' ? current : 'anonymous')
        setAuthError(message)
      }

      if (propagateError) {
        throw error
      }
      return null
    } finally {
      setIsBootstrapping(false)
    }
  }, [])

  const refreshMe = useCallback(() => loadSession(false), [loadSession])

  const completeLogin = useCallback(async () => {
    setStatus('loading')
    setAuthError(null)
    await loadSession(true)
  }, [loadSession])

  const logout = useCallback(async () => {
    setAuthError(null)

    try {
      await logoutSession()
      setMe(null)
      setStatus('anonymous')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to close the session.'
      setAuthError(message)
      throw error
    }
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler((message) => {
      setMe(null)
      setStatus('anonymous')
      setAuthError(message)
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [])

  useEffect(() => {
    void refreshMe()
  }, [refreshMe])

  const value = useMemo(() => ({
    me,
    status,
    authError,
    isBootstrapping,
    completeLogin,
    refreshMe,
    logout,
    clearAuthError,
  }), [authError, clearAuthError, completeLogin, isBootstrapping, logout, me, refreshMe, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

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
