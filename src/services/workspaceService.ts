import type {
  WorkspaceCapsule,
  WorkspaceCapsuleStatus,
  WorkspaceIdentity,
  WorkspaceMission,
  WorkspaceMissionStatus,
  WorkspacePage,
} from '../types/workspace'
import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'

export class WorkspaceConflictError extends Error {
  readonly resource: 'mission' | 'capsule'

  constructor(resource: 'mission' | 'capsule') {
    super(`${resource === 'mission' ? 'Mission' : 'Capsule'} changed on SIT Core. Reload the latest revision before saving again.`)
    this.name = 'WorkspaceConflictError'
    this.resource = resource
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function dateOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)))
}

function identity(value: unknown): WorkspaceIdentity {
  if (!isObject(value) || !text(value.researcherId) || !text(value.displayName)) {
    throw new Error('Invalid workspace identity payload.')
  }
  return { researcherId: value.researcherId, displayName: value.displayName }
}

export function parseWorkspaceMission(value: unknown): WorkspaceMission {
  if (!isObject(value)) throw new Error('Invalid workspace mission payload.')
  const statuses: WorkspaceMissionStatus[] = ['active', 'completed', 'archived']
  if (
    !text(value.id) || !text(value.teamId) || !text(value.title) || typeof value.description !== 'string'
    || !integer(value.target) || value.target < 1 || !integer(value.xpReward)
    || typeof value.status !== 'string' || !statuses.includes(value.status as WorkspaceMissionStatus)
    || !dateOrNull(value.dueAt) || !integer(value.revision)
    || !integer(value.individualProgress) || !integer(value.aggregateProgress)
    || !dateOrNull(value.completedAt) || !Array.isArray(value.contributors)
    || !text(value.createdAt) || !text(value.updatedAt)
  ) throw new Error('Invalid workspace mission payload.')
  return {
    id: value.id,
    teamId: value.teamId,
    title: value.title,
    description: value.description,
    target: value.target,
    xpReward: value.xpReward,
    status: value.status as WorkspaceMissionStatus,
    dueAt: value.dueAt,
    revision: value.revision,
    assignee: value.assignee === null ? null : identity(value.assignee),
    createdBy: identity(value.createdBy),
    individualProgress: value.individualProgress,
    aggregateProgress: value.aggregateProgress,
    completedAt: value.completedAt,
    contributors: value.contributors.map((entry) => {
      if (!isObject(entry) || !integer(entry.progress) || !dateOrNull(entry.completedAt) || !text(entry.updatedAt)) {
        throw new Error('Invalid mission contributor payload.')
      }
      return { ...identity(entry), progress: entry.progress, completedAt: entry.completedAt, updatedAt: entry.updatedAt }
    }),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

export function parseWorkspaceCapsule(value: unknown): WorkspaceCapsule {
  if (!isObject(value)) throw new Error('Invalid workspace capsule payload.')
  const statuses: WorkspaceCapsuleStatus[] = ['draft', 'published']
  if (
    !text(value.id) || !text(value.teamId) || !text(value.title) || typeof value.description !== 'string'
    || typeof value.status !== 'string' || !statuses.includes(value.status as WorkspaceCapsuleStatus)
    || !integer(value.revision) || typeof value.payload !== 'string' || !dateOrNull(value.publishedAt)
    || !Array.isArray(value.contributors) || !Array.isArray(value.revisions)
    || !text(value.createdAt) || !text(value.updatedAt)
  ) throw new Error('Invalid workspace capsule payload.')
  return {
    id: value.id,
    teamId: value.teamId,
    title: value.title,
    description: value.description,
    status: value.status as WorkspaceCapsuleStatus,
    revision: value.revision,
    payload: value.payload,
    publishedAt: value.publishedAt,
    createdBy: identity(value.createdBy),
    contributors: value.contributors.map((entry) => {
      if (!isObject(entry) || !text(entry.joinedAt)) throw new Error('Invalid capsule contributor payload.')
      return { ...identity(entry), joinedAt: entry.joinedAt }
    }),
    revisions: value.revisions.map((entry) => {
      if (!isObject(entry) || !integer(entry.revision) || !text(entry.createdAt)) {
        throw new Error('Invalid capsule revision payload.')
      }
      return { revision: entry.revision, createdAt: entry.createdAt, createdBy: identity(entry.createdBy) }
    }),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function parsePage<T>(value: unknown, parser: (item: unknown) => T): WorkspacePage<T> {
  if (!isObject(value) || !Array.isArray(value.items) || (value.nextCursor !== null && typeof value.nextCursor !== 'string')) {
    throw new Error('Invalid workspace page payload.')
  }
  return { items: value.items.map(parser), nextCursor: value.nextCursor }
}

async function request<T>(
  path: string,
  fallback: string,
  parser: (payload: unknown) => T,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: { ...getApiHeaders(), ...init?.headers },
    credentials: 'include',
    cache: 'no-store',
  })
  const payload = await parseResponsePayload(response)
  if (response.status === 409 && isObject(payload) && payload.error === 'revision_conflict') {
    throw new WorkspaceConflictError(path.includes('/missions/') ? 'mission' : 'capsule')
  }
  if (!response.ok) throwApiError(response.status, payload, fallback)
  return parser(payload)
}

const queryString = (values: Record<string, string | undefined>) => {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value) })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const listWorkspaceMissions = (teamId: string, status?: WorkspaceMissionStatus, cursor?: string) =>
  request(
    `/api/teams/${encodeURIComponent(teamId)}/missions${queryString({ status, cursor })}`,
    'Unable to load workspace missions.',
    (payload) => parsePage(payload, parseWorkspaceMission),
  )

