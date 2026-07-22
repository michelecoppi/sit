import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ConnectedAccountsCard from './ConnectedAccountsCard'
import type { ConnectedAccount } from '../../types/account'

describe('ConnectedAccountsCard', () => {
  it('renders dynamic providers and triggers connect', () => {
    const onRefresh = vi.fn()
    const onConnect = vi.fn()

    const providers: ConnectedAccount[] = [
      {
        provider: 'DISCORD',
        connected: true,
        status: 'CONNECTED',
        displayName: 'Michele',
      },
      {
        provider: 'TELEGRAM',
        connected: false,
        status: 'NOT_CONNECTED',
      },
      {
        provider: 'UNKNOWN_PROVIDER',
        connected: false,
        status: 'NOT_CONNECTED',
      },
    ]

    render(
      <ConnectedAccountsCard
        providers={providers}
        isLoading={false}
        error={null}
        actionProvider={null}
        onRefresh={onRefresh}
        onConnect={onConnect}
      />,
    )

    expect(screen.getByText('Discord')).toBeInTheDocument()
    expect(screen.getByText('Telegram')).toBeInTheDocument()
    expect(screen.getByText('Unknown Provider')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Connect Telegram'))
    expect(onConnect).toHaveBeenCalledWith('TELEGRAM')

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })
})
