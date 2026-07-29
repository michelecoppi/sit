import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClientError } from '../services/apiClient'
import type { MeResponse } from '../types/profile'
import { handleUnauthorizedSession, setUnauthorizedHandler } from '../utils/authSession'
import { AuthProvider, useAuth } from './AuthContext'

const { mockGetMe, mockLogoutSession } = vi.hoisted(() => ({
  mockGetMe: vi.fn(),
  mockLogoutSession: vi.fn(),
}))

vi.mock('../services/profileService', () => ({
  getMe: mockGetMe,
}))

vi.mock('../services/authService', () => ({
  logoutSession: mockLogoutSession,
}))

const meResponse = {
  profile: {
    researcherId: 'SIT-123456',
    displayName: 'Alice',
    rank: 'Researcher',
    xp: 100,
    level: 1,
    preferredVersion: 'LEGACY',
    messagesEncoded: 10,
    messagesDecoded: 20,
    syteProcessed: 300,
    preferredLanguage: 'en',
    autoTranslation: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  summary: {
    achievementCount: 0,
    linkedAccountCount: 1,
    recentTranslationCount: 0,
    lastTranslationAt: null,
  },
  recentTranslations: [],
  achievements: [],
  linkedAccounts: [],
} satisfies MeResponse

let authApi: ReturnType<typeof useAuth> | null = null

function AuthHarness() {
  authApi = useAuth()
  return (
    <div>
      <span>{authApi.status}</span>
      <span>{authApi.me?.profile.researcherId ?? 'no-profile'}</span>
      <span>{authApi.authError ?? 'no-error'}</span>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    authApi = null
    mockGetMe.mockReset()
    mockLogoutSession.mockReset()
    setUnauthorizedHandler(null)
  })

  it('restores an authenticated cookie session during bootstrap', async () => {
    mockGetMe.mockResolvedValue(meResponse)

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('authenticated')).toBeInTheDocument()
    })
    expect(screen.getByText('SIT-123456')).toBeInTheDocument()
    expect(screen.getByText('no-error')).toBeInTheDocument()
  })

  it('treats a rejected cookie as an anonymous session', async () => {
    mockGetMe.mockRejectedValue(new ApiClientError('Invalid session.', 401, 'invalid_token'))

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('anonymous')).toBeInTheDocument()
    })
    expect(screen.getByText('no-profile')).toBeInTheDocument()
  })

  it('invalidates authenticated state when an API request reports HTTP 401', async () => {
    mockGetMe.mockResolvedValue(meResponse)

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('authenticated')).toBeInTheDocument()
    })

    act(() => {
      handleUnauthorizedSession('Session expired.')
    })

    expect(screen.getByText('anonymous')).toBeInTheDocument()
    expect(screen.getByText('no-profile')).toBeInTheDocument()
    expect(screen.getByText('Session expired.')).toBeInTheDocument()
  })

  it('clears local identity after the backend expires the session cookie', async () => {
    mockGetMe.mockResolvedValue(meResponse)
    mockLogoutSession.mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('authenticated')).toBeInTheDocument()
    })

    await act(async () => {
      await authApi?.logout()
    })

    expect(mockLogoutSession).toHaveBeenCalledTimes(1)
    expect(screen.getByText('anonymous')).toBeInTheDocument()
    expect(screen.getByText('no-profile')).toBeInTheDocument()
  })
})
