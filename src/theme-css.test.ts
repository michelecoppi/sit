import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/index.css'),
  'utf8',
)

describe('theme stylesheet contract', () => {
  it('binds Tailwind dark variants to the app-controlled dark class', () => {
    expect(stylesheet).toContain(
      '@custom-variant dark (&:where(.dark, .dark *));',
    )
  })
})
