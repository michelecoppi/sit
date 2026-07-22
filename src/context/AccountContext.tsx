import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProviders, linkProvider } from '../services/accountService'
import { getMe } from '../services/profileService'
import { type ConnectedAccount, type LinkCodeResponse, type ProviderType } from '../types/account'
import type { MeResponse } from '../types/profile'

interface AccountContextValue {
  meData: MeResponse | null
  providers: ConnectedAccount[]
  isLoading: boolean
  profileError: string | null
  providersError: string | null
  refreshAll: () => Promise<void>
  refreshProvidersOnly: () => Promise<ConnectedAccount[]>
  generateLinkCode: (provider: ProviderType) => Promise<LinkCodeResponse>
}

const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ token, children }: { token: string; children: React.ReactNode }) {
  const [meData, setMeData] = useState<MeResponse | null>(null)
  const [providers, setProviders] = useState<ConnectedAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [providersError, setProvidersError] = useState<string | null>(null)

  const refreshProvidersOnly = useCallback(async () => {
    const nextProviders = await getProviders(token)
    setProviders(nextProviders)
    setProvidersError(null)
    return nextProviders
  }, [token])

  const refreshAll = useCallback(async () => {
    setIsLoading(true)

    const results = await Promise.allSettled([getMe(token), getProviders(token)])

    const meResult = results[0]
    if (meResult.status === 'fulfilled') {
      setMeData(meResult.value)
      setProfileError(null)
    } else {
      setProfileError(meResult.reason instanceof Error ? meResult.reason.message : 'Unable to load profile data.')
    }

    const providersResult = results[1]
    if (providersResult.status === 'fulfilled') {
      setProviders(providersResult.value)
      setProvidersError(null)
    } else {
      setProvidersError(providersResult.reason instanceof Error ? providersResult.reason.message : 'Unable to load providers.')
    }

    setIsLoading(false)
  }, [token])

  const generateLinkCode = useCallback(async (provider: ProviderType) => {
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
  }, [token])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  const value = useMemo(() => ({
    meData,
    providers,
    isLoading,
    profileError,
    providersError,
    refreshAll,
    refreshProvidersOnly,
    generateLinkCode,
  }), [generateLinkCode, isLoading, meData, profileError, providers, providersError, refreshAll, refreshProvidersOnly])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used inside AccountProvider')
  }
  return context
}
