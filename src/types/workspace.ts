export type WorkspaceMissionStatus = 'active' | 'completed' | 'archived'
export type WorkspaceMissionDifficulty = 'routine' | 'standard' | 'advanced' | 'critical'
export type WorkspaceMissionMetric = 'messages_encoded' | 'messages_decoded' | 'syte_processed'
export type WorkspaceCapsuleStatus = 'draft' | 'published'

export interface WorkspaceIdentity {
  researcherId: string
  displayName: string
}

export interface WorkspaceMissionContributor extends WorkspaceIdentity {
  progress: number
  completedAt: string | null
  updatedAt: string
}

export interface WorkspaceMission {
  id: string
  teamId: string
  title: string
  description: string
  target: number
  metric: WorkspaceMissionMetric
  difficulty: WorkspaceMissionDifficulty
  teamXpReward: number
  status: WorkspaceMissionStatus
  dueAt: string | null
  revision: number
  assignee: WorkspaceIdentity | null
  createdBy: WorkspaceIdentity
  individualProgress: number
  aggregateProgress: number
  completedAt: string | null
  contributors: WorkspaceMissionContributor[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceCapsuleRevision {
  revision: number
  createdAt: string
  createdBy: WorkspaceIdentity
}

export interface WorkspaceCapsuleContributor extends WorkspaceIdentity {
  joinedAt: string
}

export interface WorkspaceCapsule {
  id: string
  teamId: string
  title: string
  description: string
  status: WorkspaceCapsuleStatus
  revision: number
  payload: string
  publishedAt: string | null
  createdBy: WorkspaceIdentity
  contributors: WorkspaceCapsuleContributor[]
  revisions: WorkspaceCapsuleRevision[]
  createdAt: string
  updatedAt: string
}

export interface WorkspacePage<T> {
  items: T[]
  nextCursor: string | null
}
