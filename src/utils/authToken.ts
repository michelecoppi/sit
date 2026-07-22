let sitToken: string | null = null
let unauthorizedHandler: ((message: string) => void) | null = null
const tokenListeners = new Set<(token: string | null) => void>()
const OAUTH_BRIDGE_STORAGE_KEY = 'sit_oauth_bridge_token'
const OAUTH_BRIDGE_TTL_MS = 10 * 60 * 1000

type OAuthBridgePayload = {
  token: string
  savedAt: number
}

function notifyTokenListeners() {
  tokenListeners.forEach((listener) => listener(sitToken))
}

export function setSitToken(token: string) {
  let normalizedToken = token.trim().replace(/^Bearer\s+/i, '')
  if (
    (normalizedToken.startsWith('"') && normalizedToken.endsWith('"'))
    || (normalizedToken.startsWith("'") && normalizedToken.endsWith("'"))
  ) {
    normalizedToken = normalizedToken.slice(1, -1).trim()
  }
  sitToken = normalizedToken || null
  notifyTokenListeners()
}

export function getSitToken() {
  return sitToken
}

export function clearSitToken() {
  sitToken = null
  notifyTokenListeners()
}

export function subscribeSitToken(listener: (token: string | null) => void) {
  tokenListeners.add(listener)
  return () => {
    tokenListeners.delete(listener)
  }
}

export function setUnauthorizedHandler(handler: ((message: string) => void) | null) {
  unauthorizedHandler = handler
}

export function handleUnauthorizedSession(message = 'Sessione non valida o scaduta.') {
  clearSitToken()
  unauthorizedHandler?.(message)
}

export function prepareOAuthBridgeToken() {
  if (!sitToken) return

  const payload: OAuthBridgePayload = {
    token: sitToken,
    savedAt: Date.now(),
  }

  try {
    sessionStorage.setItem(OAUTH_BRIDGE_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Best effort only.
  }
}

export function consumeOAuthBridgeToken() {
  try {
    const raw = sessionStorage.getItem(OAUTH_BRIDGE_STORAGE_KEY)
    sessionStorage.removeItem(OAUTH_BRIDGE_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as OAuthBridgePayload
    if (!parsed?.token || typeof parsed.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > OAUTH_BRIDGE_TTL_MS) return null

    return parsed.token
  } catch {
    return null
  }
}
