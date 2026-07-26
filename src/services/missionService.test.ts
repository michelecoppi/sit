import { describe, expect, it } from 'vitest'
import { parseMissionDashboard, parseMissionHistory } from './missionService'

const mission = {
  code: 'daily_encode_3',
  title: 'Three clean transmissions',
  description: 'Encode three messages through any linked SIT provider.',
  cadence: 'daily',
  metric: 'messages_encoded',
  target: 3,
  progress: 2,
  remaining: 1,
  xpReward: 40,
  state: 'active',
  startsAt: '2026-07-26T00:00:00.000Z',
  resetsAt: '2026-07-27T00:00:00.000Z',
  completedAt: null,
}

describe('mission payload parsing', () => {
  it('preserves backend-authored progress, remaining target and UTC streak rules', () => {
    const result = parseMissionDashboard({
      missions: [mission],
      rotation: {
        daily: {
          startsAt: '2026-07-26T00:00:00.000Z',
          resetsAt: '2026-07-27T00:00:00.000Z',
          missionCount: 3,
        },
        weekly: {
          startsAt: '2026-07-20T00:00:00.000Z',
          resetsAt: '2026-07-27T00:00:00.000Z',
          missionCount: 3,
        },
      },
      serverTime: '2026-07-26T12:00:00.000Z',
    }, {
      streak: {
        current: 4,
        best: 9,
        lastQualifiedDate: '2026-07-25T00:00:00.000Z',
        timezone: 'UTC',
        rules: 'Complete at least one daily mission before its UTC reset.',
      },
    })

    expect(result.missions[0]).toEqual(mission)
    expect(result.streak.current).toBe(4)
    expect(result.streak.timezone).toBe('UTC')
    expect(result.rotation?.daily.missionCount).toBe(3)
  })

  it.each([
    ['derived remaining mismatch', { ...mission, remaining: 2 }],
    ['zero target', { ...mission, target: 0 }],
    ['fractional progress', { ...mission, progress: 1.5 }],
    ['unknown cadence', { ...mission, cadence: 'monthly' }],
    ['completed without timestamp', { ...mission, state: 'completed' }],
  ])('rejects %s', (_label, malformed) => {
    expect(() => parseMissionDashboard({
      missions: [malformed],
      serverTime: '2026-07-26T12:00:00.000Z',
    }, {
      current: 0,
      best: 0,
      lastQualifiedDate: null,
      timezone: 'UTC',
      rules: 'Complete one mission.',
    })).toThrow('Invalid mission payload.')
  })

  it('parses cursor history without inventing a next page', () => {
    const completed = {
      ...mission,
      progress: 3,
      remaining: 0,
      state: 'completed',
      completedAt: '2026-07-26T09:00:00.000Z',
    }
    expect(parseMissionHistory({ items: [completed], nextCursor: null })).toEqual({
      items: [completed],
      nextCursor: null,
    })
  })

  it('rejects a rotation that ends before it starts', () => {
    expect(() => parseMissionDashboard({
      missions: [mission],
      rotation: {
        daily: {
          startsAt: '2026-07-27T00:00:00.000Z',
          resetsAt: '2026-07-26T00:00:00.000Z',
          missionCount: 3,
        },
        weekly: {
          startsAt: '2026-07-20T00:00:00.000Z',
          resetsAt: '2026-07-27T00:00:00.000Z',
          missionCount: 3,
        },
      },
      serverTime: '2026-07-26T12:00:00.000Z',
    }, {
      current: 0,
      best: 0,
      lastQualifiedDate: null,
      timezone: 'UTC',
      rules: 'Complete one mission.',
    })).toThrow('Invalid mission rotation payload.')
  })
})
