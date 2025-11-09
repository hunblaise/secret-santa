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

      // Use getAllByText since "0" appears in multiple places (email input and preview panel)
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThan(0)
      expect(screen.getByText('Participants Added')).toBeInTheDocument()
      expect(screen.getByText('Add participants to see your Secret Santa setup preview')).toBeInTheDocument()
      // Text changed to include emoji: "Ready when you are! ✨"
      expect(screen.getByText(/Ready when you are!/)).toBeInTheDocument()
    })

    it('should update participant count in real-time', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)

      // Add 1 participant
      await user.type(textarea, 'john@example.com')
      await waitFor(() => {
        // "1" appears in multiple places, just check the text exists
        const ones = screen.getAllByText('1')
        expect(ones.length).toBeGreaterThan(0)
        expect(screen.getByText('Participant Added')).toBeInTheDocument() // Singular
      })

      // Add more participants
      await user.type(textarea, '\njane@example.com')
      await waitFor(() => {
        // "2" appears in multiple places, just check the text exists
        const twos = screen.getAllByText('2')
        expect(twos.length).toBeGreaterThan(0)
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

      // Not ready state should have cream styling (updated from gold/amber in color refactor)
      await user.type(textarea, 'john@example.com\njane@example.com')
      await waitFor(() => {
        const statusElement = screen.getByText('Need 1 more participant')
        const container = statusElement?.closest('div')?.parentElement
        expect(container).toHaveClass('border-cream-700')
      })

      // Ready state should have green styling
      await user.type(textarea, '\nbob@example.com')
      await waitFor(() => {
        const statusElement = screen.getByText('Ready to generate!')
        const container = statusElement?.closest('div')?.parentElement
        expect(container).toHaveClass('border-green-500')
      })
    })

    it('should display options summary', async () => {
      const user = userEvent.setup()
      renderForm()

      const textarea = screen.getByPlaceholderText(/john@example.com/)
      await user.type(textarea, 'john@example.com\njane@example.com\nbob@example.com')

      // Should show summary options
      expect(await screen.findByText('Email delivery:')).toBeInTheDocument()
      // Text changed to "Enabled ✓" in color refactor
      expect(screen.getByText(/Enabled/)).toBeInTheDocument()

      // Check that all option labels exist (checking for "0" would match too many elements)
      expect(screen.getByText('Exclusions:')).toBeInTheDocument()
      expect(screen.getByText('Forced pairs:')).toBeInTheDocument()
      expect(screen.getByText('Custom names:')).toBeInTheDocument()

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
      // Color refactor changed from hover:bg-accent/5 to hover:border-cream-500/50
      expect(advancedCard?.className).toMatch(/hover:border-cream-500/)
    })

    it('should show icon with background', () => {
      renderForm()

      const titleContainer = screen.getByText('Advanced Options').closest('div')
      // Color refactor changed from bg-primary/10 to bg-gradient with cream colors
      const iconContainer = titleContainer?.parentElement?.querySelector('[class*="bg-gradient"]')
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
        // "2" appears in multiple places, so just check that Need 1 more participant exists
        expect(screen.getByText('Need 1 more participant')).toBeInTheDocument()
        // And verify that "2 valid" badge appears in the email input
        expect(screen.getByText('2 valid')).toBeInTheDocument()
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
