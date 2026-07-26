import { render, screen } from '@testing-library/react'
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

import { TeamWorkspacePage } from './TeamPages'

describe('team permission controls', () => {
  it('does not infer privileged controls from membership or role labels', async () => {
    render(<MemoryRouter initialEntries={['/teams/symbolic-systems/workspace']}><TeamWorkspacePage /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: team.name })).toBeInTheDocument()
    expect(screen.queryByText('Registry settings')).not.toBeInTheDocument()
    expect(screen.queryByText('Invite researchers')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /transfer ownership/i })).not.toBeInTheDocument()
  })
})
