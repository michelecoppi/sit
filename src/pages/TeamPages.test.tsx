import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { TeamDetail, TeamMember } from '../types/teams'

const team: TeamDetail = {
  id: 'team_67',
  name: 'Symbolic Systems Lab',
  slug: 'symbolic-systems',
  description: 'Collaborative research.',
  visibility: 'public',
  archivedAt: null,
  memberCount: 2,
  totalXp: 6700,
  totalContributions: 67,
  progression: {
    teamXp: 6700,
    level: 7,
    currentLevelXp: 5200,
    nextLevelXp: 7100,
    levelProgress: 79,
    unlockedFeatures: [{ level: 1, code: 'workspace', label: 'Team workspace' }],
    nextUnlock: null,
    missionPolicy: {
      dailyLimit: 1,
      canCreateToday: true,
      nextCreationAt: null,
      activityTypes: [{ metric: 'messages_encoded', label: 'Encode messages', unit: 'messages', description: 'Encode messages.', bands: [{ maxTarget: 3, difficulty: 'routine', baseTeamXp: 40, requiredLevel: 1, unlocked: true, assignedReward: 40, collaborationReward: 40 }] }],
    },
  },
  createdAt: '2026-07-26T12:00:00.000Z',
  updatedAt: '2026-07-26T12:00:00.000Z',
  currentMember: {
    researcherId: 'SIT-0067',
    displayName: 'Owner',
    role: 'owner',
    xp: 6000,
    contributions: 60,
    joinedAt: '2026-07-26T12:00:00.000Z',
  },
  permissions: {
    editTeam: false,
    inviteMembers: false,
    manageMembers: false,
    changeRoles: false,
    transferOwnership: false,
    archiveTeam: false,
    leaveTeam: false,
    manageMissions: false,
    contribute: false,
    publishCapsules: false,
  },
}

const member: TeamMember = {
  researcherId: 'SIT-0068',
  displayName: 'Member',
  role: 'member',
  xp: 700,
  contributions: 7,
  joinedAt: '2026-07-26T12:00:00.000Z',
}

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated' }),
}))

vi.mock('../services/teamService', () => ({
  getTeam: vi.fn(async () => team),
  getTeamMembers: vi.fn(async () => ({ items: [team.currentMember, member], nextCursor: null })),
  getTeamInvite: vi.fn(),
  discoverTeams: vi.fn(),
  getTeamLeaderboard: vi.fn(),
  createTeam: vi.fn(),
  createTeamInvite: vi.fn(),
  updateTeam: vi.fn(),
  archiveTeam: vi.fn(),
  leaveTeam: vi.fn(),
  removeTeamMember: vi.fn(),
  changeTeamMemberRole: vi.fn(),
  transferTeamOwnership: vi.fn(),
  respondToTeamInvite: vi.fn(),
}))

vi.mock('../services/workspaceService', () => ({
  listWorkspaceMissions: vi.fn(async () => ({ items: [], nextCursor: null })),
  listWorkspaceCapsules: vi.fn(async () => ({ items: [], nextCursor: null })),
  createWorkspaceMission: vi.fn(),
  recordWorkspaceMissionProgress: vi.fn(),
  createWorkspaceCapsule: vi.fn(),
  updateWorkspaceCapsule: vi.fn(),
  publishWorkspaceCapsule: vi.fn(),
  addWorkspaceCapsuleContributor: vi.fn(),
  WorkspaceConflictError: class WorkspaceConflictError extends Error {},
}))

import { discoverTeams, getTeamLeaderboard } from '../services/teamService'
import { TeamsPage, TeamWorkspacePage } from './TeamPages'

describe('team directory layout controls', () => {
  it('opens registration in an accessible dialog and closes it with Escape', async () => {
    vi.mocked(discoverTeams).mockResolvedValue({ items: [], nextCursor: null })
    vi.mocked(getTeamLeaderboard).mockResolvedValue({ items: [], nextCursor: null })

    render(<MemoryRouter initialEntries={['/teams']}><TeamsPage /></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Register a team' }))

    expect(screen.getByRole('dialog', { name: 'Register a research team' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Team name' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'Register a research team' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('team permission controls', () => {
  it('does not infer privileged controls from membership or role labels', async () => {
    render(<MemoryRouter initialEntries={['/teams/symbolic-systems/workspace']}><TeamWorkspacePage /></MemoryRouter>)
    const heading = await screen.findByRole('heading', { name: team.name })
    expect(heading.closest('.team-workspace-hero')).toBeInTheDocument()
    expect(heading.closest('.team-workspace-page')?.querySelector('.team-workspace-grid-single')).toBeInTheDocument()
    expect(screen.queryByText('Registry settings')).not.toBeInTheDocument()
    expect(screen.queryByText('Invite researchers')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /transfer ownership/i })).not.toBeInTheDocument()
  })
})
