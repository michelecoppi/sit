import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'
import type { NativeLocale } from './nativeProtocolService'

export type LabOperation = 'encode' | 'decode' | 'verify' | 'native'
export type LabDifficulty = 'easy' | 'medium' | 'hard'
export type LabPreset = { id: string; title: string; difficulty: LabDifficulty; operation: LabOperation; input: string }
export type LabResult = {
  contractVersion: '1'
  operation: LabOperation
  protocolVersion: string
  ok: boolean
  input: string
  normalizedInput: string
  output: string | null
  tokens: string[]
  bytes: number[]
  errors: Array<{ code: string; message: string; rule: string; rfc: string }>
  warnings: string[]
  steps: Array<{ label: string; value: string }>
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}/api/lab${path}`, { ...init, headers: { ...getApiHeaders(), ...init?.headers } })
  const payload = await parseResponsePayload(response)
  if (!response.ok && response.status !== 422) throwApiError(response.status, payload, 'Lab request failed.', false)
  return payload as T
}

export const labApi = {
  presets: () => request<{ contractVersion: '1'; presets: LabPreset[] }>('/presets'),
  run: (operation: LabOperation, input: string, locale: NativeLocale = 'en') => request<LabResult>('/run', { method: 'POST', body: JSON.stringify({ operation, input, version: '2.1', locale }) }),
}
