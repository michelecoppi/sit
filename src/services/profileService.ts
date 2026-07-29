import type { MeResponse, ProfileStatistics } from '../types/profile'
import type { StatisticsProvider, StatisticsSnapshotResponse, StatisticsSummary } from '../types/statistics'
import {
  getApiUrl,
  getApiHeaders,
  parseResponsePayload,
  resolveApiErrorMessage,
  throwApiError,
} from './apiClient'
import { queueOfflineChange } from './offlineSyncService'

export async function getMe(): Promise<MeResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/me`, {
    method: 'GET',
    headers: getApiHeaders(),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Live profile data is currently unavailable.', false)
  }

  return payload as MeResponse
}

export async function setPreferredLanguage(preferredLanguage: string): Promise<string> {
  if (!navigator.onLine) {
    await queueOfflineChange('preference', 'preferred-language', { preferredLanguage })
    return preferredLanguage
  }
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/profile/language`, {
    method: 'PATCH',
    headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ preferredLanguage }),
  })
  const payload = await parseResponsePayload(response)
  if (!response.ok || !payload || typeof payload !== 'object' || typeof (payload as { preferredLanguage?: unknown }).preferredLanguage !== 'string') {
    throw new Error('Unable to save language preference.')
  }
  const saved = (payload as { preferredLanguage: string }).preferredLanguage
  await queueOfflineChange('preference', 'preferred-language', { preferredLanguage: saved })
  return saved
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

export function parseProfileStatistics(payload: unknown): ProfileStatistics {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid profile statistics payload.')
  }

  const data = payload as Record<string, unknown>
  const {
    researcherId,
    xp,
    level,
    messagesEncoded,
    messagesDecoded,
    syteProcessed,
    updatedAt,
  } = data

  if (
    typeof researcherId !== 'string'
    || researcherId.trim().length === 0
    || !isNonNegativeSafeInteger(xp)
    || typeof level !== 'number'
    || !Number.isSafeInteger(level)
    || level < 1
    || !isNonNegativeSafeInteger(messagesEncoded)
    || !isNonNegativeSafeInteger(messagesDecoded)
    || !isNonNegativeSafeInteger(syteProcessed)
    || typeof updatedAt !== 'string'
    || Number.isNaN(new Date(updatedAt).getTime())
  ) {
    throw new Error('Invalid profile statistics payload.')
  }

  return {
    researcherId,
    xp,
    level,
    messagesEncoded,
    messagesDecoded,
    syteProcessed,
    updatedAt,
  }
}

