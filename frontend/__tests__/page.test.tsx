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
  it('renders the main content', () => {
    render(<Home />)
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('renders the Secret Santa header', () => {
    render(<Home />)
    
    const heading = screen.getByText('Secret Santa Generator')
    expect(heading).toBeInTheDocument()
    
    const description = screen.getByText('Create magical gift exchanges with advanced pairing options')
    expect(description).toBeInTheDocument()
  })

  it('shows the Secret Santa form by default', () => {
    render(<Home />)
    
    const form = screen.getByTestId('secret-santa-form')
    expect(form).toBeInTheDocument()
  })
})