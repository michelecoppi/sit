let sitToken: string | null = null
let unauthorizedHandler: ((message: string) => void) | null = null
const tokenListeners = new Set<(token: string | null) => void>()

function notifyTokenListeners() {
  tokenListeners.forEach((listener) => listener(sitToken))
}

export function setSitToken(token: string) {
  const normalizedToken = token.trim()
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