export async function getProfileStatistics(): Promise<ProfileStatistics> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/profile/statistics`, {
    method: 'GET',
    headers: getApiHeaders(),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)
  if (!response.ok) {
    throwApiError(response.status, payload, 'Profile statistics are currently unavailable.', false)
  }

  return parseProfileStatistics(payload)
}

function toStatisticsSummary(payload: unknown): StatisticsSummary | null {
  if (!payload || typeof payload !== 'object') return null

  const data = payload as Record<string, unknown>

  const registeredUsers = isNonNegativeSafeInteger(data.registeredUsers) ? data.registeredUsers : null
  const totalMessages = isNonNegativeSafeInteger(data.totalMessages) ? data.totalMessages : null
  const totalEncodings = isNonNegativeSafeInteger(data.totalEncodings) ? data.totalEncodings : null
  const totalDecodings = isNonNegativeSafeInteger(data.totalDecodings) ? data.totalDecodings : null
  const totalSyte = isNonNegativeSafeInteger(data.totalSyte) ? data.totalSyte : null
  const mostActiveUser = typeof data.mostActiveUser === 'string' ? data.mostActiveUser : null

  if (
    registeredUsers === null
    || totalMessages === null
    || totalEncodings === null
    || totalDecodings === null
    || totalSyte === null
    || mostActiveUser === null
  ) {
    return null
  }

  return {
    registeredUsers,
    totalMessages,
    totalEncodings,
    totalDecodings,
    totalSyte,
    mostActiveUser,
  }
}

function deriveGlobalStatistics(
  reportedGlobal: StatisticsSummary,
  byProvider: Partial<Record<StatisticsProvider, StatisticsSummary>>,
): StatisticsSummary {
  const discord = byProvider.discord
  const telegram = byProvider.telegram
  if (!discord || !telegram) return reportedGlobal

  const sum = (discordValue: number, telegramValue: number) => {
    const total = discordValue + telegramValue
    if (!Number.isSafeInteger(total)) {
      throw new Error('Invalid statistics snapshot payload.')
    }
    return total
  }

  return {
    ...reportedGlobal,
    totalMessages: sum(discord.totalMessages, telegram.totalMessages),
    totalEncodings: sum(discord.totalEncodings, telegram.totalEncodings),
    totalDecodings: sum(discord.totalDecodings, telegram.totalDecodings),
    totalSyte: sum(discord.totalSyte, telegram.totalSyte),
  }
}

export function parseStatisticsSnapshot(payload: unknown): StatisticsSnapshotResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid statistics snapshot payload.')
  }

  const data = payload as Record<string, unknown>
  const snapshot = data.snapshot
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('Invalid statistics snapshot payload.')
  }

  const snapshotData = snapshot as Record<string, unknown>
  const reportedGlobal = toStatisticsSummary(snapshotData.global)
  const rawByProvider = snapshotData.byProvider
  if (!reportedGlobal || !rawByProvider || typeof rawByProvider !== 'object') {
    throw new Error('Invalid statistics snapshot payload.')
  }

  const byProviderData = rawByProvider as Record<string, unknown>
  const discord = toStatisticsSummary(byProviderData.discord)
  const telegram = toStatisticsSummary(byProviderData.telegram)
  if (!discord || !telegram) {
    throw new Error('Invalid statistics snapshot payload.')
  }

  const byProvider: Record<StatisticsProvider, StatisticsSummary> = {
    discord,
    telegram,
  }

  return {
    providers: ['discord', 'telegram'],
    snapshot: {
      global: deriveGlobalStatistics(reportedGlobal, byProvider),
      byProvider,
    },
  }
}

async function getLegacyStatistics(apiUrl: string, provider?: string): Promise<StatisticsSummary> {
  const query = provider ? `?provider=${encodeURIComponent(provider)}` : ''
  const response = await fetch(`${apiUrl}/api/statistics${query}`, {
    method: 'GET',
    headers: getApiHeaders(),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)
  if (!response.ok) {
    throwApiError(response.status, payload, 'Unable to load statistics right now.', false)
  }

  const nestedSummary = toStatisticsSummary((payload as { summary?: unknown } | null)?.summary ?? null)
  if (nestedSummary) return nestedSummary

  const directSummary = toStatisticsSummary(payload)
  if (directSummary) return directSummary

  throw new Error('Invalid statistics payload.')
}

export async function getStatisticsSnapshot(): Promise<StatisticsSnapshotResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/statistics/snapshot`, {
    method: 'GET',
    headers: getApiHeaders(),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)
  if (response.ok) {
    return parseStatisticsSnapshot(payload)
  }

  try {
    const global = await getLegacyStatistics(apiUrl)
    const providers: StatisticsProvider[] = ['discord', 'telegram']
    const byProvider: Partial<Record<StatisticsProvider, StatisticsSummary>> = {}

    await Promise.all(providers.map(async (provider) => {
      try {
        byProvider[provider] = await getLegacyStatistics(apiUrl, provider)
      } catch {
        // Keep partial fallback if one provider endpoint is unavailable.
      }
    }))

    return {
      providers,
      snapshot: {
        global: deriveGlobalStatistics(global, byProvider),
        byProvider,
      },
    }
  } catch {
    const { message } = resolveApiErrorMessage(response.status, payload, 'Unable to load statistics snapshot.')
    throw new Error(message)
  }
}

