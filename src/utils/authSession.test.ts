import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleUnauthorizedSession, setUnauthorizedHandler } from './authSession'

describe('cookie session notifications', () => {
  beforeEach(() => {
    setUnauthorizedHandler(null)
    sessionStorage.clear()
  })

  it('notifies the authentication context after an unauthorized response', () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    handleUnauthorizedSession('Session expired.')

    expect(handler).toHaveBeenCalledWith('Session expired.')
  })

  it('never creates client-side token storage', () => {
    handleUnauthorizedSession()

    expect(sessionStorage.length).toBe(0)
  })
})
