import {
  getApiHeaders,
  getApiUrl,
  parseResponsePayload,
  throwApiError,
} from './apiClient'

export type ActivityEvent = {
  eventId: string
  type: string
  occurredAt: string
  actor: { researcherId: string; displayName: string }
  target?: { kind: string; id: string; href?: string }
  scope: { kind: 'private' | 'team'; teamId?: string }
  payload: Record<string, unknown>
  payloadVersion: 1
  correlationId?: string
  deduplicationKey: string
}

export type Notification = {
  id: string
  event: ActivityEvent
  readAt: string | null
  deepLink?: string
}

export type CursorPage<T> = {
  items: T[]
  nextCursor: string | null
  asOf: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    credentials: 'include',
    headers: getApiHeaders(),
    ...init,
  })
  const payload = await parseResponsePayload(response)
  if (!response.ok) {
    throwApiError(response.status, payload, 'Researcher data is currently unavailable.', false)
  }
  return payload as T
}

export function getNotifications(cursor?: string) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return request<CursorPage<Notification>>(`/api/notifications${query}`)
}

export function markNotificationRead(id: string) {
  return request<Notification>(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'POST',
  })
}

export function markAllNotificationsRead(before?: string) {
  return request<{ updated: number }>('/api/notifications/read-all', {
    method: 'POST',
    headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(before ? { before } : {}),
  })
}

export type ProgressionSnapshot = {
  occurredAt: string
  xp: number
  level: number
  messagesEncoded: number
  messagesDecoded: number
  syteProcessed: number
}

export type ProgressionResponse = {
  asOf: string
  current: ProgressionSnapshot
  snapshots: ProgressionSnapshot[]
  achievements: Array<{
    code: string
    title: string
    awardedAt?: string
    criterion: string
    progress: number
    target: number
    evidence: Record<string, unknown>
  }>
}

export function getProgression(period: '7d' | '30d' | '90d' = '30d') {
  return request<ProgressionResponse>(`/api/profile/progression?period=${period}`)
}
