import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TeamDetail } from '../../types/teams'
import TeamWorkspaceBoards from './TeamWorkspaceBoards'

const identity = { researcherId: 'SIT-0067', displayName: 'Researcher' }
const mission = {
  id: '11',
  teamId: '7',
  title: 'Calibrate registry',
  description: '',
  target: 3,
  xpReward: 67,
  status: 'active' as const,
  dueAt: null,
  revision: 1,
  assignee: null,
  createdBy: identity,
  individualProgress: 0,
  aggregateProgress: 0,
  completedAt: null,
  contributors: [],
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
}

const permissions = {
  editTeam: false,
  inviteMembers: false,
  manageMembers: false,
  changeRoles: false,
  transferOwnership: false,
  archiveTeam: false,
  leaveTeam: true,
  manageMissions: false,
  contribute: true,
  publishCapsules: true,
}

const team: TeamDetail = {
  id: '7',
  name: 'Symbolic Lab',
  slug: 'symbolic-lab',
  description: '',
  visibility: 'private',
  archivedAt: null,
  memberCount: 1,
  totalXp: 0,
  totalContributions: 0,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
  currentMember: { ...identity, role: 'member', xp: 0, contributions: 0, joinedAt: '2026-07-29T10:00:00.000Z' },
  permissions,
}

const service = vi.hoisted(() => ({
  listWorkspaceMissions: vi.fn(),
  listWorkspaceCapsules: vi.fn(),
  recordWorkspaceMissionProgress: vi.fn(),
}))

vi.mock('../../services/workspaceService', () => ({
  ...service,
  createWorkspaceMission: vi.fn(),
  createWorkspaceCapsule: vi.fn(),
  updateWorkspaceCapsule: vi.fn(),
  publishWorkspaceCapsule: vi.fn(),
  addWorkspaceCapsuleContributor: vi.fn(),
  WorkspaceConflictError: class WorkspaceConflictError extends Error {},
}))

beforeEach(() => {
  service.listWorkspaceMissions.mockResolvedValue({ items: [mission], nextCursor: null })
  service.listWorkspaceCapsules.mockResolvedValue({ items: [], nextCursor: null })
  service.recordWorkspaceMissionProgress.mockReset()
})

describe('TeamWorkspaceBoards', () => {
  it('rolls back optimistic mission progress when Core rejects synchronization', async () => {
    service.recordWorkspaceMissionProgress.mockRejectedValue(new Error('Core rejected progress.'))
    render(<TeamWorkspaceBoards team={team} />)

    const progressInput = await screen.findByRole('spinbutton', { name: 'Set progress' })
    fireEvent.change(progressInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Core rejected progress.')
    await waitFor(() => expect(screen.getByText('Individual 0/3')).toBeInTheDocument())
  })

  it('keeps viewers read-only even when workspace data is visible', async () => {
    render(<TeamWorkspaceBoards team={{
      ...team,
      currentMember: { ...team.currentMember!, role: 'viewer' },
      permissions: { ...permissions, contribute: false, publishCapsules: false },
    }} />)

    expect(await screen.findByText('Calibrate registry')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New draft' })).not.toBeInTheDocument()
  })
})
