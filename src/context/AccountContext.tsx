import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProviders, linkProvider } from '../services/accountService'
import { type ConnectedAccount, type LinkCodeResponse, type ProviderType } from '../types/account'
import { useAuth } from './AuthContext'

interface AccountContextValue {
  providers: ConnectedAccount[]
  isLoading: boolean
  providersError: string | null
  refreshProviders: () => Promise<void>
  refreshProvidersOnly: () => Promise<ConnectedAccount[]>
  generateLinkCode: (provider: ProviderType) => Promise<LinkCodeResponse>
}

const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { token, status } = useAuth()
  const [providers, setProviders] = useState<ConnectedAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [providersError, setProvidersError] = useState<string | null>(null)

  const refreshProvidersOnly = useCallback(async () => {
    if (status !== 'authenticated') return []

    const nextProviders = await getProviders(token)
    setProviders(nextProviders)
    setProvidersError(null)
    return nextProviders
  }, [status, token])

  const refreshProviders = useCallback(async () => {
    if (status !== 'authenticated') {
      setProviders([])
      setProvidersError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const nextProviders = await getProviders(token)
      setProviders(nextProviders)
      setProvidersError(null)
    } catch (error) {
      setProvidersError(error instanceof Error ? error.message : 'Unable to load providers.')
    } finally {
      setIsLoading(false)
    }
  }, [status, token])

  const generateLinkCode = useCallback(async (provider: ProviderType) => {
    if (status !== 'authenticated') {
      throw new Error('Please sign in to continue.')
    }

    const result = await linkProvider(token, provider)
    setProviders((currentProviders) => currentProviders.map((current) => {
      if (current.provider !== result.provider) return current
      return {
        ...current,
        status: 'PENDING',
      }
    }))
    setProvidersError(null)
    return result
  }, [status, token])

  useEffect(() => {
    void refreshProviders()
  }, [refreshProviders])

  const value = useMemo(() => ({
    providers,
    isLoading,
    providersError,
    refreshProviders,
    refreshProvidersOnly,
    generateLinkCode,
  }), [generateLinkCode, isLoading, providers, providersError, refreshProviders, refreshProvidersOnly])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used inside AccountProvider')
  }
  return context
}
