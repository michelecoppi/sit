import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RfcPage from './RfcPage'

describe('RfcPage', () => {
  it('opens and closes RFC memo dialog', async () => {
    render(
      <MemoryRouter>
        <RfcPage />
      </MemoryRouter>,
    )

    const memoButtons = screen.getAllByRole('button', { name: /read memo/i })
    fireEvent.click(memoButtons[0])

    expect(screen.getByRole('dialog', { name: /rfc-0001 memo/i })).toBeInTheDocument()
    expect(screen.getByText(/defines sit 1.0 as a byte-preserving symbolic layer/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /rfc-0001 memo/i })).not.toBeInTheDocument()
    })
  })
})
