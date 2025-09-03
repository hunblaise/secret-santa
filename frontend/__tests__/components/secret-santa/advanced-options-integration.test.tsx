import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { SecretSantaForm } from '@/components/secret-santa/participant-form'
import { SecretSantaResponse } from '@/lib/types'

// Mock API with proper hoisting
vi.mock('@/lib/api', () => ({
  secretSantaApi: {
    generatePairs: vi.fn(),
  },
}))

// Get the mock function reference after mocking
import { secretSantaApi } from '@/lib/api'
const mockGeneratePairs = vi.mocked(secretSantaApi.generatePairs)

// Mock toast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock crypto for secure ID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
  writable: true,
})

const mockOnResults = vi.fn()
const mockSetIsLoading = vi.fn()

const mockSuccessResponse: SecretSantaResponse = {
  pairs: [
    { from: 'alice@test.com', to: 'bob@test.com' },
    { from: 'bob@test.com', to: 'charlie@test.com' },
    { from: 'charlie@test.com', to: 'alice@test.com' },
  ],
  emailStatus: 'DISABLED',
  emailResults: {},
  errors: [],
  timestamp: '2025-09-03T13:00:00Z',
}

describe('AdvancedOptions Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    mockGeneratePairs.mockClear()
    mockToast.mockClear()
    mockOnResults.mockClear()
    mockSetIsLoading.mockClear()
  })

  const setupForm = async () => {
    render(
      <SecretSantaForm
        onResults={mockOnResults}
        isLoading={false}
        setIsLoading={mockSetIsLoading}
      />
    )

    // Add participant emails
    const emailsTextarea = screen.getByLabelText(/email addresses/i)
    await user.clear(emailsTextarea)
    await user.type(emailsTextarea, 'alice@test.com\nbob@test.com\ncharlie@test.com')

    // Open advanced options
    const advancedOptionsButton = screen.getByRole('button', { name: /advanced options/i })
    await user.click(advancedOptionsButton)

    return { emailsTextarea }
  }

  describe('Full Form Integration', () => {
    it('submits form with exclusions correctly', async () => {
      mockGeneratePairs.mockResolvedValue(mockSuccessResponse)
      await setupForm()

      // Add an exclusion: alice cannot give to bob
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)

      // Set exclusion from alice to bob
      const fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('alice@test.com'))

      const toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('bob@test.com'))

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate secret santa pairs/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockGeneratePairs).toHaveBeenCalledWith({
          emails: ['alice@test.com', 'bob@test.com', 'charlie@test.com'],
          exclusions: {
            'alice@test.com': ['bob@test.com']
          },
          mappings: undefined,
          cheats: undefined,
          emailSendingEnabled: true,
        })
      })
    })

    it('submits form with forced pairings correctly', async () => {
      mockGeneratePairs.mockResolvedValue(mockSuccessResponse)
      await setupForm()

      // Switch to forced pairings tab
      const forcedPairsTab = screen.getByRole('tab', { name: /forced pairs/i })
      await user.click(forcedPairsTab)

      // Add a forced pairing: charlie must give to alice
      const addForcedButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addForcedButton)

      const fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('charlie@test.com'))

      const toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('alice@test.com'))

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate secret santa pairs/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockGeneratePairs).toHaveBeenCalledWith({
          emails: ['alice@test.com', 'bob@test.com', 'charlie@test.com'],
          exclusions: undefined,
          mappings: undefined,
          cheats: {
            'charlie@test.com': 'alice@test.com'
          },
          emailSendingEnabled: true,
        })
      })
    })

    it('submits form with name mappings correctly', async () => {
      mockGeneratePairs.mockResolvedValue(mockSuccessResponse)
      await setupForm()

      // Switch to name mapping tab
      const nameMappingTab = screen.getByRole('tab', { name: /name mapping/i })
      await user.click(nameMappingTab)

      // Add name mappings
      const addMappingButton = screen.getByRole('button', { name: /add new name mapping/i })
      await user.click(addMappingButton)

      const emailSelect = screen.getByRole('combobox', { name: /email/i })
      await user.click(emailSelect)
      await user.click(screen.getByText('alice@test.com'))

      const nameInput = screen.getByPlaceholderText('John Smith')
      await user.type(nameInput, 'Alice Smith')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate secret santa pairs/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockGeneratePairs).toHaveBeenCalledWith({
          emails: ['alice@test.com', 'bob@test.com', 'charlie@test.com'],
          exclusions: undefined,
          mappings: {
            'alice@test.com': 'Alice Smith'
          },
          cheats: undefined,
          emailSendingEnabled: true,
        })
      })
    })

    it('submits form with all advanced options combined', async () => {
      mockGeneratePairs.mockResolvedValue(mockSuccessResponse)
      await setupForm()

      // Add exclusion
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)

      let fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('alice@test.com'))

      let toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('bob@test.com'))

      // Add forced pairing
      const forcedPairsTab = screen.getByRole('tab', { name: /forced pairs/i })
      await user.click(forcedPairsTab)

      const addForcedButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addForcedButton)

      fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('bob@test.com'))

      toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('charlie@test.com'))

      // Add name mapping
      const nameMappingTab = screen.getByRole('tab', { name: /name mapping/i })
      await user.click(nameMappingTab)

      const addMappingButton = screen.getByRole('button', { name: /add new name mapping/i })
      await user.click(addMappingButton)

      const emailSelect = screen.getByRole('combobox', { name: /email/i })
      await user.click(emailSelect)
      await user.click(screen.getByText('charlie@test.com'))

      const nameInput = screen.getByPlaceholderText('John Smith')
      await user.type(nameInput, 'Charlie Brown')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate secret santa pairs/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockGeneratePairs).toHaveBeenCalledWith({
          emails: ['alice@test.com', 'bob@test.com', 'charlie@test.com'],
          exclusions: {
            'alice@test.com': ['bob@test.com']
          },
          mappings: {
            'charlie@test.com': 'Charlie Brown'
          },
          cheats: {
            'bob@test.com': 'charlie@test.com'
          },
          emailSendingEnabled: true,
        })
      })
    })
  })

  describe('Real-time Validation During Form Interaction', () => {
    it('prevents submission with invalid exclusion configuration', async () => {
      await setupForm()

      // Add exclusion with self-assignment
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)

      const fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('alice@test.com'))

      const toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('alice@test.com'))

      // Should show validation error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: 'You cannot exclude someone from themselves',
          variant: 'destructive'
        })
      })
    })

    it('updates advanced options when emails change', async () => {
      const { emailsTextarea } = await setupForm()

      // Initially should see 3 emails in dropdowns
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)

      let fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      expect(screen.getByText('alice@test.com')).toBeInTheDocument()
      expect(screen.getByText('bob@test.com')).toBeInTheDocument()
      expect(screen.getByText('charlie@test.com')).toBeInTheDocument()
      
      // Close the dropdown
      await user.press('Escape')

      // Change emails
      await user.clear(emailsTextarea)
      await user.type(emailsTextarea, 'dave@test.com\neve@test.com\nfrank@test.com')

      // Should see new emails in dropdown
      fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      expect(screen.getByText('dave@test.com')).toBeInTheDocument()
      expect(screen.getByText('eve@test.com')).toBeInTheDocument()
      expect(screen.getByText('frank@test.com')).toBeInTheDocument()
    })
  })

  describe('Complex Validation Scenarios', () => {
    it('handles multiple exclusions and forced pairings with cross-validation', async () => {
      await setupForm()

      // Add exclusion: alice cannot give to bob
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)

      let fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('alice@test.com'))

      let toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('bob@test.com'))

      // Try to add conflicting forced pairing
      const forcedPairsTab = screen.getByRole('tab', { name: /forced pairs/i })
      await user.click(forcedPairsTab)

      const addForcedButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addForcedButton)

      fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('alice@test.com'))

      toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('bob@test.com'))

      // Should show conflict validation error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: 'This conflicts with an existing exclusion',
          variant: 'destructive'
        })
      })
    })

    it('validates duplicate name mappings across multiple entries', async () => {
      await setupForm()

      const nameMappingTab = screen.getByRole('tab', { name: /name mapping/i })
      await user.click(nameMappingTab)

      // Add first name mapping
      const addMappingButton = screen.getByRole('button', { name: /add new name mapping/i })
      await user.click(addMappingButton)

      let emailSelect = screen.getAllByRole('combobox', { name: /email/i })[0]
      await user.click(emailSelect)
      await user.click(screen.getByText('alice@test.com'))

      // Add second name mapping
      await user.click(addMappingButton)

      // Try to use same email
      emailSelect = screen.getAllByRole('combobox', { name: /email/i })[1]
      await user.click(emailSelect)
      await user.click(screen.getByText('alice@test.com'))

      // Should show duplicate validation error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: 'This email already has a name mapping',
          variant: 'destructive'
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully with advanced options', async () => {
      const apiError = new Error('Network error')
      mockGeneratePairs.mockRejectedValue(apiError)
      
      await setupForm()

      // Add some advanced options
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)

      const fromSelect = screen.getByRole('combobox', { name: /from/i })
      await user.click(fromSelect)
      await user.click(screen.getByText('alice@test.com'))

      const toSelect = screen.getByRole('combobox', { name: /to/i })
      await user.click(toSelect)
      await user.click(screen.getByText('bob@test.com'))

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate secret santa pairs/i })
      await user.click(submitButton)

      // Should handle API error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive'
        })
      })
    })
  })
})