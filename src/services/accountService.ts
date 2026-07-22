import {
  type AccountProvidersResponse,
  type ConnectedAccount,
  type LinkCodeResponse,
  type ProviderType,
  normalizeProviderName,
  toConnectedAccount,
} from '../types/account'

function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) {
    throw new Error('SIT Core is not configured.')
  }
  return apiUrl.replace(/\/+$/, '')
}

function createAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function mapApiError(status: number) {
  if (status === 401) return 'Your session expired. Please log in again.'
  if (status === 404) return 'Provider not available right now.'
  if (status === 409) return 'This account is already linked.'
  if (status >= 500) return 'SIT Core is temporarily unavailable. Please try again.'
  return 'Unable to complete the request right now.'
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

export async function getProviders(token: string): Promise<ConnectedAccount[]> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/account/providers`, {
    method: 'GET',
    headers: createAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error(mapApiError(response.status))
  }

  const payload = (await response.json()) as AccountProvidersResponse
  if (!Array.isArray(payload.providers)) {
    return []
  }

  return payload.providers.map(toConnectedAccount)
}

export async function refreshProviders(token: string): Promise<ConnectedAccount[]> {
  return getProviders(token)
}

export async function linkProvider(token: string, provider: ProviderType): Promise<LinkCodeResponse> {
  const apiUrl = getApiUrl()
  const normalizedProvider = normalizeProviderName(provider)
  const response = await fetch(`${apiUrl}/api/account/link`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify({ provider: normalizedProvider }),
  })

  const rawText = await response.text()
  const payload = safeJsonParse<Record<string, unknown>>(rawText) ?? {}

  if (!response.ok) {
    const backendMessage = typeof payload.message === 'string' ? payload.message : null
    throw new Error(backendMessage ?? mapApiError(response.status))
  }

  const code = typeof payload.code === 'string' ? payload.code : ''
  if (!code) {
    throw new Error('SIT Core did not return a valid link code.')
  }

  const { expiresAt, expiresInSeconds } = getLinkCodeExpiry(payload)
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
    headers: createAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error(mapApiError(response.status))
  }
}
