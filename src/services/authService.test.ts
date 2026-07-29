import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getApiHeaders } from './apiClient'
import { createLoginTicket, getLoginStatus, logoutSession } from './authService'

describe('cookie-based authentication services', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('never constructs an Authorization header', () => {
    expect(getApiHeaders()).toEqual({
      'Content-Type': 'application/json',
    })
  })

  it('uses the OpenAPI Telegram ticket contract', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({
        ticket: 'TG_LOGIN_123',
        loginUrl: 'https://t.me/sit_bot?start=TG_LOGIN_123',
        expiresAt: '2026-07-28T12:00:00.000Z',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(createLoginTicket('telegram')).resolves.toEqual({
      ticket: 'TG_LOGIN_123',
      loginUrl: 'https://t.me/sit_bot?start=TG_LOGIN_123',
      expiresAt: '2026-07-28T12:00:00.000Z',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/api/auth/login-ticket',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ provider: 'telegram' }),
      }),
    )
  })

  it('accepts a completed Telegram login without reading a JWT', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({ status: 'COMPLETED' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(getLoginStatus('TG_LOGIN_123')).resolves.toEqual({ status: 'COMPLETED' })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/api/auth/login-status?ticket=TG_LOGIN_123',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('rejects an unknown Telegram login status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({ status: 'APPROVED_SOMEWHERE_ELSE' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(getLoginStatus('TG_LOGIN_123')).rejects.toThrow(
      'SIT Core returned an invalid login status.',
    )
  })

  it('rejects incomplete login-ticket responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({
        ticket: 'TG_LOGIN_123',
        loginUrl: 'https://t.me/sit_bot?start=TG_LOGIN_123',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(createLoginTicket('telegram')).rejects.toThrow(
      'SIT Core returned an invalid login ticket payload.',
    )
  })

  it('logs out by asking the backend to expire the HttpOnly cookie', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await logoutSession()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
})
