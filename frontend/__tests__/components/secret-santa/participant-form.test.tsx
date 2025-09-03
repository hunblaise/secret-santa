import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecretSantaForm } from '../../../components/secret-santa/participant-form'

// Mock the API service
vi.mock('../../../lib/api', () => ({
  secretSantaApi: {
    generatePairs: vi.fn()
  }
}))

// Mock the toast hook
vi.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('SecretSantaForm', () => {
  const mockOnResults = vi.fn()
  const mockSetIsLoading = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderForm = (isLoading = false) => {
    return render(
      <SecretSantaForm
        onResults={mockOnResults}
        isLoading={isLoading}
        setIsLoading={mockSetIsLoading}
      />
    )
  }

  it('should render form elements correctly', () => {
    renderForm()

    expect(screen.getByText('Participants')).toBeInTheDocument()
    expect(screen.getByText('Email Addresses')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/john@example.com/)).toBeInTheDocument()
    expect(screen.getByText('Email Delivery')).toBeInTheDocument()
    expect(screen.getByText('Generate Secret Santa Pairs')).toBeInTheDocument()
  })

  it('should show participant count badge', async () => {
    const user = userEvent.setup()
    renderForm()

    const textarea = screen.getByPlaceholderText(/john@example.com/)
    
    await user.type(textarea, 'john@example.com\njane@example.com')
    
    await waitFor(() => {
      expect(screen.getByText('2 participants')).toBeInTheDocument()
    })
  })

  it('should disable generate button with less than 3 participants', async () => {
    const user = userEvent.setup()
    renderForm()

    const textarea = screen.getByPlaceholderText(/john@example.com/)
    const generateButton = screen.getByRole('button', { name: /Generate Secret Santa Pairs/ })
    
    // Initially disabled (0 participants)
    expect(generateButton).toBeDisabled()
    
    // Still disabled with 2 participants
    await user.type(textarea, 'john@example.com\njane@example.com')
    await waitFor(() => {
      expect(generateButton).toBeDisabled()
    })
  })

  it('should enable generate button with 3 or more valid participants', async () => {
    const user = userEvent.setup()
    renderForm()

    const textarea = screen.getByPlaceholderText(/john@example.com/)
    const generateButton = screen.getByRole('button', { name: /Generate Secret Santa Pairs/ })
    
    await user.type(textarea, 'john@example.com\njane@example.com\nbob@example.com')
    
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled()
    })
  })

  it('should ignore invalid emails in participant count', async () => {
    const user = userEvent.setup()
    renderForm()

    const textarea = screen.getByPlaceholderText(/john@example.com/)
    const generateButton = screen.getByRole('button', { name: /Generate Secret Santa Pairs/ })
    
    // Add 2 valid emails and 2 invalid ones
    await user.type(textarea, 'john@example.com\ninvalid-email\njane@example.com\nanother-invalid')
    
    await waitFor(() => {
      expect(screen.getByText('2 participants')).toBeInTheDocument()
      expect(generateButton).toBeDisabled() // Should still be disabled (only 2 valid)
    })
  })

  it('should show loading state when generating', () => {
    renderForm(true) // isLoading = true

    const generateButton = screen.getByRole('button', { name: /Generating/ })
    expect(generateButton).toBeDisabled()
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('should toggle email delivery switch', async () => {
    const user = userEvent.setup()
    renderForm()

    const emailSwitch = screen.getByRole('switch')
    
    // Should be enabled by default
    expect(emailSwitch).toBeChecked()
    
    // Click to disable
    await user.click(emailSwitch)
    expect(emailSwitch).not.toBeChecked()
  })

  it('should show advanced options when collapsed trigger is clicked', async () => {
    const user = userEvent.setup()
    renderForm()

    const advancedOptionsButton = screen.getByText('Advanced Options')
    
    // Should not show placeholder text initially
    expect(screen.queryByText(/Advanced options coming in Step 4/)).not.toBeInTheDocument()
    
    // Click to expand
    await user.click(advancedOptionsButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Advanced options coming in Step 4/)).toBeInTheDocument()
    })
  })

  it('should show form validation errors', async () => {
    const user = userEvent.setup()
    renderForm()

    const generateButton = screen.getByRole('button', { name: /Generate Secret Santa Pairs/ })
    
    // Try to submit with no emails
    await user.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter at least one email address')).toBeInTheDocument()
    })
  })

  it('should show minimum participant validation error', async () => {
    const user = userEvent.setup()
    renderForm()

    const textarea = screen.getByPlaceholderText(/john@example.com/)
    const generateButton = screen.getByRole('button', { name: /Generate Secret Santa Pairs/ })
    
    // Add only 2 valid emails
    await user.type(textarea, 'john@example.com\njane@example.com')
    
    // Force submit (even though button should be disabled)
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('You need at least 3 participants for Secret Santa')).toBeInTheDocument()
    })
  })
})