export const createWorkspaceMission = (teamId: string, input: {
  title: string
  description: string
  target: number
  xpReward: number
  dueAt?: string | null
  assigneeResearcherId?: string | null
}) => request(
  `/api/teams/${encodeURIComponent(teamId)}/missions`,
  'Unable to create the workspace mission.',
  parseWorkspaceMission,
  { method: 'POST', body: JSON.stringify(input) },
)

export const updateWorkspaceMission = (teamId: string, missionId: string, expectedRevision: number, input: Partial<{
  title: string
  description: string
  target: number
  xpReward: number
  dueAt: string | null
  assigneeResearcherId: string | null
  status: WorkspaceMissionStatus
}>) => request(
  `/api/teams/${encodeURIComponent(teamId)}/missions/${encodeURIComponent(missionId)}`,
  'Unable to update the workspace mission.',
  parseWorkspaceMission,
  { method: 'PATCH', body: JSON.stringify({ ...input, expectedRevision }) },
)

export const recordWorkspaceMissionProgress = (
  teamId: string,
  missionId: string,
  progress: number,
  idempotencyKey: string,
) => request(
  `/api/teams/${encodeURIComponent(teamId)}/missions/${encodeURIComponent(missionId)}/progress`,
  'Unable to record mission progress.',
  parseWorkspaceMission,
  { method: 'POST', headers: { 'idempotency-key': idempotencyKey }, body: JSON.stringify({ progress }) },
)

export const listWorkspaceCapsules = (teamId: string, status?: WorkspaceCapsuleStatus, cursor?: string) =>
  request(
    `/api/teams/${encodeURIComponent(teamId)}/capsules${queryString({ status, cursor })}`,
    'Unable to load workspace capsules.',
    (payload) => parsePage(payload, parseWorkspaceCapsule),
  )

export const createWorkspaceCapsule = (teamId: string, input: {
  title: string
  description: string
  payload: string
}) => request(
  `/api/teams/${encodeURIComponent(teamId)}/capsules`,
  'Unable to create the workspace capsule.',
  parseWorkspaceCapsule,
  { method: 'POST', body: JSON.stringify(input) },
)

export const updateWorkspaceCapsule = (
  teamId: string,
  capsuleId: string,
  expectedRevision: number,
  input: { title: string; description: string; payload: string },
) => request(
  `/api/teams/${encodeURIComponent(teamId)}/capsules/${encodeURIComponent(capsuleId)}`,
  'Unable to save this capsule revision.',
  parseWorkspaceCapsule,
  { method: 'PATCH', body: JSON.stringify({ ...input, expectedRevision }) },
)

export const publishWorkspaceCapsule = (teamId: string, capsuleId: string, expectedRevision: number) =>
  request(
    `/api/teams/${encodeURIComponent(teamId)}/capsules/${encodeURIComponent(capsuleId)}/publish`,
    'Unable to publish this capsule.',
    parseWorkspaceCapsule,
    { method: 'POST', body: JSON.stringify({ expectedRevision }) },
  )

export const addWorkspaceCapsuleContributor = (teamId: string, capsuleId: string, researcherId: string) =>
  request(
    `/api/teams/${encodeURIComponent(teamId)}/capsules/${encodeURIComponent(capsuleId)}/contributors`,
    'Unable to add this contributor.',
    parseWorkspaceCapsule,
    { method: 'POST', body: JSON.stringify({ researcherId }) },
  )
