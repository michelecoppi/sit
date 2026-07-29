import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AlphabetPage, NativePlayground, PunctuationPage } from './NativePages'
import { nativeDictionary, nativeEncode } from '../data/native'

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://core.example')
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (!init?.method) {
      return new Response(JSON.stringify({
        defaultVersion: '2.1',
        registryVersion: '1.2.0',
        registryChecksum: 'test-checksum',
        versions: [
          { version: '2.0', capabilities: ['registry', 'dictionary', 'encode', 'decode', 'validate'] },
          { version: '2.1', capabilities: ['registry', 'dictionary', 'encode', 'decode', 'validate', 'canonical_decode'] },
        ],
        entries: nativeDictionary.map(({ id: _id, name, ...entry }) => ({ ...entry, token: name })),
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response(JSON.stringify({ ok: true, version: '2.1', output: 'HELLO', tokens: ['HELLO'] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('NativePlayground', () => {
  it('shows copy controls for both encoder and decoder outputs', () => {
    render(<NativePlayground />)

    expect(screen.getByRole('button', { name: 'Copy result' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Native Decoder' }))

    expect(screen.getByRole('button', { name: 'Copy result' })).toBeInTheDocument()
  })

  it('optionally shows canonical token names in native decoder mode', async () => {
    render(<NativePlayground />)

    await waitFor(() => expect(screen.getByLabelText(/native version/i)).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Native Decoder' }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: nativeEncode('HELLO, WORLD!') },
    })
    fireEvent.click(screen.getByLabelText(/show canonical token names/i))

    expect(screen.getByText('HELLO, WORLD!')).toBeInTheDocument()
    expect(screen.getByText('HELLO COMMA WORLD EXCLAMATIONMARK')).toBeInTheDocument()
  })

  it('splits the dedicated punctuation page into punctuation, grouping, and operators sections', () => {
    render(<PunctuationPage />)

    expect(screen.getByRole('heading', { name: 'Punctuation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Grouping' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Operators' })).toBeInTheDocument()
    expect(screen.getByText('@USER = VALUE')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Punctuation' })).toHaveAttribute('href', '#/punctuation?section=punctuation')
    expect(screen.getByRole('link', { name: 'Grouping' })).toHaveAttribute('href', '#/punctuation?section=grouping')
    expect(screen.getByRole('link', { name: 'Operators' })).toHaveAttribute('href', '#/punctuation?section=operators')
    expect(screen.queryByText('ATSIGN')).not.toBeInTheDocument()
  })

  it('keeps operator entries out of the official alphabet page table', () => {
    render(<AlphabetPage />)

    expect(screen.queryByRole('button', { name: 'Punctuation' })).not.toBeInTheDocument()
    expect(screen.queryByText('ATSIGN')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Object' })).toBeInTheDocument()
  })
})
