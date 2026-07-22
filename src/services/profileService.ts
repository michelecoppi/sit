import type { MeResponse } from '../types/profile'
import { getApiUrl, getAuthHeaders, parseResponsePayload, resolveApiErrorMessage } from './apiClient'

export async function getMe(token?: string | null): Promise<MeResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
    credentials: 'include',
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    const { message } = resolveApiErrorMessage(response.status, payload, 'Live profile data is currently unavailable. Showing token-based details only.')
    throw new Error(message)
  }

  return payload as MeResponse
}
