import type { MeResponse } from '../types/profile'
import { getApiUrl, getAuthHeaders, parseResponsePayload, throwApiError } from './apiClient'

export async function getMe(token: string): Promise<MeResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throwApiError(response.status, payload, 'Live profile data is currently unavailable. Showing token-based details only.')
  }

  return payload as MeResponse
}
