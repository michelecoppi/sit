import {
  getApiUrl,
  getAuthHeaders,
  parseResponsePayload,
  throwApiError,
} from './apiClient'
import type {
  CreateLoginTicketResponse,
  LoginStatusResponse,
  LoginTicketStatus,
} from '../types/auth'

function normalizeTicketStatus(value: unknown): LoginTicketStatus | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()

  if (normalized === 'PENDING') return 'PENDING'
  if (normalized === 'COMPLETED') return 'COMPLETED'
  if (normalized === 'EXPIRED') return 'EXPIRED'
  if (normalized === 'USED') return 'USED'

  return null
}

export async function createLoginTicket(provider: 'telegram'): Promise<CreateLoginTicketResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/auth/login-ticket`, {
    method: 'POST',
    headers: getAuthHeaders(null),
    body: JSON.stringify({ provider }),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to generate a login ticket right now.', false)
  }

  const ticket = typeof (payload as { ticket?: unknown })?.ticket === 'string'
    ? (payload as { ticket: string }).ticket
    : ''
  const loginUrl = typeof (payload as { loginUrl?: unknown })?.loginUrl === 'string'
    ? (payload as { loginUrl: string }).loginUrl
    : ''
  const expiresAt = typeof (payload as { expiresAt?: unknown })?.expiresAt === 'string'
    ? (payload as { expiresAt: string }).expiresAt
    : ''

  if (!ticket || !loginUrl || !expiresAt) {
    throw new Error('SIT Core returned an invalid login ticket payload.')
  }

  return {
    ticket,
    loginUrl,
    expiresAt,
  }
}

export async function getLoginStatus(ticket: string): Promise<LoginStatusResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/auth/login-status?ticket=${encodeURIComponent(ticket)}`, {
    method: 'GET',
    headers: getAuthHeaders(null),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to verify login status right now.', false)
  }

  const status = normalizeTicketStatus((payload as { status?: unknown })?.status)
  if (!status) {
    throw new Error('SIT Core returned an invalid login status.')
  }

  if (status === 'COMPLETED') {
    const token = typeof (payload as { token?: unknown })?.token === 'string'
      ? (payload as { token: string }).token.trim()
      : ''

    if (!token) {
      throw new Error('SIT Core reported a completed login without token.')
    }

    return {
      status,
      token,
    }
  }

  return {
    status,
  }
}

export function getDiscordLoginUrl() {
  const apiUrl = getApiUrl()
  return `${apiUrl}/api/oauth/discord/login`
}
