import { describe, expect, it } from 'vitest'
import { encodeTextToSit } from './encoder'

describe('encodeTextToSit', () => {
  it('encodes ASCII characters into SIT digits', () => {
    expect(encodeTextToSit('A')).toBe('01000001'.replace(/0/g, '6').replace(/1/g, '7'))
  })

  it('groups multiple characters into compact rows for readability', () => {
    expect(encodeTextToSit('AB')).toBe('67666667 67666676')
    expect(encodeTextToSit('ABCDE')).toContain('\n')
  })

  it('encodes UTF-8 characters using byte sequences', () => {
    const bytes = Array.from(new TextEncoder().encode('é'))
      .map((byte) => byte.toString(2).padStart(8, '0').replace(/0/g, '6').replace(/1/g, '7'))

    expect(encodeTextToSit('é')).toBe(bytes.join(' '))
  })
})
