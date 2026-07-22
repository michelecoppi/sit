import { getSitToken, handleUnauthorizedSession } from '../utils/authToken'

export class ApiClientError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_provider: 'Provider non supportato.',
  missing_bearer_token: 'Effettua login per continuare.',
  invalid_token: 'Sessione non valida, accedi di nuovo.',
  provider_already_linked: 'Provider gia collegato a un profilo.',
  invalid_code: 'Codice non valido.',
  expired_code: 'Codice scaduto.',
  invalid_login_ticket: 'Ticket di login non valido.',
  expired_login_ticket: 'Ticket scaduto.',
  used_login_ticket: 'Ticket gia usato.',
  too_many_requests: 'Troppe richieste, riprova tra poco.',
}

function parseErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const directCode = (payload as { code?: unknown }).code
  if (typeof directCode === 'string' && directCode.trim()) return directCode.trim()

  const nestedCode = (payload as { error?: { code?: unknown } }).error?.code
  if (typeof nestedCode === 'string' && nestedCode.trim()) return nestedCode.trim()

  return null
}

function parseErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const directMessage = (payload as { message?: unknown }).message
  if (typeof directMessage === 'string' && directMessage.trim()) return directMessage.trim()

  const nestedMessage = (payload as { error?: { message?: unknown } }).error?.message
  if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage.trim()

  return null
}

export function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) {
    throw new Error('SIT Core is not configured.')
  }
  return apiUrl.replace(/\/+$/, '')
}

export function getAuthHeaders(token?: string | null) {
  const currentToken = token ?? getSitToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`
  }

  return headers
}

export async function parseResponsePayload(response: Response): Promise<unknown> {
  const rawText = await response.text()
  if (!rawText.trim()) return null

  try {
    return JSON.parse(rawText) as unknown
  } catch {
    return null
  }
}

export function resolveApiErrorMessage(status: number, payload: unknown, fallbackMessage: string) {
  const errorCode = parseErrorCode(payload)
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return {
      message: ERROR_MESSAGES[errorCode],
      code: errorCode,
    }
  }

  const backendMessage = parseErrorMessage(payload)
  if (backendMessage) {
    return {
      message: backendMessage,
      code: errorCode,
    }
  }

  if (status === 401) {
    return {
      message: ERROR_MESSAGES.invalid_token,
      code: errorCode,
    }
  }

  return {
    message: fallbackMessage,
    code: errorCode,
  }
}

export function throwApiError(status: number, payload: unknown, fallbackMessage: string, clearSessionOnUnauthorized = true): never {
  const { message, code } = resolveApiErrorMessage(status, payload, fallbackMessage)

  if (status === 401 && clearSessionOnUnauthorized) {
    handleUnauthorizedSession(message)
  }

  throw new ApiClientError(message, status, code)
}
