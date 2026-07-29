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
  assignees: [identity],
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
      maxAssignees: 5,
      canCreateToday: true,
      nextCreationAt: null,
      activityTypes: [
        { metric: 'messages_encoded', label: 'Encode messages', unit: 'messages', description: 'Encode messages.', minimumTarget: 3, bands: [{ maxTarget: 3, difficulty: 'routine', baseTeamXp: 40, requiredLevel: 1, unlocked: true, assignedReward: 40, collaborationReward: 40, rewards: [{ assigneeCount: 1, teamXp: 40 }, { assigneeCount: 2, teamXp: 50 }] }, { maxTarget: null, difficulty: 'critical', baseTeamXp: 90, requiredLevel: 4, unlocked: false, assignedReward: 90, collaborationReward: 90, rewards: [{ assigneeCount: 1, teamXp: 90 }, { assigneeCount: 2, teamXp: 110 }] }] },
        { metric: 'syte_processed', label: 'Process SYTE', unit: 'SYTE', description: 'Process SYTE.', minimumTarget: 64, bands: [{ maxTarget: 64, difficulty: 'routine', baseTeamXp: 35, requiredLevel: 1, unlocked: true, assignedReward: 35, collaborationReward: 40, rewards: [{ assigneeCount: 1, teamXp: 35 }, { assigneeCount: 2, teamXp: 40 }] }] },
      ],
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

  it('derives difficulty and reward while selecting multiple real team members', async () => {
    const teammate = { ...team.currentMember!, researcherId: 'SIT-0068', displayName: 'Teammate', role: 'member' as const }
    render(<TeamWorkspaceBoards members={[team.currentMember!, teammate]} team={{
      ...team,
      permissions: { ...permissions, manageMissions: true },
    }} />)

    const activitySelect = await screen.findByRole('combobox', { name: 'Activity' })
    expect(activitySelect).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Difficulty' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Due date')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Mission assignees' })).toBeInTheDocument()
    const currentButton = screen.getByRole('button', { name: /Researcher.*SIT-0067/ })
    const teammateButton = screen.getByRole('button', { name: /Teammate.*SIT-0068.*member/ })
    fireEvent.click(currentButton)
    fireEvent.click(teammateButton)
    expect(currentButton).toHaveAttribute('aria-pressed', 'true')
    expect(teammateButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/2\/5 · limit grows with team level/)).toBeInTheDocument()
    expect(screen.getByText(/routine · 50 Team XP · 2 participants/)).toBeInTheDocument()

    fireEvent.change(activitySelect, { target: { value: 'syte_processed' } })
    const syteTarget = screen.getByRole('spinbutton', { name: /Target \(SYTE\)/ })
    expect(syteTarget).toHaveValue(64)
    expect(syteTarget).toHaveAttribute('min', '64')
    expect(screen.getByText('Minimum accepted: 64 SYTE.')).toBeInTheDocument()

    fireEvent.change(activitySelect, { target: { value: 'messages_encoded' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: /Target \(messages\)/ }), { target: { value: '12' } })
    expect(screen.getByText('Unlocks at team level 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Target locked' })).toBeDisabled()
  })
})
