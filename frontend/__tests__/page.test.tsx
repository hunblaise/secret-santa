import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Home from '../app/page'

// Mock the Secret Santa components
vi.mock('../components/secret-santa/participant-form', () => ({
  SecretSantaForm: () => <div data-testid="secret-santa-form">Secret Santa Form</div>
}))

vi.mock('../components/secret-santa/results-display', () => ({
  ResultsDisplay: () => <div data-testid="results-display">Results Display</div>
}))

// Mock the toast hook
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

describe('Home Page', () => {
  it('renders the main content with hero layout', () => {
    render(<Home />)
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('renders the enhanced hero section', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Secret Santa Generator')
    
    const description = screen.getByText('Create magical gift exchanges with advanced pairing options')
    expect(description).toBeInTheDocument()
  })

  it('shows trust indicators in hero section', () => {
    render(<Home />)
    
    expect(screen.getByText('No registration')).toBeInTheDocument()
    expect(screen.getByText('Free forever')).toBeInTheDocument()
    expect(screen.getByText('Email delivery')).toBeInTheDocument()
    expect(screen.getByText('100% private')).toBeInTheDocument()
  })

  it('shows the Secret Santa form by default', () => {
    render(<Home />)
    
    const form = screen.getByTestId('secret-santa-form')
    expect(form).toBeInTheDocument()
  })

  it('renders footer in form view only', () => {
    render(<Home />)
    
    expect(screen.getByText('Built with ❤️ for making gift exchanges magical')).toBeInTheDocument()
  })

  it('has proper responsive background styling', () => {
    const { container } = render(<Home />)

    const backgroundContainer = container.querySelector('.min-h-screen.bg-background')
    expect(backgroundContainer).toBeInTheDocument()
  })

  it('includes snowfall animation elements', () => {
    const { container } = render(<Home />)
    
    const snowflakes = container.querySelectorAll('.animate-snowfall')
    expect(snowflakes.length).toBe(15)
  })
})