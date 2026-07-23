// The session token is mirrored into sessionStorage so a page reload keeps the
// researcher signed in. It is encrypted at rest with a non-extractable AES-GCM
// key held in IndexedDB: sessionStorage only ever sees ciphertext, so a raw
// storage dump (DevTools, a browser extension, a backup tool) can't read the
// token. This does not defend against XSS — same-origin script code can call
// the same decrypt path — but that residual risk is unavoidable for any
// client-side session store short of an httpOnly cookie from SIT Core.
const TOKEN_STORAGE_KEY = 'sit_token'
const DB_NAME = 'sit-auth'
const STORE_NAME = 'keys'
const KEY_ID = 'session-token-key'

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBuf(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function openKeyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

let keyPromise: Promise<CryptoKey> | null = null

function getOrCreateKey(): Promise<CryptoKey> {
  keyPromise ??= (async () => {
    const db = await openKeyDb()
    const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(KEY_ID)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    if (existing) return existing

    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(key, KEY_ID)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    return key
  })()
  return keyPromise
}

async function encryptToken(token: string): Promise<string> {
  const key = await getOrCreateKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token))
  return `${bufToBase64(iv)}.${bufToBase64(ciphertext)}`
}

async function decryptToken(payload: string): Promise<string | null> {
  const [ivPart, dataPart] = payload.split('.')
  if (!ivPart || !dataPart) return null

  const key = await getOrCreateKey()
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuf(ivPart) },
    key,
    base64ToBuf(dataPart),
  )
  return new TextDecoder().decode(plaintext)
}

async function readStoredToken(): Promise<string | null> {
  try {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    if (!stored) return null
    const decrypted = await decryptToken(stored)
    return decrypted?.trim() || null
  } catch {
    // Storage/crypto can be unavailable (private mode, disabled cookies) or the
    // stored payload can be stale/corrupt: stay in-memory.
    return null
  }
}

let writeSeq = 0

async function writeStoredToken(token: string | null): Promise<void> {
  const seq = ++writeSeq
  try {
    if (token) {
      const payload = await encryptToken(token)
      // A newer write (e.g. an immediate logout) may have landed while this
      // one was still encrypting; don't let a stale write clobber it.
      if (seq !== writeSeq) return
      sessionStorage.setItem(TOKEN_STORAGE_KEY, payload)
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // Ignore storage/crypto failures and keep the in-memory value authoritative.
  }
}

let sitToken: string | null = null
let unauthorizedHandler: ((message: string) => void) | null = null
const tokenListeners = new Set<(token: string | null) => void>()

function notifyTokenListeners() {
  tokenListeners.forEach((listener) => listener(sitToken))
}

// Resolves once the initial sessionStorage restore attempt (decrypt included)
// has settled. Consumers that read getSitToken() on mount (AuthContext) should
// await this first, otherwise a reload races a real token in storage against
// an in-memory null and briefly renders/queries as anonymous.
export const tokenRestored: Promise<void> = readStoredToken().then((restored) => {
  if (restored) {
    sitToken = restored
    notifyTokenListeners()
  }
})

export function setSitToken(token: string) {
  let normalizedToken = token.trim().replace(/^Bearer\s+/i, '')
  if (
    (normalizedToken.startsWith('"') && normalizedToken.endsWith('"'))
    || (normalizedToken.startsWith("'") && normalizedToken.endsWith("'"))
  ) {
    normalizedToken = normalizedToken.slice(1, -1).trim()
  }
  sitToken = normalizedToken || null
  void writeStoredToken(sitToken)
  notifyTokenListeners()
}

export function getSitToken() {
  return sitToken
}

export function clearSitToken() {
  sitToken = null
  void writeStoredToken(null)
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
