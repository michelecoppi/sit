import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  changeTeamMemberRole,
  createTeamInvite,
  discoverTeams,
  invalidateTeamCache,
  parseTeamDetail,
  parseTeamInvite,
  parseTeamMember,
  parseTeamPage,
  parseTeamSummary,
  respondToTeamInvite,
} from './teamService'

const summary = {
  id: 'team_67',
  name: 'Symbolic Systems Lab',
  slug: 'symbolic-systems',
  description: 'Collaborative native encoding research.',
  visibility: 'public',
  archivedAt: null,
  memberCount: 2,
  totalXp: 6700,
  totalContributions: 67,
}

const member = {
  researcherId: 'SIT-0067',
  displayName: 'Protocol Researcher',
  role: 'owner',
  xp: 6000,
  contributions: 60,
  joinedAt: '2026-07-26T12:00:00.000Z',
}

const permissions = {
  editTeam: true,
  inviteMembers: true,
  manageMembers: true,
  changeRoles: true,
  transferOwnership: true,
  archiveTeam: true,
  leaveTeam: false,
}

const detail = {
  ...summary,
  createdAt: '2026-07-26T12:00:00.000Z',
  updatedAt: '2026-07-26T12:00:00.000Z',
  currentMember: member,
  permissions,
}

const invite = {
  id: 'invite_67',
  token: 'secure-token',
  team: { id: summary.id, name: summary.name, slug: summary.slug, visibility: summary.visibility },
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

describe('team contract validation', () => {
  it('validates team, member, invite and paginated leaderboard contracts', () => {
    expect(parseTeamSummary(summary)).toEqual(summary)
    expect(parseTeamMember(member)).toEqual(member)
    expect(parseTeamDetail(detail)).toEqual(detail)
    expect(parseTeamInvite(invite)).toEqual(invite)
    expect(parseTeamPage({ items: [summary], nextCursor: 'team_68' }, parseTeamSummary)).toEqual({
      items: [summary],
      nextCursor: 'team_68',
    })
  })

  it.each([
    ['negative totals', { ...summary, totalXp: -1 }],
    ['unknown visibility', { ...summary, visibility: 'secret' }],
    ['missing backend permissions', { ...detail, permissions: { editTeam: true } }],
    ['unknown role', { ...member, role: 'superuser' }],
    ['invalid expiry', { ...invite, expiresAt: 'later' }],
  ])('rejects %s', (_label, payload) => {
    expect(() => {
      if ('permissions' in payload) parseTeamDetail(payload)
      else if ('researcherId' in payload) parseTeamMember(payload)
      else if ('token' in payload) parseTeamInvite(payload)
      else parseTeamSummary(payload)
    }).toThrow()
  })
})

describe('team service operations', () => {
  it('caches discovery deterministically until a mutation invalidates it', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [summary], nextCursor: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify(invite), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [summary], nextCursor: null })))
    vi.stubGlobal('fetch', fetchMock)

    await discoverTeams()
    await discoverTeams()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await createTeamInvite(summary.id, 'member', 72)
    await discoverTeams()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('uses authenticated membership and invitation endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(detail)))
    vi.stubGlobal('fetch', fetchMock)

    await changeTeamMemberRole(summary.id, 'SIT-0068', 'admin')
    await respondToTeamInvite(invite.token, 'accept')

    expect(fetchMock).toHaveBeenNthCalledWith(1, expect.stringContaining('/members/SIT-0068'), expect.objectContaining({
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({ role: 'admin' }),
    }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringContaining('/accept'), expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }))
  })
})
