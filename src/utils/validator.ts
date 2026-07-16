export function validateSit(input: string) {
  const invalid = Array.from(input).find((char) => !['6', '7', ' ', '\n'].includes(char))
  if (!invalid) {
    return { valid: true, message: 'Valid SIT payload. Compliance Level: Standard', error: '' }
  }
  return { valid: false, message: `❌ Invalid character: ${invalid}`, error: 'Compliance Level: Legacy' }
}
