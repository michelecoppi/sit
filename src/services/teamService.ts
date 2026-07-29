import type {
  CreateTeamInput,
  TeamDetail,
  TeamInvite,
  TeamMember,
  TeamPage,
  TeamPermissions,
  TeamProgression,
  TeamRole,
  TeamSummary,
} from '../types/teams'
import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'

const VISIBILITIES = new Set(['public', 'private'])
const ROLES = new Set(['owner', 'admin', 'member', 'viewer'])
const INVITE_STATES = new Set(['pending', 'accepted', 'declined', 'expired'])

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function dateOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)))
}

function parseProgression(value: unknown): TeamProgression {
  if (!isObject(value) || !isObject(value.missionPolicy) || !Array.isArray(value.unlockedFeatures)
    || !Array.isArray(value.missionPolicy.activityTypes)) {
    throw new Error('Invalid team progression payload.')
  }
  const nextUnlock = value.nextUnlock
  const unlock = (entry: unknown) => {
    if (!isObject(entry) || !count(entry.level) || !text(entry.code) || !text(entry.label)) {
      throw new Error('Invalid team unlock payload.')
    }
    return { level: entry.level, code: entry.code, label: entry.label }
  }
  const difficulties = new Set(['routine', 'standard', 'advanced', 'critical'])
  const metrics = new Set(['messages_encoded', 'messages_decoded', 'syte_processed'])
  const activityTypes = value.missionPolicy.activityTypes.map((entry) => {
    if (!isObject(entry) || typeof entry.metric !== 'string' || !metrics.has(entry.metric)
      || !text(entry.label) || !text(entry.unit) || !text(entry.description) || !Array.isArray(entry.bands)) {
      throw new Error('Invalid team activity payload.')
    }
    return {
      metric: entry.metric as TeamProgression['missionPolicy']['activityTypes'][number]['metric'],
      label: entry.label,
      unit: entry.unit,
      description: entry.description,
      bands: entry.bands.map((band) => {
        if (!isObject(band) || (band.maxTarget !== null && !count(band.maxTarget))
          || typeof band.difficulty !== 'string' || !difficulties.has(band.difficulty)
          || !count(band.baseTeamXp) || !count(band.requiredLevel) || typeof band.unlocked !== 'boolean'
          || !count(band.assignedReward) || !count(band.collaborationReward)) {
          throw new Error('Invalid team activity band payload.')
        }
        return {
          maxTarget: band.maxTarget,
          difficulty: band.difficulty as TeamProgression['missionPolicy']['activityTypes'][number]['bands'][number]['difficulty'],
          baseTeamXp: band.baseTeamXp,
          requiredLevel: band.requiredLevel,
          unlocked: band.unlocked,
          assignedReward: band.assignedReward,
          collaborationReward: band.collaborationReward,
        }
      }),
    }
  })
  if (!count(value.teamXp) || !count(value.level) || !count(value.currentLevelXp)
    || (value.nextLevelXp !== null && !count(value.nextLevelXp)) || !count(value.levelProgress)
    || !count(value.missionPolicy.dailyLimit) || typeof value.missionPolicy.canCreateToday !== 'boolean'
    || !dateOrNull(value.missionPolicy.nextCreationAt)
    || (nextUnlock !== null && !isObject(nextUnlock))) {
    throw new Error('Invalid team progression payload.')
  }
  return {
    teamXp: value.teamXp,
    level: value.level,
    currentLevelXp: value.currentLevelXp,
    nextLevelXp: value.nextLevelXp,
    levelProgress: value.levelProgress,
    unlockedFeatures: value.unlockedFeatures.map(unlock),
    nextUnlock: nextUnlock === null ? null : unlock(nextUnlock),
    missionPolicy: {
      dailyLimit: value.missionPolicy.dailyLimit,
      canCreateToday: value.missionPolicy.canCreateToday,
      nextCreationAt: value.missionPolicy.nextCreationAt,
      activityTypes,
    },
  }
}

