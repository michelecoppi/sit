import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCapsule, getPublicCapsule, parseCapsule, parseCapsulePage, parsePublicCapsule, revokeCapsule } from './capsuleService'

const capsule = {
  id: 'cap_123',
  publicId: 'N4c8vY7q',
  edition: '2.0',
  payload: '6667677667767676',
  title: 'Native greeting',
  description: 'A portable protocol example.',
  visibility: 'unlisted',
  expiresAt: '2026-08-02T12:00:00.000Z',
  createdAt: '2026-07-26T12:00:00.000Z',
  updatedAt: '2026-07-26T12:00:00.000Z',
  revokedAt: null,
  owner: {
    researcherId: 'SIT-0067',
    displayName: 'Protocol Researcher',
  },
}

const { id: _id, revokedAt: _revokedAt, ...publicCapsule } = capsule

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.sit.test')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('capsule payload parsing', () => {
  it('accepts the safe public capsule contract', () => {
    expect(parseCapsule(capsule)).toEqual(capsule)
    expect(parsePublicCapsule(publicCapsule)).toEqual(publicCapsule)
  })

  it.each([
    ['unknown edition', { ...capsule, edition: '3.0' }],
    ['unknown visibility', { ...capsule, visibility: 'friends' }],
    ['missing payload', { ...capsule, payload: '' }],
    ['malformed owner', { ...capsule, owner: { displayName: 'Anonymous' } }],
    ['invalid expiry', { ...capsule, expiresAt: 'tomorrow' }],
  ])('rejects %s', (_label, malformed) => {
    expect(() => parseCapsule(malformed)).toThrow('Invalid capsule payload.')
  })

  it('validates cursor pages', () => {
    expect(parseCapsulePage({ items: [capsule], nextCursor: 'next_1' })).toEqual({
      items: [capsule],
      nextCursor: 'next_1',
    })
    expect(() => parseCapsulePage({ items: [capsule], nextCursor: 12 })).toThrow('Invalid capsule list payload.')
  })
})

describe('capsule API operations', () => {
  it('creates a capsule with credentials and the selected privacy controls', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(capsule), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await createCapsule({
      edition: '2.0',
      payload: capsule.payload,
      title: capsule.title,
      visibility: 'unlisted',
      expiresAt: capsule.expiresAt,
    })

    expect(result.publicId).toBe(capsule.publicId)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/capsules'), expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }))
  })

  it('never returns private or expired public content from stale state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ...publicCapsule,
      visibility: 'private',
    }), { status: 200 })))

    await expect(getPublicCapsule(capsule.publicId)).rejects.toThrow('This capsule is unavailable.')
  })

  it('rejects internal management metadata from the public contract', () => {
    expect(() => parsePublicCapsule(capsule)).toThrow('Invalid public capsule payload.')
  })

  it('revokes through the authenticated endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    await revokeCapsule(capsule.id)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`/api/capsules/${capsule.id}`), expect.objectContaining({
      method: 'DELETE',
      credentials: 'include',
    }))
  })
})
