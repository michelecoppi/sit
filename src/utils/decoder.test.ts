import { describe, expect, it } from 'vitest'
import { decodeSitToText } from './decoder'

describe('decodeSitToText', () => {
  it('decodes a valid SIT payload back to text', () => {
    const encoded = '01000001'.replace(/0/g, '6').replace(/1/g, '7')
    expect(decodeSitToText(encoded)).toBe('A')
  })

  it('ignores invalid rows that are not 8 bits long', () => {
    expect(decodeSitToText('66776677 6677')).toBe('3')
  })
})
