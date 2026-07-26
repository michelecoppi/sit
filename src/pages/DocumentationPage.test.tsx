import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DocumentationPage from './DocumentationPage'

function CurrentLocation() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

describe('DocumentationPage', () => {
  it('keeps chapter and quick-reference navigation inside the docs route', () => {
    Element.prototype.scrollIntoView = vi.fn()

    render(
      <MemoryRouter initialEntries={['/docs']}>
        <DocumentationPage />
        <CurrentLocation />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: /encoding/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/docs?section=encoding')

    fireEvent.click(screen.getByRole('link', { name: /view quick example/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/docs?section=reference-example')
  })

  it('uses a shareable section URL and marks the selected chapter', () => {
    Element.prototype.scrollIntoView = vi.fn()

    render(
      <MemoryRouter initialEntries={['/docs?section=peer-review']}>
        <DocumentationPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /peer review/i })).toHaveAttribute('aria-current', 'location')
  })
})
