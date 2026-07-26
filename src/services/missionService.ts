import type {
  Mission,
  MissionDashboard,
  MissionHistoryPage,
  MissionRotationSchedule,
  MissionRotationWindow,
  MissionStreak,
} from '../types/missions'
import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'

const CADENCES = new Set(['daily', 'weekly'])
const STATES = new Set(['active', 'completed'])

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function requireText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function parseMission(payload: unknown): Mission {
  if (!isObject(payload)) throw new Error('Invalid mission payload.')

  const {
    code,
    title,
    description,
    cadence,
    metric,
    target,
    progress,
    remaining,
    xpReward,
    state,
    startsAt,
    resetsAt,
    completedAt,
  } = payload

  if (
    !requireText(code)
    || !requireText(title)
    || typeof description !== 'string'
    || typeof cadence !== 'string'
    || !CADENCES.has(cadence)
    || !requireText(metric)
    || !isNonNegativeInteger(target)
    || target === 0
    || !isNonNegativeInteger(progress)
    || !isNonNegativeInteger(remaining)
    || remaining !== Math.max(0, target - progress)
    || !isNonNegativeInteger(xpReward)
    || typeof state !== 'string'
    || !STATES.has(state)
    || !isIsoDate(startsAt)
    || !isIsoDate(resetsAt)
    || (completedAt !== null && !isIsoDate(completedAt))
    || (state === 'completed' && completedAt === null)
  ) {
    throw new Error('Invalid mission payload.')
  }

  return {
    code,
    title,
    description,
    cadence: cadence as Mission['cadence'],
    metric,
    target,
    progress,
    remaining,
    xpReward,
    state: state as Mission['state'],
    startsAt,
    resetsAt,
    completedAt,
  }
}

export function parseMissionStreak(payload: unknown): MissionStreak {
  if (!isObject(payload)) throw new Error('Invalid mission streak payload.')

  const { current, best, lastQualifiedDate, timezone, rules } = payload
  if (
    !isNonNegativeInteger(current)
    || !isNonNegativeInteger(best)
    || best < current
    || (lastQualifiedDate !== null && !isIsoDate(lastQualifiedDate))
    || timezone !== 'UTC'
    || !requireText(rules)
  ) {
    throw new Error('Invalid mission streak payload.')
  }

  return { current, best, lastQualifiedDate, timezone, rules }
}

function parseRotationWindow(payload: unknown): MissionRotationWindow {
  if (!isObject(payload)) throw new Error('Invalid mission rotation payload.')
  const { startsAt, resetsAt, missionCount } = payload
  if (
    !isIsoDate(startsAt)
    || !isIsoDate(resetsAt)
    || Date.parse(resetsAt) <= Date.parse(startsAt)
    || !isNonNegativeInteger(missionCount)
  ) {
    throw new Error('Invalid mission rotation payload.')
  }
  return { startsAt, resetsAt, missionCount }
}

function parseRotationSchedule(payload: unknown): MissionRotationSchedule {
  if (!isObject(payload)) throw new Error('Invalid mission rotation payload.')
  return {
    daily: parseRotationWindow(payload.daily),
    weekly: parseRotationWindow(payload.weekly),
  }
}

export function parseMissionDashboard(activePayload: unknown, streakPayload: unknown): MissionDashboard {
  if (!isObject(activePayload) || !Array.isArray(activePayload.missions) || !isIsoDate(activePayload.serverTime)) {
    throw new Error('Invalid mission dashboard payload.')
  }

  return {
    missions: activePayload.missions.map(parseMission),
    streak: parseMissionStreak(isObject(streakPayload) && 'streak' in streakPayload ? streakPayload.streak : streakPayload),
    rotation: activePayload.rotation === undefined ? undefined : parseRotationSchedule(activePayload.rotation),
    serverTime: activePayload.serverTime,
  }
}

export function parseMissionHistory(payload: unknown): MissionHistoryPage {
  if (!isObject(payload) || !Array.isArray(payload.items)) {
    throw new Error('Invalid mission history payload.')
  }

  const nextCursor = payload.nextCursor
  if (nextCursor !== null && typeof nextCursor !== 'string') {
    throw new Error('Invalid mission history payload.')
  }

  return {
    items: payload.items.map(parseMission),
    nextCursor,
  }
}

async function request(path: string, fallback: string) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'GET',
    headers: getApiHeaders(),
    credentials: 'include',
    cache: 'no-store',
  })
  const payload = await parseResponsePayload(response)
  if (!response.ok) throwApiError(response.status, payload, fallback)
  return payload
}

export async function getMissionDashboard(): Promise<MissionDashboard> {
  const [active, streak] = await Promise.all([
    request('/api/missions', 'Mission progress is currently unavailable.'),
    request('/api/missions/streak', 'Streak data is currently unavailable.'),
  ])
  return parseMissionDashboard(active, streak)
}

export async function getMissionHistory(cursor?: string): Promise<MissionHistoryPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return parseMissionHistory(await request(`/api/missions/history${query}`, 'Mission history is currently unavailable.'))
}
