import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CapsuleSaveButton from './CapsuleSaveButton'

const { mockCreateCapsule } = vi.hoisted(() => ({
  mockCreateCapsule: vi.fn(),
}))

vi.mock('../../services/capsuleService', () => ({
  createCapsule: mockCreateCapsule,
  getCapsuleShareUrl: (publicId: string) => `https://sit.test/#/capsule/${publicId}`,
}))

beforeEach(() => {
  mockCreateCapsule.mockReset()
  mockCreateCapsule.mockResolvedValue({
    id: 'cap_1',
    publicId: 'public_67',
  })
})

describe('CapsuleSaveButton', () => {
  it('saves the active playground payload with intentional visibility and expiry controls', async () => {
    render(<CapsuleSaveButton edition="2.0" payload="6667677667767676" decodedPreview="HELLO" suggestedTitle="Native greeting" authenticated />)

    fireEvent.click(screen.getByRole('button', { name: 'Save as capsule' }))
    expect(screen.getByText('Seal this result')).toBeInTheDocument()
    expect(screen.getByText('Preview: HELLO')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Visibility'), { target: { value: 'public' } })
    fireEvent.change(screen.getByLabelText('Automatic expiry'), { target: { value: '24' } })
    fireEvent.click(screen.getByRole('button', { name: 'Seal and issue URL' }))

    await waitFor(() => expect(mockCreateCapsule).toHaveBeenCalledWith(expect.objectContaining({
      edition: '2.0',
      payload: '6667677667767676',
      title: 'Native greeting',
      visibility: 'public',
      expiresAt: expect.any(String),
    })))
    expect(await screen.findByText('Capsule sealed')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://sit.test/#/capsule/public_67')).toBeInTheDocument()
  })
})
