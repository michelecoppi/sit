import { describe, expect, it } from 'vitest'
import { isWorkspaceMissionActive } from './workspaceService'
import type { WorkspaceMission } from '../types/workspace'

const mission = (dueAt: string | null, status: WorkspaceMission['status'] = 'active'): WorkspaceMission => ({
  id: 'm1', teamId: 't1', title: 'Mission', description: '', target: 3,
  metric: 'messages_encoded', difficulty: 'routine', teamXpReward: 1, status,
  dueAt, revision: 1, assignee: null, assignees: [],
  createdBy: { researcherId: 'r1', displayName: 'Researcher' }, individualProgress: 0,
  aggregateProgress: 0, completedAt: null, contributors: [], createdAt: '2026-07-30T00:00:00.000Z',
  updatedAt: '2026-07-30T00:00:00.000Z',
})

describe('isWorkspaceMissionActive', () => {
  it('hides an active mission once its due window has closed', () => {
    expect(isWorkspaceMissionActive(mission('2026-07-30T00:00:00.000Z'), Date.parse('2026-07-30T00:00:00.001Z'))).toBe(false)
  })

  it('keeps an active mission visible before its due window', () => {
    expect(isWorkspaceMissionActive(mission('2026-07-31T00:00:00.000Z'), Date.parse('2026-07-30T23:59:59.999Z'))).toBe(true)
  })

  it('does not revive missions with a terminal status', () => {
    expect(isWorkspaceMissionActive(mission(null, 'completed'))).toBe(false)
  })
})

