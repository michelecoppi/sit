import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { disconnectProvider, getProviders, linkProvider } from './accountService'

describe('account services', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('normalizes provider maps and excludes unsupported providers', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      discord: {
        connected: true,
        profile: {
          username: 'researcher-six',
          displayName: 'Researcher Six',
        },
      },
      telegram: false,
      github: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(getProviders()).resolves.toEqual([
      expect.objectContaining({
        provider: 'discord',
        connected: true,
        status: 'CONNECTED',
        username: 'researcher-six',
        displayName: 'Researcher Six',
      }),
      expect.objectContaining({
        provider: 'telegram',
        connected: false,
        status: 'NOT_CONNECTED',
      }),
    ])
  })

  it('creates a normalized account-link request from the OpenAPI response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'SIT-6701',
      expires_at: '2026-07-29T12:00:00.000Z',
      expires_in_seconds: 300,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(linkProvider(' TELEGRAM ')).resolves.toEqual({
      provider: 'telegram',
      code: 'SIT-6701',
      loginUrl: undefined,
      expiresAt: '2026-07-29T12:00:00.000Z',
      expiresInSeconds: 300,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/api/account/link',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ provider: 'telegram' }),
      }),
    )
  })

  it('rejects malformed linking payloads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      expiresInSeconds: 300,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(linkProvider('telegram')).rejects.toThrow('SIT Core did not return a valid linking payload.')
  })

  it('disconnects normalized providers using cookie credentials', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await disconnectProvider(' Discord ')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/api/account/provider/discord',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }),
    )
  })
})
