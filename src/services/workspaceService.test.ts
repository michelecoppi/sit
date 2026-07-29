import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  WorkspaceConflictError,
  updateWorkspaceCapsule,
} from './workspaceService'

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.sit.test')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('workspaceService', () => {
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
