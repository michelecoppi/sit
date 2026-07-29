export type TeamVisibility = 'public' | 'private'
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface TeamPermissions {
  editTeam: boolean
  inviteMembers: boolean
  manageMembers: boolean
  changeRoles: boolean
  transferOwnership: boolean
  archiveTeam: boolean
  leaveTeam: boolean
  manageMissions: boolean
  contribute: boolean
  publishCapsules: boolean
}

export interface TeamSummary {
  id: string
  name: string
  slug: string
  description: string
  visibility: TeamVisibility
  archivedAt: string | null
  memberCount: number
  totalXp: number
  totalContributions: number
}

export interface TeamMember {
  researcherId: string
  displayName: string
  role: TeamRole
  xp: number
  contributions: number
  joinedAt: string
}

export interface TeamDetail extends TeamSummary {
  createdAt: string
  updatedAt: string
  currentMember: TeamMember | null
  permissions: TeamPermissions
}

export interface TeamPage<T> {
  items: T[]
  nextCursor: string | null
}

export interface TeamInvite {
  id: string
  token: string
  team: Pick<TeamSummary, 'id' | 'name' | 'slug' | 'visibility'>
  role: Exclude<TeamRole, 'owner'>
  expiresAt: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  inviteUrl?: string
}

export interface CreateTeamInput {
  name: string
  slug: string
  description: string
  visibility: TeamVisibility
}
