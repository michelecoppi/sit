import { handleUnauthorizedSession } from '../utils/authSession'

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
  invalid_provider: 'Unsupported provider.',
  missing_bearer_token: 'Please sign in to continue.',
  invalid_token: 'Invalid session, please sign in again.',
  provider_already_linked: 'Provider already linked to a profile.',
  invalid_code: 'Invalid code.',
  expired_code: 'Expired code.',
  invalid_login_ticket: 'Invalid login ticket.',
  expired_login_ticket: 'Ticket expired.',
  used_login_ticket: 'Ticket already used.',
  too_many_requests: 'Too many requests, please try again shortly.',
  team_private: 'This research team is private.',
  team_archived: 'This research team has been archived.',
  invite_expired: 'This team invitation has expired.',
  already_team_member: 'You are already a member of this research team.',
  permission_denied: 'You do not have permission to perform this team action.',
}

function parseErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const directCode = (payload as { code?: unknown }).code
  if (typeof directCode === 'string' && directCode.trim()) return directCode.trim()

  const errorValue = (payload as { error?: unknown }).error
  if (typeof errorValue === 'string' && errorValue.trim()) return errorValue.trim()

  const nestedCode = isErrorObject(errorValue) ? errorValue.code : undefined
  if (typeof nestedCode === 'string' && nestedCode.trim()) return nestedCode.trim()

  const snakeCaseCode = (payload as { error_code?: unknown }).error_code
  if (typeof snakeCaseCode === 'string' && snakeCaseCode.trim()) return snakeCaseCode.trim()

  const detailsCode = (payload as { details?: { code?: unknown } }).details?.code
  if (typeof detailsCode === 'string' && detailsCode.trim()) return detailsCode.trim()

  return null
}

function isErrorObject(value: unknown): value is { code?: unknown, message?: unknown } {
  return Boolean(value) && typeof value === 'object'
}

function parseErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const directMessage = (payload as { message?: unknown }).message
  if (typeof directMessage === 'string' && directMessage.trim()) return directMessage.trim()

  const errorValue = (payload as { error?: unknown }).error
  const nestedMessage = isErrorObject(errorValue) ? errorValue.message : undefined
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

export function getApiHeaders() {
  return {
    'Content-Type': 'application/json',
  }
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
