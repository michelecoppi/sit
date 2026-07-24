import type { MeResponse } from '../types/profile'
import type { StatisticsProvider, StatisticsSnapshotResponse, StatisticsSummary } from '../types/statistics'
import {
  getApiUrl,
  getApiHeaders,
  parseResponsePayload,
  resolveApiErrorMessage,
  throwApiError,
} from './apiClient'

export async function getMe(): Promise<MeResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/me`, {
    method: 'GET',
    headers: getApiHeaders(),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    const { message } = resolveApiErrorMessage(response.status, payload, 'Live profile data is currently unavailable.')
    throw new Error(message)
  }

  return payload as MeResponse
}

function toStatisticsSummary(payload: unknown): StatisticsSummary | null {
  if (!payload || typeof payload !== 'object') return null

  const data = payload as Record<string, unknown>

  const registeredUsers = typeof data.registeredUsers === 'number' ? data.registeredUsers : null
  const totalMessages = typeof data.totalMessages === 'number' ? data.totalMessages : null
  const totalEncodings = typeof data.totalEncodings === 'number' ? data.totalEncodings : null
  const totalDecodings = typeof data.totalDecodings === 'number' ? data.totalDecodings : null
  const totalSyte = typeof data.totalSyte === 'number' ? data.totalSyte : null
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
    return payload as StatisticsSnapshotResponse
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
        global,
        byProvider: byProvider as Record<StatisticsProvider, StatisticsSummary>,
      },
    }
  } catch {
    const { message } = resolveApiErrorMessage(response.status, payload, 'Unable to load statistics snapshot.')
    throw new Error(message)
  }
}