function parsePermissions(value: unknown): TeamPermissions {
  if (!isObject(value)) throw new Error('Invalid team permissions payload.')
  const keys: Array<keyof TeamPermissions> = [
    'editTeam',
    'inviteMembers',
    'manageMembers',
    'changeRoles',
    'transferOwnership',
    'archiveTeam',
    'leaveTeam',
    'manageMissions',
    'contribute',
    'publishCapsules',
  ]
  if (keys.some((key) => typeof value[key] !== 'boolean')) {
    throw new Error('Invalid team permissions payload.')
  }
  return Object.fromEntries(keys.map((key) => [key, value[key]])) as unknown as TeamPermissions
}

export function parseTeamSummary(value: unknown): TeamSummary {
  if (!isObject(value)) throw new Error('Invalid team payload.')
  const { id, name, slug, description, visibility, archivedAt, memberCount, totalXp, totalContributions } = value
  if (
    !text(id) || !text(name) || !text(slug) || typeof description !== 'string'
    || typeof visibility !== 'string' || !VISIBILITIES.has(visibility)
    || !dateOrNull(archivedAt) || !count(memberCount) || !count(totalXp) || !count(totalContributions)
  ) {
    throw new Error('Invalid team payload.')
  }
  return {
    id,
    name,
    slug,
    description,
    visibility: visibility as TeamSummary['visibility'],
    archivedAt,
    memberCount,
    totalXp,
    totalContributions,
    progression: parseProgression(value.progression),
  }
}

export function parseTeamMember(value: unknown): TeamMember {
  if (!isObject(value)) throw new Error('Invalid team member payload.')
  const { researcherId, displayName, role, xp, contributions, joinedAt } = value
  if (
    !text(researcherId) || !text(displayName) || typeof role !== 'string' || !ROLES.has(role)
    || !count(xp) || !count(contributions) || !text(joinedAt) || Number.isNaN(Date.parse(joinedAt))
  ) {
    throw new Error('Invalid team member payload.')
  }
  return { researcherId, displayName, role: role as TeamRole, xp, contributions, joinedAt }
}

export function parseTeamDetail(value: unknown): TeamDetail {
  if (!isObject(value)) throw new Error('Invalid team payload.')
  const summary = parseTeamSummary(value)
  const { createdAt, updatedAt, currentMember, permissions } = value
  if (!text(createdAt) || Number.isNaN(Date.parse(createdAt)) || !text(updatedAt) || Number.isNaN(Date.parse(updatedAt))) {
    throw new Error('Invalid team payload.')
  }
  return {
    ...summary,
    createdAt,
    updatedAt,
    currentMember: currentMember === null ? null : parseTeamMember(currentMember),
    permissions: parsePermissions(permissions),
  }
}

export function parseTeamPage<T>(value: unknown, parser: (item: unknown) => T): TeamPage<T> {
  if (!isObject(value) || !Array.isArray(value.items) || (value.nextCursor !== null && typeof value.nextCursor !== 'string')) {
    throw new Error('Invalid team page payload.')
  }
  return { items: value.items.map(parser), nextCursor: value.nextCursor }
}

export function parseTeamInvite(value: unknown): TeamInvite {
  if (!isObject(value) || !isObject(value.team)) throw new Error('Invalid team invite payload.')
  const { id, token, role, expiresAt, status, inviteUrl } = value
  const team = value.team
  if (
    !text(id) || !text(token) || (role !== 'admin' && role !== 'member' && role !== 'viewer')
    || !text(expiresAt) || Number.isNaN(Date.parse(expiresAt))
    || typeof status !== 'string' || !INVITE_STATES.has(status)
    || (inviteUrl !== undefined && typeof inviteUrl !== 'string')
    || !text(team.id) || !text(team.name) || !text(team.slug)
    || typeof team.visibility !== 'string' || !VISIBILITIES.has(team.visibility)
  ) {
    throw new Error('Invalid team invite payload.')
  }
  return {
    id,
    token,
    role,
    expiresAt,
    status: status as TeamInvite['status'],
    inviteUrl,
    team: {
      id: team.id,
      name: team.name,
      slug: team.slug,
      visibility: team.visibility as TeamSummary['visibility'],
    },
  }
}

const cache = new Map<string, unknown>()

export function invalidateTeamCache(teamId?: string) {
  for (const key of cache.keys()) {
    if (!teamId || key.includes(teamId) || key.startsWith('teams:') || key.startsWith('leaderboard:')) cache.delete(key)
  }
}

