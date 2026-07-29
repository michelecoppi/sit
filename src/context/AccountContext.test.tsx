import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AccountProvider, useAccount } from './AccountContext'

const { mockGetProviders, mockLinkProvider, mockAuth } = vi.hoisted(() => ({
  mockGetProviders: vi.fn(),
  mockLinkProvider: vi.fn(),
  mockAuth: {
    status: 'authenticated' as 'anonymous' | 'loading' | 'authenticated',
  },
}))

vi.mock('../services/accountService', () => ({
  getProviders: mockGetProviders,
  linkProvider: mockLinkProvider,
}))

vi.mock('./AuthContext', () => ({
  useAuth: () => mockAuth,
}))

let accountApi: ReturnType<typeof useAccount> | null = null

function AccountHarness() {
  accountApi = useAccount()
  return (
    <div>
      <span>{accountApi.isLoading ? 'loading' : 'ready'}</span>
      <span>{accountApi.providers.map(({ provider, status }) => `${provider}:${status}`).join(',')}</span>
      <span>{accountApi.providersError ?? 'no-error'}</span>
    </div>
  )
}

describe('AccountProvider', () => {
  beforeEach(() => {
    accountApi = null
    mockAuth.status = 'authenticated'
    mockGetProviders.mockReset()
    mockLinkProvider.mockReset()
  })

  it('loads connected accounts for an authenticated session', async () => {
    mockGetProviders.mockResolvedValue([
      { provider: 'discord', connected: true, status: 'CONNECTED' },
    ])

    render(
      <AccountProvider>
        <AccountHarness />
      </AccountProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('discord:CONNECTED')).toBeInTheDocument()
    })
    expect(screen.getByText('ready')).toBeInTheDocument()
    expect(screen.getByText('no-error')).toBeInTheDocument()
  })

  it('marks a provider pending after starting account linking', async () => {
    mockGetProviders.mockResolvedValue([
      { provider: 'telegram', connected: false, status: 'NOT_CONNECTED' },
    ])
    mockLinkProvider.mockResolvedValue({
      provider: 'telegram',
      code: 'SIT-6701',
      expiresAt: null,
      expiresInSeconds: 300,
    })

    render(
      <AccountProvider>
        <AccountHarness />
      </AccountProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('telegram:NOT_CONNECTED')).toBeInTheDocument()
    })

    await act(async () => {
      await accountApi?.generateLinkCode('telegram')
    })

    expect(mockLinkProvider).toHaveBeenCalledWith('telegram')
    expect(screen.getByText('telegram:PENDING')).toBeInTheDocument()
  })

  it('does not call account APIs for anonymous sessions', async () => {
    mockAuth.status = 'anonymous'

    render(
      <AccountProvider>
        <AccountHarness />
      </AccountProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeInTheDocument()
    })
    expect(mockGetProviders).not.toHaveBeenCalled()

    await expect(accountApi?.generateLinkCode('telegram')).rejects.toThrow('Please sign in to continue.')
    expect(mockLinkProvider).not.toHaveBeenCalled()
  })
})
