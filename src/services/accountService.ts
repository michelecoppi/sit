import {
  type AccountProviderMapValue,
  type AccountProvidersResponse,
  type ConnectedAccount,
  type LinkCodeResponse,
  type ProviderType,
  normalizeProviderName,
  toConnectedAccount,
} from '../types/account'
import {
  getApiUrl,
  getAuthHeaders,
  parseResponsePayload,
  throwApiError,
} from './apiClient'

const SUPPORTED_PROVIDERS = new Set(['discord', 'telegram'])

function keepSupportedProviders(providers: ConnectedAccount[]) {
  return providers.filter((provider) => SUPPORTED_PROVIDERS.has(provider.provider))
}

function mapProviderFromRichValue(provider: string, value: AccountProviderMapValue): ConnectedAccount {
  const profile = value.profile
  const connected = Boolean(value.connected)
  return toConnectedAccount({
    provider,
    connected,
    status: value.status,
    username: value.username ?? profile?.username,
    displayName: value.displayName ?? profile?.displayName,
    avatarUrl: value.avatarUrl ?? profile?.avatarUrl,
    connectedAt: value.connectedAt ?? profile?.connectedAt,
  })
}

function getLinkCodeExpiry(payload: Record<string, unknown>) {
  const expiresAt = typeof payload.expiresAt === 'string' ? payload.expiresAt : null

  if (typeof payload.expiresInSeconds === 'number') {
    return { expiresAt, expiresInSeconds: payload.expiresInSeconds }
  }

  if (typeof payload.expiresIn === 'number') {
    return { expiresAt, expiresInSeconds: payload.expiresIn }
  }

  return { expiresAt, expiresInSeconds: null }
}

export async function getProviders(token?: string | null): Promise<ConnectedAccount[]> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/account/providers`, {
    method: 'GET',
    headers: getAuthHeaders(token),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to load providers right now.', false)
  }

  const accountPayload = payload as AccountProvidersResponse & Record<string, unknown>

  if (Array.isArray(accountPayload.providers)) {
    return keepSupportedProviders(accountPayload.providers.map(toConnectedAccount))
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const mappedProviders = Object.entries(payload).flatMap(([provider, connected]) => {
    if (typeof connected === 'boolean') {
      return [
        toConnectedAccount({
          provider,
          connected,
          status: connected ? 'CONNECTED' : 'NOT_CONNECTED',
        }),
      ]
    }

    if (connected && typeof connected === 'object') {
      return [mapProviderFromRichValue(provider, connected as AccountProviderMapValue)]
    }

    return []
  })

  return keepSupportedProviders(mappedProviders)
}

export async function refreshProviders(token?: string | null): Promise<ConnectedAccount[]> {
  return getProviders(token)
}

export async function linkProvider(token: string | null | undefined, provider: ProviderType): Promise<LinkCodeResponse> {
  const apiUrl = getApiUrl()
  const normalizedProvider = normalizeProviderName(provider)
  const response = await fetch(`${apiUrl}/api/account/link`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ provider: normalizedProvider }),
    credentials: 'include',
  })

  const payload = (await parseResponsePayload(response)) as Record<string, unknown> | null

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to generate a link code right now.', false)
  }

  const code = typeof payload?.code === 'string' ? payload.code : null
  const loginUrl = typeof payload?.loginUrl === 'string' ? payload.loginUrl : null

  if (!code && !loginUrl) {
    throw new Error('SIT Core did not return a valid linking payload.')
  }

  const { expiresAt, expiresInSeconds } = getLinkCodeExpiry(payload ?? {})
  return {
    provider: normalizedProvider,
    code: code ?? undefined,
    loginUrl: loginUrl ?? undefined,
    expiresAt,
    expiresInSeconds,
  }
}

export async function disconnectProvider(token: string | null | undefined, provider: ProviderType): Promise<void> {
  const apiUrl = getApiUrl()
  const normalizedProvider = normalizeProviderName(provider)
  const response = await fetch(`${apiUrl}/api/account/provider/${encodeURIComponent(normalizedProvider)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to disconnect provider right now.', false)
  }
}
