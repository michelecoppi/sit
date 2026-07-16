import { decodeSitToText } from './decoder'
import { encodeTextToSit } from './encoder'

export function encodeBatchToSit(input: string): string {
  return input
    .split(/\n+/)
    .filter((line) => line.trim().length > 0)
    .map((line) => encodeTextToSit(line))
    .join('\n\n')
}

export function decodeBatchToText(input: string): string {
  return input
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((block) => decodeSitToText(block))
    .join('\n')
}
