import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearSitToken,
  getSitToken,
  handleUnauthorizedSession,
  setSitToken,
  setUnauthorizedHandler,
  subscribeSitToken,
} from './authToken'

const TOKEN_STORAGE_KEY = 'sit_token'

describe('authToken session persistence', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearSitToken()
    setUnauthorizedHandler(null)
  })

  it('persists the token to sessionStorage so it survives a reload', () => {
    setSitToken('header.payload.signature')

    expect(getSitToken()).toBe('header.payload.signature')
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('header.payload.signature')
  })

  it('strips a Bearer prefix before storing the token', () => {
    setSitToken('  Bearer abc.def.ghi  ')

    expect(getSitToken()).toBe('abc.def.ghi')
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('abc.def.ghi')
  })

  it('strips surrounding quotes before storing the token', () => {
    setSitToken('"abc.def.ghi"')

    expect(getSitToken()).toBe('abc.def.ghi')
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('abc.def.ghi')
  })

  it('clears the stored token on logout', () => {
    setSitToken('abc.def.ghi')
    clearSitToken()

    expect(getSitToken()).toBeNull()
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('notifies subscribers when the token changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSitToken(listener)

    setSitToken('abc.def.ghi')
    clearSitToken()

    expect(listener).toHaveBeenNthCalledWith(1, 'abc.def.ghi')
    expect(listener).toHaveBeenNthCalledWith(2, null)

    unsubscribe()
  })

  it('clears the session and notifies the handler on an unauthorized response', () => {
    const handler = vi.fn()
    setSitToken('abc.def.ghi')
    setUnauthorizedHandler(handler)

    handleUnauthorizedSession('Session expired.')

    expect(getSitToken()).toBeNull()
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
    expect(handler).toHaveBeenCalledWith('Session expired.')
  })

  it('restores a token already present in sessionStorage when the module loads', async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, 'restored.token.value')
    vi.resetModules()

    const freshModule = await import('./authToken')

    expect(freshModule.getSitToken()).toBe('restored.token.value')
  })
})
