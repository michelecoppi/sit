export function decodeSitToText(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((row) => {
      if (!/^[67]+$/.test(row)) {
        return ''
      }

      const bits = row.replace(/6/g, '0').replace(/7/g, '1')
      if (bits.length !== 8) {
        return ''
      }

      return String.fromCharCode(parseInt(bits, 2))
    })
    .join('')
}
