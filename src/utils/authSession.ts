let unauthorizedHandler: ((message: string) => void) | null = null

export function setUnauthorizedHandler(handler: ((message: string) => void) | null) {
  unauthorizedHandler = handler
}

export function handleUnauthorizedSession(message = 'Invalid or expired session.') {
  unauthorizedHandler?.(message)
}