async function request(path: string, fallback: string, init?: RequestInit) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: getApiHeaders(),
    credentials: 'include',
    cache: 'no-store',
  })
  const payload = await parseResponsePayload(response)
  if (!response.ok) throwApiError(response.status, payload, fallback)
  return payload
}

async function mutate<T>(path: string, fallback: string, method: string, body?: unknown, parser?: (value: unknown) => T) {
  const payload = await request(path, fallback, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  invalidateTeamCache()
  return parser ? parser(payload) : undefined
}

export async function discoverTeams(cursor?: string) {
  const key = `teams:${cursor ?? ''}`
  if (cache.has(key)) return cache.get(key) as TeamPage<TeamSummary>
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const page = parseTeamPage(await request(`/api/teams${query}`, 'Unable to load research teams.'), parseTeamSummary)
  cache.set(key, page)
  return page
}

export async function getTeam(slug: string) {
  const key = `team:${slug}`
  if (cache.has(key)) return cache.get(key) as TeamDetail
  const team = parseTeamDetail(await request(`/api/teams/${encodeURIComponent(slug)}`, 'Unable to load this research team.'))
  cache.set(key, team)
  return team
}

export async function getTeamMembers(teamId: string, cursor?: string) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return parseTeamPage(
    await request(`/api/teams/${encodeURIComponent(teamId)}/members${query}`, 'Unable to load team members.'),
    parseTeamMember,
  )
}

export async function getTeamLeaderboard(cursor?: string) {
  const key = `leaderboard:${cursor ?? ''}`
  if (cache.has(key)) return cache.get(key) as TeamPage<TeamSummary>
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const page = parseTeamPage(
    await request(`/api/teams/leaderboard${query}`, 'Unable to load the team leaderboard.'),
    parseTeamSummary,
  )
  cache.set(key, page)
  return page
}

export async function createTeam(input: CreateTeamInput): Promise<TeamDetail> {
  return await mutate('/api/teams', 'Unable to create the research team.', 'POST', input, parseTeamDetail) as TeamDetail
}

export async function updateTeam(teamId: string, input: Partial<CreateTeamInput>): Promise<TeamDetail> {
  return await mutate(`/api/teams/${encodeURIComponent(teamId)}`, 'Unable to update the research team.', 'PATCH', input, parseTeamDetail) as TeamDetail
}

export const archiveTeam = (teamId: string) =>
  mutate(`/api/teams/${encodeURIComponent(teamId)}/archive`, 'Unable to archive the research team.', 'POST')

export async function createTeamInvite(teamId: string, role: Exclude<TeamRole, 'owner'>, expiresInHours: number): Promise<TeamInvite> {
  return await mutate(`/api/teams/${encodeURIComponent(teamId)}/invites`, 'Unable to create an invitation.', 'POST', { role, expiresInHours }, parseTeamInvite) as TeamInvite
}

export const getTeamInvite = async (token: string) =>
  parseTeamInvite(await request(`/api/team-invites/${encodeURIComponent(token)}`, 'Unable to load this invitation.'))

export async function respondToTeamInvite(token: string, action: 'accept' | 'decline'): Promise<TeamDetail | null> {
  const result = await mutate(
    `/api/team-invites/${encodeURIComponent(token)}/${action}`,
    `Unable to ${action} this invitation.`,
    'POST',
    undefined,
    action === 'accept' ? parseTeamDetail : undefined,
  )
  return result as TeamDetail | null
}

export const leaveTeam = (teamId: string) =>
  mutate(`/api/teams/${encodeURIComponent(teamId)}/members/me`, 'Unable to leave the research team.', 'DELETE')

export const removeTeamMember = (teamId: string, researcherId: string) =>
  mutate(`/api/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(researcherId)}`, 'Unable to remove this member.', 'DELETE')

export const changeTeamMemberRole = (teamId: string, researcherId: string, role: Exclude<TeamRole, 'owner'>) =>
  mutate(`/api/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(researcherId)}`, 'Unable to change this role.', 'PATCH', { role })

export const transferTeamOwnership = (teamId: string, researcherId: string) =>
  mutate(`/api/teams/${encodeURIComponent(teamId)}/ownership`, 'Unable to transfer team ownership.', 'POST', { researcherId })
