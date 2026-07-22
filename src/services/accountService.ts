import {
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

export async function getProviders(token: string): Promise<ConnectedAccount[]> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/account/providers`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to load providers right now.')
  }

  const accountPayload = payload as AccountProvidersResponse & Record<string, unknown>

  if (Array.isArray(accountPayload.providers)) {
    return accountPayload.providers.map(toConnectedAccount)
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  return Object.entries(payload).flatMap(([provider, connected]) => {
    if (typeof connected !== 'boolean') return []
    return [
      toConnectedAccount({
        provider,
        connected,
        status: connected ? 'CONNECTED' : 'NOT_CONNECTED',
      }),
    ]
  })
}

export async function refreshProviders(token: string): Promise<ConnectedAccount[]> {
  return getProviders(token)
}

export async function linkProvider(token: string, provider: ProviderType): Promise<LinkCodeResponse> {
  const apiUrl = getApiUrl()
  const normalizedProvider = normalizeProviderName(provider)
  const response = await fetch(`${apiUrl}/api/account/link`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ provider: normalizedProvider }),
  })

  const payload = (await parseResponsePayload(response)) as Record<string, unknown> | null

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to generate a link code right now.')
  }

  const code = typeof payload?.code === 'string' ? payload.code : ''
  if (!code) {
    throw new Error('SIT Core did not return a valid link code.')
  }

  const { expiresAt, expiresInSeconds } = getLinkCodeExpiry(payload ?? {})
  return {
    provider: normalizedProvider,
    code,
    expiresAt,
    expiresInSeconds,
  }
}

export async function disconnectProvider(token: string, provider: ProviderType): Promise<void> {
  const apiUrl = getApiUrl()
  const normalizedProvider = normalizeProviderName(provider)
  const response = await fetch(`${apiUrl}/api/account/provider/${encodeURIComponent(normalizedProvider)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to disconnect provider right now.')
  }
}
