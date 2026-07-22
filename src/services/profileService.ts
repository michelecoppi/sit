import type { MeResponse } from '../types/profile'

function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) {
    throw new Error('SIT Core is not configured.')
  }
  return apiUrl.replace(/\/+$/, '')
}

export async function getMe(token: string): Promise<MeResponse> {
  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/api/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Live profile data is currently unavailable. Showing token-based details only.')
  }

  return (await response.json()) as MeResponse
}
