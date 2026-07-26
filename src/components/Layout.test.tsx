import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

describe('Layout', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    delete document.documentElement.dataset.theme
    document.documentElement.style.colorScheme = ''
  })

  it('renders the main navigation and footer content', () => {
    render(
      <MemoryRouter>
        <Layout title="Home">
          <div>Page content</div>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('SIT')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getByText('International SIT Consortium')).toBeInTheDocument()
  })

  it('applies and persists both themes from the accessible toggle', () => {
    render(
      <MemoryRouter>
        <Layout title="Home">
          <div>Page content</div>
        </Layout>
      </MemoryRouter>,
    )

    const darkToggle = screen.getByRole('button', { name: 'Switch to dark theme' })
    expect(darkToggle).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    fireEvent.click(darkToggle)

    const lightToggle = screen.getByRole('button', { name: 'Switch to light theme' })
    expect(lightToggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(window.localStorage.getItem('sit-theme')).toBe('dark')

    fireEvent.click(lightToggle)

    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(window.localStorage.getItem('sit-theme')).toBe('light')
  })
})
