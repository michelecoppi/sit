import { createContext } from 'react'
import type { ConnectedAccount, LinkCodeResponse, ProviderType } from '../types/account'

export interface AccountContextValue {
  providers: ConnectedAccount[]
  isLoading: boolean
  providersError: string | null
  refreshProviders: () => Promise<void>
  refreshProvidersOnly: () => Promise<ConnectedAccount[]>
  generateLinkCode: (provider: ProviderType) => Promise<LinkCodeResponse>
}

export const AccountContext = createContext<AccountContextValue | null>(null)
