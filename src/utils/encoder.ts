export function encodeTextToSit(input: string): string {
  const bytes = Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(2).padStart(8, '0').replace(/0/g, '6').replace(/1/g, '7'))

  return bytes.reduce<string[]>((groups, byte, index) => {
    const groupIndex = Math.floor(index / 4)
    if (!groups[groupIndex]) {
      groups[groupIndex] = byte
      return groups
    }

    groups[groupIndex] = `${groups[groupIndex]} ${byte}`
    return groups
  }, []).join('\n')
}
