import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nativeProtocolApi } from './nativeProtocolService'

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.example')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('nativeProtocolApi', () => {
  it('maps the Core registry contract into canonical frontend entries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      defaultVersion: '2.1',
      registryVersion: '1.2.0',
      registryChecksum: 'checksum',
      versions: [
        { version: '2.0', capabilities: ['registry', 'dictionary', 'encode', 'decode', 'validate'] },
        { version: '2.1', capabilities: ['registry', 'dictionary', 'encode', 'decode', 'validate', 'canonical_decode'] },
      ],
      entries: [{
        token: 'HELLO',
        code: '6667677667767676',
        meaning: 'Greeting',
        category: 'Greeting',
        aliases: ['hello'],
        version: '2.0',
        description: 'Official greeting',
        usage: 'Start a message',
        examples: ['HELLO'],
        tags: ['greeting'],
        rfc: 'RFC-0002',
      }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })))

    const registry = await nativeProtocolApi.registry()

    expect(registry.entries[0]).toMatchObject({ id: 'hello', name: 'HELLO' })
    expect(registry.versions[1].capabilities).toContain('canonical_decode')
  })

  it('returns structured 422 validation results instead of collapsing them into transport errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      version: '2.1',
      errors: [{ code: 'unknown_token', position: 2, suggestion: 'Choose an official token.' }],
    }), { status: 422, headers: { 'content-type': 'application/json' } })))

    const result = await nativeProtocolApi.encode('UNKNOWN', '2.1')

    expect(result.errors?.[0]).toEqual({
      code: 'unknown_token',
      position: 2,
      suggestion: 'Choose an official token.',
    })
  })
})
