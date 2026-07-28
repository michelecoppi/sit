import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'

export type NativeVersion = '2.0' | '2.1'
export type NativeLocale = 'en' | 'it'
export type NativeError = { code: string; position: number | null; suggestion: string }
export type NativeResult = { ok: boolean; version: NativeVersion; output?: string; tokens?: string[]; errors?: NativeError[] }

async function nativeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}/api/native${path}`, {
    ...init,
    headers: { ...getApiHeaders(), ...init?.headers },
  })
  const payload = await parseResponsePayload(response)
  if (!response.ok) throwApiError(response.status, payload, 'Native protocol request failed.', false)
  return payload as T
}

export const nativeProtocolApi = {
  registry: () => nativeRequest<{ defaultVersion: NativeVersion; versions: Array<{ version: NativeVersion; capabilities: string[] }> }>('/registry'),
  dictionary: (query = '') => nativeRequest<{ entries: unknown[] }>(`/dictionary?query=${encodeURIComponent(query)}`),
  encode: (input: string, version: NativeVersion, locale: NativeLocale = 'en') => nativeRequest<NativeResult>('/encode', { method: 'POST', body: JSON.stringify({ input, version, locale }) }),
  decode: (payload: string, version: NativeVersion, canonical = false, locale: NativeLocale = 'en') => nativeRequest<NativeResult>('/decode', { method: 'POST', body: JSON.stringify({ payload, version, canonical, locale }) }),
  validate: (value: string, direction: 'encode' | 'decode', version: NativeVersion, locale: NativeLocale = 'en') => nativeRequest<NativeResult>('/validate', { method: 'POST', body: JSON.stringify({ value, direction, version, locale }) }),
}
