import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'
import type { NativeEntry } from '../data/native'

export type NativeVersion = '2.0' | '2.1'
export type NativeLocale = 'en' | 'it'
export type NativeCapability = 'registry' | 'dictionary' | 'encode' | 'decode' | 'validate' | 'canonical_decode'
export type NativeError = { code: string; position: number | null; suggestion: string }
export type NativeResult = { ok: boolean; version: NativeVersion; output?: string; tokens?: string[]; errors?: NativeError[] }
export type NativeRegistry = {
  defaultVersion: NativeVersion
  registryVersion: string
  registryChecksum: string
  versions: Array<{ version: NativeVersion; capabilities: NativeCapability[] }>
  entries: NativeEntry[]
}

type NativeRegistryEntryPayload = Omit<NativeEntry, 'id' | 'name'> & { token: string }

async function nativeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}/api/native${path}`, {
    ...init,
    headers: { ...getApiHeaders(), ...init?.headers },
  })
  const payload = await parseResponsePayload(response)
  const deterministicValidationFailure = response.status === 422
    && typeof payload === 'object'
    && payload !== null
    && 'ok' in payload
    && payload.ok === false
  if (!response.ok && !deterministicValidationFailure) throwApiError(response.status, payload, 'Native protocol request failed.', false)
  return payload as T
}

export const nativeProtocolApi = {
  registry: async (): Promise<NativeRegistry> => {
    const payload = await nativeRequest<Omit<NativeRegistry, 'entries'> & { entries: NativeRegistryEntryPayload[] }>('/registry')
    return {
      ...payload,
      entries: payload.entries.map((entry) => ({
        ...entry,
        id: entry.token.toLowerCase(),
        name: entry.token,
      })),
    }
  },
  dictionary: (query = '', version: NativeVersion = '2.1') => nativeRequest<{ version: NativeVersion; registryVersion: string; registryChecksum: string; entries: NativeRegistryEntryPayload[] }>(`/dictionary?query=${encodeURIComponent(query)}&version=${version}`),
  encode: (input: string, version: NativeVersion, locale: NativeLocale = 'en') => nativeRequest<NativeResult>('/encode', { method: 'POST', body: JSON.stringify({ input, version, locale }) }),
  decode: (payload: string, version: NativeVersion, canonical = false, locale: NativeLocale = 'en') => nativeRequest<NativeResult>('/decode', { method: 'POST', body: JSON.stringify({ payload, version, canonical, locale }) }),
  validate: (value: string, direction: 'encode' | 'decode', version: NativeVersion, locale: NativeLocale = 'en') => nativeRequest<NativeResult>('/validate', { method: 'POST', body: JSON.stringify({ value, direction, version, locale }) }),
}
