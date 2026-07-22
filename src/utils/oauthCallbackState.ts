let oauthCallbackError: string | null = null

function normalizeOAuthError(error: string) {
  const normalized = error.trim()
  if (!normalized) return 'oauth_failed'

  if (normalized === 'missing_token' || normalized === 'invalid_token') {
    return normalized
  }

  return 'oauth_failed'
}

export function setOAuthCallbackError(error: string) {
  oauthCallbackError = normalizeOAuthError(error)
}

export function consumeOAuthCallbackError() {
  const error = oauthCallbackError
  oauthCallbackError = null
  return error
}
