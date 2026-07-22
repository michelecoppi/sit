export type ProviderType = string

export type ProviderStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'PENDING' | 'EXPIRED_LINK_CODE' | 'ERROR' | 'LOADING'

export interface AccountProvider {
  provider: ProviderType
  connected: boolean
  username?: string
  displayName?: string
  avatarUrl?: string
  connectedAt?: string
  status?: string
}

export interface AccountProviderMapValue {
  connected?: boolean
  status?: string
  username?: string
  displayName?: string
  avatarUrl?: string
  connectedAt?: string
  profile?: {
    username?: string
    displayName?: string
    avatarUrl?: string
    connectedAt?: string
  }
}

export interface ConnectedAccount {
  provider: ProviderType
  connected: boolean
  status: ProviderStatus
  username?: string
  displayName?: string
  avatarUrl?: string
  connectedAt?: string
}

export interface LinkCodeResponse {
  provider: ProviderType
  code?: string
  loginUrl?: string
  expiresAt: string | null
  expiresInSeconds: number | null
}

export interface AccountProvidersResponse {
  providers?: AccountProvider[]
  [provider: string]: unknown
}

export function normalizeProviderStatus(status: string | undefined, connected: boolean): ProviderStatus {
  if (connected) return 'CONNECTED'
  if (!status) return 'NOT_CONNECTED'

  const normalized = status.trim().toUpperCase().replace(/[\s-]+/g, '_')

  if (normalized === 'CONNECTED') return 'CONNECTED'
  if (normalized === 'NOT_CONNECTED') return 'NOT_CONNECTED'
  if (normalized === 'PENDING') return 'PENDING'
  if (normalized === 'EXPIRED_LINK_CODE') return 'EXPIRED_LINK_CODE'
  if (normalized === 'ERROR') return 'ERROR'
  if (normalized === 'LOADING') return 'LOADING'

  return connected ? 'CONNECTED' : 'NOT_CONNECTED'
}

export function normalizeProviderName(provider: string): ProviderType {
  return provider.trim().toLowerCase()
}

export function toConnectedAccount(provider: AccountProvider): ConnectedAccount {
  const normalizedProvider = normalizeProviderName(provider.provider)
  return {
    provider: normalizedProvider,
    connected: Boolean(provider.connected),
    status: normalizeProviderStatus(provider.status, Boolean(provider.connected)),
    username: provider.username,
    displayName: provider.displayName,
    avatarUrl: provider.avatarUrl,
    connectedAt: provider.connectedAt,
  }
}
