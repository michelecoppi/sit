export function encodeBinaryToSit(input: string): string {
  return input
    .split('')
    .map((bit) => (bit === '0' ? '6' : bit === '1' ? '7' : ''))
    .join('')
}

export function decodeSitToBinary(input: string): string {
  return input.replace(/6/g, '0').replace(/7/g, '1')
}
