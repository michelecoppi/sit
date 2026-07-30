import { describe, expect, it, vi } from 'vitest'
import { isMissionActive } from './workspaceMission'
import type { WorkspaceMission } from '../types/workspace'

const mission = (overrides: Partial<WorkspaceMission> = {}): WorkspaceMission => ({
  id: 'mission-1',
  teamId: 'team-1',
  title: 'Daily objective',
  description: '',
  target: 3,
  metric: 'messages_encoded',
  difficulty: 'routine',
  teamXpReward: 10,
  status: 'active',
  dueAt: '2026-07-31T00:00:00.000Z',
  revision: 1,
  assignee: null,
  assignees: [],
  createdBy: { researcherId: 'researcher-1', displayName: 'Researcher' },
  individualProgress: 0,
  aggregateProgress: 0,
  completedAt: null,
  contributors: [],
  createdAt: '2026-07-30T00:00:00.000Z',
  updatedAt: '2026-07-30T00:00:00.000Z',
  ...overrides,
})

describe('isMissionActive', () => {
  it('rejects active missions whose due date has passed', () => {
    vi.setSystemTime(new Date('2026-07-31T00:00:01.000Z'))
    expect(isMissionActive(mission())).toBe(false)
    vi.useRealTimers()
  })

  it('accepts active missions with a future or missing due date', () => {
    vi.setSystemTime(new Date('2026-07-30T12:00:00.000Z'))
    expect(isMissionActive(mission())).toBe(true)
    expect(isMissionActive(mission({ dueAt: null }))).toBe(true)
    vi.useRealTimers()
  })

  it('rejects completed missions even when their due date is future', () => {
    expect(isMissionActive(mission({ status: 'completed' }))).toBe(false)
  })
})
