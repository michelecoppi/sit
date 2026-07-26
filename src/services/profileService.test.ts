import { describe, expect, it } from 'vitest'
import { parseProfileStatistics, parseStatisticsSnapshot } from './profileService'

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

describe('parseStatisticsSnapshot', () => {
  it('derives global activity from provider totals when the backend reports stale data', () => {
    const result = parseStatisticsSnapshot({
      providers: ['discord', 'telegram'],
      snapshot: {
        global: {
          registeredUsers: 2,
          totalMessages: 26,
          totalEncodings: 14,
          totalDecodings: 20,
          totalSyte: 9904,
          mostActiveUser: 'Gabbiano',
        },
        byProvider: {
          discord: {
            registeredUsers: 2,
            totalMessages: 48,
            totalEncodings: 18,
            totalDecodings: 32,
            totalSyte: 12560,
            mostActiveUser: 'Gabbiano',
          },
          telegram: {
            registeredUsers: 1,
            totalMessages: 6,
            totalEncodings: 0,
            totalDecodings: 2,
            totalSyte: 16,
            mostActiveUser: 'Gabbiano',
          },
        },
      },
    })

    expect(result.snapshot.global).toEqual({
      registeredUsers: 2,
      totalMessages: 54,
      totalEncodings: 18,
      totalDecodings: 34,
      totalSyte: 12576,
      mostActiveUser: 'Gabbiano',
    })
  })

  it('rejects unsafe or incomplete provider counters', () => {
    expect(() => parseStatisticsSnapshot({
      snapshot: {
        global: {},
        byProvider: {},
      },
    })).toThrow('Invalid statistics snapshot payload.')
  })
})
