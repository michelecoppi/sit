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

  it('decodes UTF-8 payloads back to the original characters', () => {
    const encoded = Array.from(new TextEncoder().encode('é'))
      .map((byte) => byte.toString(2).padStart(8, '0').replace(/0/g, '6').replace(/1/g, '7'))
      .join(' ')

    expect(decodeSitToText(encoded)).toBe('é')
  })
})
