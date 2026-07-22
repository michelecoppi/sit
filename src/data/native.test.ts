import { describe, expect, it } from 'vitest'
import { nativeDecode, nativeDictionary, nativeEncode } from './native'

describe('native punctuation registry', () => {
  it('exposes the fundamental punctuation symbols in the official alphabet', () => {
    const punctuationEntries = ['COMMA', 'PERIOD', 'COLON', 'SEMICOLON', 'QUESTIONMARK', 'EXCLAMATIONMARK']

    expect(punctuationEntries.map((name) => nativeDictionary.find((entry) => entry.name === name)?.symbol)).toEqual([
      ',',
      '.',
      ':',
      ';',
      '?',
      '!',
    ])
  })

  it('encodes punctuation symbols through their native aliases', () => {
    const commaCode = nativeDictionary.find((entry) => entry.name === 'COMMA')?.code
    const questionMarkCode = nativeDictionary.find((entry) => entry.name === 'QUESTIONMARK')?.code

    expect(nativeEncode(', ?')).toBe(`${commaCode} ${questionMarkCode}`)
  })

  it('registers secondary bracket and brace punctuation symbols', () => {
    const punctuationEntries = ['LEFTBRACKET', 'RIGHTBRACKET', 'LEFTBRACE', 'RIGHTBRACE', 'LEFTANGLE', 'RIGHTANGLE', 'BACKSLASH']

    expect(punctuationEntries.map((name) => nativeDictionary.find((entry) => entry.name === name)?.symbol)).toEqual([
      '[',
      ']',
      '{',
      '}',
      '<',
      '>',
      '\\',
    ])
  })

  it('encodes and decodes mixed phrases with attached punctuation naturally', () => {
    const encoded = nativeEncode('HELLO, WORLD!')
    const helloCode = nativeDictionary.find((entry) => entry.name === 'HELLO')?.code
    const commaCode = nativeDictionary.find((entry) => entry.name === 'COMMA')?.code
    const worldCode = nativeDictionary.find((entry) => entry.name === 'WORLD')?.code
    const exclamationCode = nativeDictionary.find((entry) => entry.name === 'EXCLAMATIONMARK')?.code

    expect(encoded).toBe(`${helloCode} ${commaCode} ${worldCode} ${exclamationCode}`)
    expect(nativeDecode(encoded)).toBe('HELLO, WORLD!')
  })

  it('supports advanced symbolic operators and canonical decode mode', () => {
    const encoded = nativeEncode('@USER = VALUE | CODE\\FILE')

    expect(nativeDecode(encoded)).toBe('@USER = VALUE | CODE\\FILE')
    expect(nativeDecode(encoded, { mode: 'canonical' })).toBe('ATSIGN USER EQUALSSIGN VALUE PIPE CODE BACKSLASH FILE')
  })

  it('surfaces stray unregistered symbols as unknown tokens instead of dropping them', () => {
    expect(nativeEncode('%')).toBe('[unknown:%]')
    expect(nativeEncode('A % B')).toContain('[unknown:%]')
  })
})