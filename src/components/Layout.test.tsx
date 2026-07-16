import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

describe('Layout', () => {
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
})
