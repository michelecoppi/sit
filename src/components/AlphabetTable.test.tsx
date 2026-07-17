import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AlphabetTable from './AlphabetTable'

describe('AlphabetTable', () => {
  it('supports a dedicated punctuation quick filter', () => {
    render(<AlphabetTable />)

    fireEvent.click(screen.getByRole('button', { name: 'Punctuation' }))

    expect(screen.getAllByText('COMMA').length).toBeGreaterThan(0)
    expect(screen.queryByText('HELLO')).not.toBeInTheDocument()
  })
})