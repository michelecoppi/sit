export function toAsciiBytes(input: string): string[] {
  return Array.from(input).map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
}

export function fromAsciiBytes(bytes: string[]): string {
  return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join('')
}
