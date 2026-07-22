// The session token is mirrored into sessionStorage so a page reload keeps the
// researcher signed in. sessionStorage (not localStorage) is used deliberately:
// the token is scoped to the tab and cleared automatically when the tab closes,
// which keeps the exposure window narrow. It is still readable by same-origin
// scripts, so treat it as sensitive.
const TOKEN_STORAGE_KEY = 'sit_token'

function readStoredToken(): string | null {
  try {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    return stored && stored.trim() ? stored : null
  } catch {
    // Storage can be unavailable (private mode, disabled cookies): stay in-memory.
    return null
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures and keep the in-memory value authoritative.
  }
}

let sitToken: string | null = readStoredToken()
let unauthorizedHandler: ((message: string) => void) | null = null
const tokenListeners = new Set<(token: string | null) => void>()

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
  writeStoredToken(sitToken)
  notifyTokenListeners()
}

export function getSitToken() {
  return sitToken
}

export function clearSitToken() {
  sitToken = null
  writeStoredToken(null)
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

export function handleUnauthorizedSession(message = 'Invalid or expired session.') {
  clearSitToken()
  unauthorizedHandler?.(message)
}

export function prepareOAuthBridgeToken() {
  // Intentionally no-op: avoid persisting sensitive session tokens across redirects.
}

export function consumeOAuthBridgeToken() {
  return null
}
