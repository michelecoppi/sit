export function decodeSitToText(input: string): string {
  const bytes = input
    .split(/\s+/)
    .filter(Boolean)
    .map((row) => {
      if (!/^[67]+$/.test(row)) {
        return null
      }

      const bits = row.replace(/6/g, '0').replace(/7/g, '1')
      if (bits.length !== 8) {
        return null
      }

      return parseInt(bits, 2)
    })
    .filter((value): value is number => value !== null)

  if (bytes.length === 0) {
    return ''
  }

  return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes))
}
