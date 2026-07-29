import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTeam,
  createTeamInvite,
  invalidateTeamCache,
  respondToTeamInvite,
  transferTeamOwnership,
} from '../services/teamService'

const permissions = {
  editTeam: true,
  inviteMembers: true,
  manageMembers: true,
  changeRoles: true,
  transferOwnership: true,
  archiveTeam: true,
  leaveTeam: false,
  manageMissions: true,
  contribute: true,
  publishCapsules: true,
}

const owner = {
  researcherId: 'SIT-0067',
  displayName: 'Founding Researcher',
  role: 'owner',
  xp: 6700,
  contributions: 67,
  joinedAt: '2026-07-26T12:00:00.000Z',
}

const team = {
  id: 'team_67',
  name: 'Symbolic Systems Lab',
  slug: 'symbolic-systems',
  description: 'Collaborative research.',
  visibility: 'public',
  archivedAt: null,
  memberCount: 1,
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
  currentMember: owner,
  permissions,
}

const invite = {
  id: 'invite_67',
  token: 'join-token',
  team: { id: team.id, name: team.name, slug: team.slug, visibility: team.visibility },
  role: 'member',
  expiresAt: '2026-07-29T12:00:00.000Z',
  status: 'pending',
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.sit.test')
  invalidateTeamCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('create → invite → join → transfer ownership', () => {
  it('keeps each authoritative transition on SIT Core', async () => {
    const joinedTeam = {
      ...team,
      memberCount: 2,
      currentMember: { ...owner, researcherId: 'SIT-0068', displayName: 'Invited Researcher', role: 'member' },
      permissions: { ...permissions, editTeam: false, inviteMembers: false, manageMembers: false, changeRoles: false, transferOwnership: false, archiveTeam: false, leaveTeam: true, manageMissions: false },
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(team), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(invite), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(joinedTeam)))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const created = await createTeam({
      name: team.name,
      slug: team.slug,
      description: team.description,
      visibility: 'public',
    })
    const createdInvite = await createTeamInvite(created.id, 'member', 72)
    const joined = await respondToTeamInvite(createdInvite.token, 'accept')
    await transferTeamOwnership(created.id, 'SIT-0068')

    expect(joined?.currentMember?.role).toBe('member')
    expect(fetchMock.mock.calls.map(([url, init]) => [String(url).replace('https://core.sit.test', ''), (init as RequestInit).method])).toEqual([
      ['/api/teams', 'POST'],
      ['/api/teams/team_67/invites', 'POST'],
      ['/api/team-invites/join-token/accept', 'POST'],
      ['/api/teams/team_67/ownership', 'POST'],
    ])
  })

  it('surfaces backend authorization conflicts without inferring a fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'permission_denied',
    }), { status: 403 })))

    await expect(transferTeamOwnership(team.id, 'SIT-0068')).rejects.toThrow(
      'You do not have permission to perform this team action.',
    )
  })
})
