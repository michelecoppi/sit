import { describe, expect, it } from 'vitest'
import { encodeTextToSit } from './encoder'

describe('encodeTextToSit', () => {
  it('encodes ASCII characters into SIT digits', () => {
    expect(encodeTextToSit('A')).toBe('01000001'.replace(/0/g, '6').replace(/1/g, '7'))
  })

  it('joins multiple characters with newlines', () => {
    expect(encodeTextToSit('AB')).toContain('\n')
  })
})
