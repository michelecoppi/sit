import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  WorkspaceConflictError,
  recordWorkspaceMissionProgress,
  updateWorkspaceCapsule,
} from './workspaceService'

const identity = { researcherId: 'SIT-0067', displayName: 'Researcher' }
const mission = {
  id: '11',
  teamId: '7',
  title: 'Calibrate registry',
  description: '',
  target: 3,
  xpReward: 67,
  status: 'active',
  dueAt: null,
  revision: 1,
  assignee: null,
  createdBy: identity,
  individualProgress: 3,
  aggregateProgress: 3,
  completedAt: '2026-07-29T12:00:00.000Z',
  contributors: [{ ...identity, progress: 3, completedAt: '2026-07-29T12:00:00.000Z', updatedAt: '2026-07-29T12:00:00.000Z' }],
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T12:00:00.000Z',
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.sit.test')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('workspaceService', () => {
  it('sends an idempotency key and parses synchronized mission progress', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(mission), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await recordWorkspaceMissionProgress('7', '11', 3, 'progress-0001')

    expect(result.aggregateProgress).toBe(3)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://core.sit.test/api/teams/7/missions/11/progress',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'idempotency-key': 'progress-0001' }),
        credentials: 'include',
      }),
    )
  })

  it('turns backend optimistic concurrency failures into a reloadable conflict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'revision_conflict',
    }), { status: 409, headers: { 'content-type': 'application/json' } })))

    await expect(updateWorkspaceCapsule('7', '12', 2, {
      title: 'Protocol note',
      description: '',
      payload: '6767',
    })).rejects.toBeInstanceOf(WorkspaceConflictError)
  })
})
