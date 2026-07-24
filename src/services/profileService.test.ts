import { describe, expect, it } from 'vitest'
import { parseProfileStatistics } from './profileService'

const exactPayload = {
  researcherId: 'SIT-0027',
  xp: 987,
  level: 7,
  messagesEncoded: 31,
  messagesDecoded: 29,
  syteProcessed: 456,
  updatedAt: '2026-07-24T10:11:12.000Z',
}

describe('parseProfileStatistics', () => {
  it('preserves every database-backed value exactly', () => {
    expect(parseProfileStatistics(exactPayload)).toEqual(exactPayload)
  })

  it.each([
    ['missing field', { ...exactPayload, messagesDecoded: undefined }],
    ['negative counter', { ...exactPayload, xp: -1 }],
    ['fractional counter', { ...exactPayload, syteProcessed: 1.5 }],
    ['invalid level', { ...exactPayload, level: 0 }],
    ['invalid timestamp', { ...exactPayload, updatedAt: 'not-a-date' }],
  ])('rejects %s instead of substituting a display value', (_label, payload) => {
    expect(() => parseProfileStatistics(payload)).toThrow('Invalid profile statistics payload.')
  })
})
