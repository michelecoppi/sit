import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import ProfilePage from './ProfilePage'
import type { MeResponse } from '../types/profile'
import type { StatisticsSnapshotResponse } from '../types/statistics'

const { mockGetStatisticsSnapshot, mockAuth, mockAccount } = vi.hoisted(() => ({
  mockGetStatisticsSnapshot: vi.fn<() => Promise<StatisticsSnapshotResponse>>(),
  mockAuth: {
    token: 'header.payload.signature',
    me: {
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
        achievementCount: 1,
        linkedAccountCount: 2,
        recentTranslationCount: 3,
        lastTranslationAt: '2026-01-02T00:00:00.000Z',
      },
      recentTranslations: [
        {
          id: 1,
          messageId: 'discord-1',
          provider: 'discord',
          guildId: 'guild-discord',
          channelId: 'channel-1',
          sourceContent: 'one',
          decodedContent: 'uno',
          detectedStandard: 'SIT 2.0',
          compliance: 100,
          syteCount: 10,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          messageId: 'telegram-1',
          provider: 'telegram',
          guildId: 'telegram:group-1',
          channelId: 'channel-2',
          sourceContent: 'two',
          decodedContent: 'due',
          detectedStandard: 'SIT 2.0',
          compliance: 95,
          syteCount: 12,
          createdAt: '2026-01-02T00:00:00.000Z',
        },
        {
          id: 3,
          messageId: 'legacy-1',
          provider: null,
          guildId: null,
          channelId: 'channel-3',
          sourceContent: 'three',
          decodedContent: 'tre',
          detectedStandard: 'SIT 1.0',
          compliance: 90,
          syteCount: 14,
          createdAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      achievements: [],
      linkedAccounts: [],
    } as MeResponse,
    status: 'authenticated' as const,
    authError: null,
    isBootstrapping: false,
    completeLogin: vi.fn(),
    refreshMe: vi.fn(),
    logout: vi.fn(),
    clearAuthError: vi.fn(),
  },
  mockAccount: {
    providers: [
      { provider: 'discord', connected: true, status: 'CONNECTED' as const },
      { provider: 'telegram', connected: true, status: 'CONNECTED' as const },
    ],
    isLoading: false,
    providersError: null,
    refreshProviders: vi.fn(async () => {}),
    refreshProvidersOnly: vi.fn(async () => []),
    generateLinkCode: vi.fn(async () => ({
      provider: 'telegram',
      code: '123456',
      loginUrl: null,
      expiresAt: null,
      expiresInSeconds: 60,
    })),
  },
}))

vi.mock('../services/profileService', () => ({
  getStatisticsSnapshot: mockGetStatisticsSnapshot,
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}))

vi.mock('../context/AccountContext', () => ({
  AccountProvider: ({ children }: { children: ReactNode }) => children,
  useAccount: () => mockAccount,
}))

describe('ProfilePage', () => {
  it('uses statistics snapshot and switches between global and provider summaries', async () => {
    mockGetStatisticsSnapshot.mockResolvedValue({
      providers: ['discord', 'telegram'],
      snapshot: {
        global: {
          registeredUsers: 12,
          totalMessages: 340,
          totalEncodings: 120,
          totalDecodings: 210,
          totalSyte: 5820,
          mostActiveUser: 'Alice',
        },
        byProvider: {
          discord: {
            registeredUsers: 8,
            totalMessages: 220,
            totalEncodings: 95,
            totalDecodings: 125,
            totalSyte: 4020,
            mostActiveUser: 'Alice',
          },
          telegram: {
            registeredUsers: 4,
            totalMessages: 120,
            totalEncodings: 25,
            totalDecodings: 85,
            totalSyte: 1800,
            mostActiveUser: 'Alice',
          },
        },
      },
    })

    render(<ProfilePage />)

    fireEvent.click(screen.getByRole('button', { name: 'My Profile' }))

    await waitFor(() => {
      expect(mockGetStatisticsSnapshot).toHaveBeenCalled()
    })

    expect(screen.getByRole('button', { name: 'Global' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Discord' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Telegram' }).length).toBeGreaterThan(0)

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('340')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: 'Discord' })[0])
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('220')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: 'Telegram' })[0])
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('filters recent translations by provider', async () => {
    mockGetStatisticsSnapshot.mockResolvedValue({
      providers: ['discord', 'telegram'],
      snapshot: {
        global: {
          registeredUsers: 12,
          totalMessages: 340,
          totalEncodings: 120,
          totalDecodings: 210,
          totalSyte: 5820,
          mostActiveUser: 'Alice',
        },
        byProvider: {
          discord: {
            registeredUsers: 8,
            totalMessages: 220,
            totalEncodings: 95,
            totalDecodings: 125,
            totalSyte: 4020,
            mostActiveUser: 'Alice',
          },
          telegram: {
            registeredUsers: 4,
            totalMessages: 120,
            totalEncodings: 25,
            totalDecodings: 85,
            totalSyte: 1800,
            mostActiveUser: 'Alice',
          },
        },
      },
    })

    render(<ProfilePage />)

    fireEvent.click(screen.getByRole('button', { name: 'My Profile' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/discord-1/)).toBeInTheDocument()
      expect(screen.getByText(/telegram-1/)).toBeInTheDocument()
      expect(screen.getByText(/legacy-1/)).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Discord' })[1])
    await waitFor(() => {
      expect(screen.getByText(/discord-1/)).toBeInTheDocument()
      expect(screen.queryByText(/telegram-1/)).not.toBeInTheDocument()
      expect(screen.queryByText(/legacy-1/)).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Telegram' })[1])
    await waitFor(() => {
      expect(screen.getByText(/telegram-1/)).toBeInTheDocument()
      expect(screen.queryByText(/discord-1/)).not.toBeInTheDocument()
      expect(screen.queryByText(/legacy-1/)).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    await waitFor(() => {
      expect(screen.getByText(/discord-1/)).toBeInTheDocument()
      expect(screen.getByText(/telegram-1/)).toBeInTheDocument()
      expect(screen.getByText(/legacy-1/)).toBeInTheDocument()
    })
  })
})
