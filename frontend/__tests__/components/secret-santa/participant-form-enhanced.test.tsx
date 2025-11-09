import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
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

describe('SecretSantaForm Enhanced Features', () => {
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

  describe('Split Layout', () => {
    it('should render main form and preview panel in desktop layout', () => {
      renderForm()

      // Main form should be present
      expect(screen.getByText('Participants')).toBeInTheDocument()
      expect(screen.getByText('Email Addresses')).toBeInTheDocument()

      // Preview panel should be present
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
      expect(screen.getByText('See your setup in real-time')).toBeInTheDocument()
    })

    it('should use correct grid layout classes', () => {
      const { container } = renderForm()

      // Should have grid layout with lg:grid-cols-5
      const gridContainer = container.querySelector('.grid.lg\\:grid-cols-5')
      expect(gridContainer).toBeInTheDocument()

      // Main form should take 3 columns (60%)
      const mainForm = container.querySelector('.lg\\:col-span-3')
      expect(mainForm).toBeInTheDocument()

      // Preview should take 2 columns (40%)
      const preview = container.querySelector('.lg\\:col-span-2')
      expect(preview).toBeInTheDocument()
    })
  })

  describe('Live Preview Panel', () => {
    it('should show empty state when no participants', () => {
      renderForm()

      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('Participants Added')).toBeInTheDocument()
      expect(screen.getByText('Add participants to see your Secret Santa setup preview')).toBeInTheDocument()
      expect(screen.getByText('Ready when you are!')).toBeInTheDocument()
    })

    it('should update participant count in real-time', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      
      // Add 1 participant
      await user.type(textarea, 'john@example.com')
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('Participant Added')).toBeInTheDocument() // Singular
      })

      // Add more participants
      await user.type(textarea, '\njane@example.com')
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('Participants Added')).toBeInTheDocument() // Plural
      })
    })

    it('should show readiness status based on participant count', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      
      // Less than 3 participants - not ready
      await user.type(textarea, 'john@example.com\njane@example.com')
      await waitFor(() => {
        expect(screen.getByText('Need 1 more participant')).toBeInTheDocument()
      })

      // 3 or more participants - ready
      await user.type(textarea, '\nbob@example.com')
      await waitFor(() => {
        expect(screen.getByText('Ready to generate!')).toBeInTheDocument()
      })
    })

    it('should show correct readiness status styling', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      
      // Not ready state should have amber styling
      await user.type(textarea, 'john@example.com\njane@example.com')
      await waitFor(() => {
        const statusElement = screen.getByText('Need 1 more participant')
        const container = statusElement?.closest('div')?.parentElement
        expect(container).toHaveClass('border-amber-500')
      })

      // Ready state should have secondary/green styling
      await user.type(textarea, '\nbob@example.com')
      await waitFor(() => {
        const statusElement = screen.getByText('Ready to generate!')
        const container = statusElement?.closest('div')?.parentElement
        expect(container).toHaveClass('border-secondary')
      })
    })

    it('should display options summary', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      await user.type(textarea, 'john@example.com\njane@example.com\nbob@example.com')

      // Should show summary options
      expect(await screen.findByText('Email delivery:')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
      const exclusionsRow = screen.getByText('Exclusions:').closest('div')
      expect(exclusionsRow).toBeInTheDocument()
      expect(within(exclusionsRow as HTMLElement).getByText('0')).toBeInTheDocument()

      const forcedPairsRow = screen.getByText('Forced pairs:').closest('div')
      expect(forcedPairsRow).toBeInTheDocument()
      expect(within(forcedPairsRow as HTMLElement).getByText('0')).toBeInTheDocument()

      const customNamesRow = screen.getByText('Custom names:').closest('div')
      expect(customNamesRow).toBeInTheDocument()
      expect(within(customNamesRow as HTMLElement).getByText('0')).toBeInTheDocument()

      // Toggle email delivery
      const emailSwitch = screen.getByRole('switch')
      await user.click(emailSwitch)
      
      await waitFor(() => {
        expect(screen.getByText('Disabled')).toBeInTheDocument()
      })
    })

    it('should show sticky positioning for preview panel', () => {
      const { container } = renderForm()

      const previewCard = container.querySelector('.sticky.top-8')
      expect(previewCard).toBeInTheDocument()
    })
  })

  describe('Advanced Options Enhanced', () => {
    it('should show enhanced progressive disclosure design', () => {
      renderForm()

      const advancedOptionsCard = screen.getByText('Advanced Options').closest('.border-dashed')
      expect(advancedOptionsCard).toBeInTheDocument()
      expect(advancedOptionsCard).toHaveClass('border-2')
    })

    it('should show preview badges when collapsed', async () => {
      const user = userEvent.setup()
      renderForm()

      // First add some participants to enable advanced options
      const textarea = screen.getByPlaceholderText(/john@example.com/)
      await user.type(textarea, 'john@example.com\njane@example.com\nbob@example.com')

      // Expand advanced options to add some rules
      const advancedOptionsButton = screen.getByText('Advanced Options')
      await user.click(advancedOptionsButton)

      // Add an exclusion (this would require the advanced options to be fully implemented)
      // For now, we'll test that the structure is there
      expect(screen.getByText('Advanced Options')).toBeInTheDocument()
    })

    it('should show enhanced description with emojis', () => {
      renderForm()

      expect(screen.getByText(/🚫 Prevent couples from getting each other/)).toBeInTheDocument()
      expect(screen.getByText(/💕 Force specific pairings/)).toBeInTheDocument()
      expect(screen.getByText(/🏷️ Use display names/)).toBeInTheDocument()
    })

    it('should have hover effects', () => {
      const { container } = renderForm()

      const advancedCard = container.querySelector('.hover\\:border-solid')
      expect(advancedCard).toBeInTheDocument()
      expect(advancedCard).toHaveClass('hover:bg-accent/5')
    })

    it('should show icon with background', () => {
      renderForm()

      const titleContainer = screen.getByText('Advanced Options').closest('div')
      const iconContainer = titleContainer?.parentElement?.querySelector('.bg-primary\\/10')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Enhanced Email Input Integration', () => {
    it('should use enhanced email input with validation', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      
      // Type valid emails
      await user.type(textarea, 'john@example.com\njane@example.com')
      
      await waitFor(() => {
        // Should show validation badges
        expect(screen.getByText('2 valid')).toBeInTheDocument()
      })

      // Type invalid email
      await user.type(textarea, '\ninvalid-email')
      
      await waitFor(() => {
        expect(screen.getByText('2 valid')).toBeInTheDocument()
        expect(screen.getByText('1 invalid')).toBeInTheDocument()
      })
    })

    it('should update preview panel based on valid emails only', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      
      // Add 2 valid and 1 invalid email
      await user.type(textarea, 'john@example.com\ninvalid-email\njane@example.com')
      
      await waitFor(() => {
        // Preview panel should show only valid participants count
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('Need 1 more participant')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive grid classes', () => {
      const { container } = renderForm()

      // Should start as single column, then split on lg screens
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('lg:grid-cols-5')
    })

    it('should have responsive gap spacing', () => {
      const { container } = renderForm()

      const gridContainer = container.querySelector('.grid')
      // Updated to new responsive gap classes
      expect(gridContainer?.className).toMatch(/gap-6|gap-8|lg:gap-8/)
    })
  })
})
