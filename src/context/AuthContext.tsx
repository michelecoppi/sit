import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe } from '../services/profileService'
import type { MeResponse } from '../types/profile'
import {
  clearSitToken,
  getSitToken,
  setSitToken,
  setUnauthorizedHandler,
  subscribeSitToken,
  tokenRestored,
} from '../utils/authToken'

type AuthStatus = 'anonymous' | 'loading' | 'authenticated'

interface AuthContextValue {
  token: string | null
  me: MeResponse | null
  status: AuthStatus
  authError: string | null
  isBootstrapping: boolean
  completeLogin: (token: string) => Promise<void>
  refreshMe: () => Promise<MeResponse | null>
  logout: (message?: string) => void
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getSitToken())
  const [me, setMe] = useState<MeResponse | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(false)

  const refreshMe = useCallback(async () => {
    const activeToken = getSitToken()

    setIsBootstrapping(true)

    try {
      const profile = await getMe(activeToken)
      setMe(profile)
      setStatus('authenticated')
      return profile
    } catch (error) {
      if (!activeToken) {
        setMe(null)
        setStatus('anonymous')
        return null
      }

      const message = error instanceof Error ? error.message : 'Invalid or expired session.'
      setAuthError(message)
      setStatus(getSitToken() ? 'authenticated' : 'anonymous')
      return null
    } finally {
      setIsBootstrapping(false)
    }
  }, [])

  const logout = useCallback((message?: string) => {
    clearSitToken()
    setMe(null)
    setStatus('anonymous')
    if (message) {
      setAuthError(message)
    }
  }, [])

  const completeLogin = useCallback(async (nextToken: string) => {
    const normalizedToken = nextToken.trim()
    if (!normalizedToken) {
      throw new Error('Invalid OAuth token received.')
    }

    setSitToken(normalizedToken)
    setStatus('loading')
    setAuthError(null)

    await refreshMe()
  }, [refreshMe])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeSitToken((nextToken) => {
      setToken(nextToken)
      if (!nextToken) {
        setMe(null)
        setStatus('anonymous')
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    setUnauthorizedHandler((message) => {
      logout(message)
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [logout])

  useEffect(() => {
    if (!token && status !== 'loading') return
    if (status === 'authenticated' && me) return

    let cancelled = false
    // Wait for the sessionStorage restore (decrypt) to settle first: on mount
    // this is the difference between racing a real token in storage against
    // an in-memory null and briefly bootstrapping as anonymous.
    void tokenRestored.then(() => {
      if (!cancelled) void refreshMe()
    })
    return () => {
      cancelled = true
    }
  }, [me, refreshMe, status, token])

  const value = useMemo(() => ({
    token,
    me,
    status,
    authError,
    isBootstrapping,
    completeLogin,
    refreshMe,
    logout,
    clearAuthError,
  }), [authError, clearAuthError, completeLogin, isBootstrapping, logout, me, refreshMe, status, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
