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
  metric: 'messages_encoded' as const,
  difficulty: 'standard' as const,
  teamXpReward: 70,
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
  progression: {
    teamXp: 0,
    level: 1,
    currentLevelXp: 0,
    nextLevelXp: 200,
    levelProgress: 0,
    unlockedFeatures: [{ level: 1, code: 'workspace', label: 'Team workspace' }],
    nextUnlock: { level: 2, code: 'advanced_missions', label: 'Advanced missions' },
    missionPolicy: {
      dailyLimit: 1,
      canCreateToday: true,
      nextCreationAt: null,
      activityTypes: [{ metric: 'messages_encoded', label: 'Encode messages', unit: 'messages', description: 'Encode messages.', bands: [{ maxTarget: 3, difficulty: 'routine', baseTeamXp: 40, requiredLevel: 1, unlocked: true, assignedReward: 40, collaborationReward: 40 }, { maxTarget: null, difficulty: 'critical', baseTeamXp: 90, requiredLevel: 4, unlocked: false, assignedReward: 90, collaborationReward: 90 }] }],
    },
  },
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
  currentMember: { ...identity, role: 'member', xp: 0, contributions: 0, joinedAt: '2026-07-29T10:00:00.000Z' },
  permissions,
}

const service = vi.hoisted(() => ({
  listWorkspaceMissions: vi.fn(),
  listWorkspaceCapsules: vi.fn(),
  recordWorkspaceMissionProgress: vi.fn(),
  createWorkspaceMission: vi.fn(),
}))

vi.mock('../../services/workspaceService', () => ({
  ...service,
  createWorkspaceMission: service.createWorkspaceMission,
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
  service.createWorkspaceMission.mockReset()
})

describe('TeamWorkspaceBoards', () => {
  it('rolls back optimistic mission progress when Core rejects synchronization', async () => {
    service.recordWorkspaceMissionProgress.mockRejectedValue(new Error('Core rejected progress.'))
    render(<TeamWorkspaceBoards team={team} members={[team.currentMember!]} />)

    const progressInput = await screen.findByRole('spinbutton', { name: 'Set progress' })
    fireEvent.change(progressInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Core rejected progress.')
    await waitFor(() => expect(screen.getByText('Individual 0/3')).toBeInTheDocument())
  })

  it('keeps viewers read-only even when workspace data is visible', async () => {
    render(<TeamWorkspaceBoards members={[team.currentMember!]} team={{
      ...team,
      currentMember: { ...team.currentMember!, role: 'viewer' },
      permissions: { ...permissions, contribute: false, publishCapsules: false },
    }} />)

    expect(await screen.findByText('Calibrate registry')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New draft' })).not.toBeInTheDocument()
  })

  it('derives difficulty from activity and target and selects a real team member', async () => {
    const teammate = { ...team.currentMember!, researcherId: 'SIT-0068', displayName: 'Teammate', role: 'member' as const }
    render(<TeamWorkspaceBoards members={[team.currentMember!, teammate]} team={{
      ...team,
      permissions: { ...permissions, manageMissions: true },
    }} />)

    expect(await screen.findByRole('combobox', { name: 'Activity' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Difficulty' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Due date')).not.toBeInTheDocument()
    const assignee = screen.getByRole('combobox', { name: 'Assignee' })
    expect(assignee).toHaveTextContent('Me — Researcher')
    expect(assignee).toHaveTextContent('Teammate · member')

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Target (messages)' }), { target: { value: '12' } })
    expect(screen.getByText('Unlocks at team level 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Target locked' })).toBeDisabled()
  })
})
