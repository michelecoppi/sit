import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MissionsPage from './MissionsPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    status: 'authenticated',
    me: { profile: { researcherId: 'SIT-0067' } },
  }),
}))

const mission = {
  code: 'daily_encode_3',
  title: 'Three clean transmissions',
  description: 'Encode three messages through any linked SIT provider.',
  cadence: 'daily',
  metric: 'messages_encoded',
  target: 3,
  progress: 2,
  remaining: 1,
  xpReward: 40,
  state: 'active',
  startsAt: '2026-07-26T00:00:00.000Z',
  resetsAt: '2026-07-27T00:00:00.000Z',
  completedAt: null,
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.sit.test')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('authenticated mission flow', () => {
  it('loads authoritative progress and streak data without polling duplicate endpoints', async () => {
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = String(input)
      if (url.endsWith('/api/missions/streak')) {
        return Promise.resolve(new Response(JSON.stringify({
          current: 4,
          best: 9,
          lastQualifiedDate: '2026-07-25T00:00:00.000Z',
          timezone: 'UTC',
          rules: 'Complete one daily directive before its UTC reset.',
        })))
      }
      return Promise.resolve(new Response(JSON.stringify({
        missions: [mission],
        rotation: {
          daily: {
            startsAt: '2026-07-26T00:00:00.000Z',
            resetsAt: '2026-07-27T00:00:00.000Z',
            missionCount: 3,
          },
          weekly: {
            startsAt: '2026-07-20T00:00:00.000Z',
            resetsAt: '2026-07-27T00:00:00.000Z',
            missionCount: 3,
          },
        },
        serverTime: '2026-07-26T12:00:00.000Z',
      })))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<MemoryRouter><MissionsPage /></MemoryRouter>)

    expect(await screen.findByText('Three clean transmissions')).toBeInTheDocument()
    expect(screen.getByText('1 remaining')).toBeInTheDocument()
    expect(screen.getByText('4 days')).toBeInTheDocument()
    expect(screen.getByText('Daily field brief')).toBeInTheDocument()
    expect(screen.getAllByText('3 rotating directives')).toHaveLength(2)
    expect(screen.getByRole('progressbar', { name: 'Three clean transmissions progress' })).toHaveAttribute('aria-valuenow', '2')

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/api/missions')).length).toBe(1)
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/api/missions/streak')).length).toBe(1)
  })
})
