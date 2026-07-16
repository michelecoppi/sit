export function encodeTextToSit(input: string): string {
  return Array.from(input)
    .map((char) => {
      const code = char.charCodeAt(0)
      return code.toString(2).padStart(8, '0').replace(/0/g, '6').replace(/1/g, '7')
    })
    .join('\n')
}
