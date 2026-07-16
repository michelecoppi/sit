import { describe, expect, it } from 'vitest'
import { encodeBatchToSit, decodeBatchToText } from './batch'
import { encodeTextToSit } from './encoder'

describe('encodeBatchToSit', () => {
  it('encodes each non-empty line as a separate SIT block', () => {
    expect(encodeBatchToSit('HI\nBY')).toBe(`${encodeTextToSit('HI')}\n\n${encodeTextToSit('BY')}`)
  })
})

describe('decodeBatchToText', () => {
  it('decodes multiple SIT blocks back to separate lines', () => {
    const payload = `${encodeTextToSit('HI')}\n\n${encodeTextToSit('BY')}`
    expect(decodeBatchToText(payload)).toBe('HI\nBY')
  })
})
