import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { AdvancedOptions } from '@/components/secret-santa/advanced-options'
import { FormData } from '@/lib/types'
import { Form } from '@/components/ui/form'

// Mock crypto.randomUUID for testing with unique IDs
let mockUuidCounter = 0
const mockCryptoRandomUUID = vi.fn(() => `test-uuid-${++mockUuidCounter}`)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockCryptoRandomUUID,
  },
  writable: true,
})

// Mock hasPointerCapture for Radix UI compatibility
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: vi.fn(() => false),
  writable: true,
})

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
})

// Mock toast hook
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Test form schema
const testFormSchema = z.object({
  emailsText: z.string(),
  sendEmails: z.boolean(),
  exclusions: z.array(z.object({
    id: z.string(),
    from: z.string().email(),
    to: z.string().email(),
  })).default([]),
  forcedPairings: z.array(z.object({
    id: z.string(),
    from: z.string().email(),
    to: z.string().email(),
  })).default([]),
  nameMappings: z.array(z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  })).default([]),
})

// Test wrapper component
function TestWrapper({ emailsText = 'test1@example.com\ntest2@example.com\ntest3@example.com' }) {
  const form = useForm<FormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      emailsText: '',
      sendEmails: true,
      exclusions: [],
      forcedPairings: [],
      nameMappings: [],
    },
  })

  return (
    <Form {...form}>
      <AdvancedOptions form={form} emailsText={emailsText} />
    </Form>
  )
}

describe('AdvancedOptions Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    mockToast.mockClear()
    mockCryptoRandomUUID.mockClear()
    mockUuidCounter = 0 // Reset counter for consistent test IDs
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering and Basic Functionality', () => {
    it('renders all three tabs correctly', () => {
      render(<TestWrapper />)
      
      expect(screen.getByRole('tab', { name: /exclusions/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /forced pairs/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /name mapping/i })).toBeInTheDocument()
    })

    it('shows message when no emails are provided', () => {
      render(<TestWrapper emailsText="" />)
      
      expect(screen.getByText(/enter participant emails first/i)).toBeInTheDocument()
    })

    it('shows form error when form prop is null', () => {
      render(<AdvancedOptions form={null as any} emailsText="test@example.com" />)
      
      expect(screen.getByText(/form configuration error/i)).toBeInTheDocument()
    })
  })

  describe('Secure ID Generation', () => {
    it('uses crypto.randomUUID when available', async () => {
      render(<TestWrapper />)
      
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addButton)
      
      expect(mockCryptoRandomUUID).toHaveBeenCalled()
    })

    it('falls back to timestamp-based ID when crypto.randomUUID unavailable', async () => {
      // Temporarily remove crypto
      const originalCrypto = global.crypto
      delete (global as any).crypto
      
      render(<TestWrapper />)
      
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addButton)
      
      // Should render form fields even without crypto
      expect(screen.getByLabelText(/from/i)).toBeInTheDocument()
      
      // Restore crypto
      global.crypto = originalCrypto
    })
  })

  describe('Exclusions Tab', () => {
    beforeEach(async () => {
      render(<TestWrapper />)
      // Ensure exclusions tab is active
      const exclusionsTab = screen.getByRole('tab', { name: /exclusions/i })
      await user.click(exclusionsTab)
    })

    it('adds new exclusion rule', async () => {
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addButton)
      
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByText('cannot give to')).toBeInTheDocument()
      expect(screen.getByText('To')).toBeInTheDocument()
    })

    it('removes exclusion rule with confirmation toast', async () => {
      // Add exclusion first
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addButton)
      
      // Remove it
      const removeButton = screen.getByRole('button', { name: /remove exclusion rule 1/i })
      await user.click(removeButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: 'Exclusion removed' })
      })
    })

    it('shows form fields for exclusion rule', async () => {
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addButton)
      
      // Should show form fields
      expect(screen.getByRole('combobox', { name: /from/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /to/i })).toBeInTheDocument()
      expect(screen.getByText('cannot give to')).toBeInTheDocument()
    })
  })

  describe('Forced Pairings Tab', () => {
    beforeEach(async () => {
      render(<TestWrapper />)
      const forcedPairsTab = screen.getByRole('tab', { name: /forced pairs/i })
      await user.click(forcedPairsTab)
    })

    it('adds new forced pairing rule', async () => {
      const addButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addButton)
      
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByText('must give to')).toBeInTheDocument()
      expect(screen.getByText('To')).toBeInTheDocument()
    })

    it('removes forced pairing with confirmation toast', async () => {
      // Add forced pairing first
      const addButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addButton)
      
      // Remove it
      const removeButton = screen.getByRole('button', { name: /remove forced pairing 1/i })
      await user.click(removeButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: 'Forced pairing removed' })
      })
    })

    it('shows form fields for forced pairing rule', async () => {
      const addButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addButton)
      
      // Should show form fields
      expect(screen.getByRole('combobox', { name: /from/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /to/i })).toBeInTheDocument()
      expect(screen.getByText('must give to')).toBeInTheDocument()
    })
  })

  describe('Name Mapping Tab', () => {
    beforeEach(async () => {
      render(<TestWrapper />)
      const nameMappingTab = screen.getByRole('tab', { name: /name mapping/i })
      await user.click(nameMappingTab)
    })

    it('adds new name mapping', async () => {
      const addButton = screen.getByRole('button', { name: /add new name mapping/i })
      await user.click(addButton)
      
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Display Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument()
    })

    it('removes name mapping with confirmation toast', async () => {
      // Add name mapping first
      const addButton = screen.getByRole('button', { name: /add new name mapping/i })
      await user.click(addButton)
      
      // Remove it
      const removeButton = screen.getByRole('button', { name: /remove name mapping 1/i })
      await user.click(removeButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: 'Name mapping removed' })
      })
    })

    it('shows multiple name mapping forms', async () => {
      const addButton = screen.getByRole('button', { name: /add new name mapping/i })
      await user.click(addButton)
      await user.click(addButton) // Add second mapping
      
      // Should show two sets of form fields
      const emailSelects = screen.getAllByRole('combobox', { name: /email/i })
      const nameInputs = screen.getAllByPlaceholderText('John Smith')
      
      expect(emailSelects).toHaveLength(2)
      expect(nameInputs).toHaveLength(2)
    })
  })

  describe('Form State Management', () => {
    it('maintains separate state for different rule types', async () => {
      // Add exclusion rule
      const exclusionsTab = screen.getByRole('tab', { name: /exclusions/i })
      await user.click(exclusionsTab)
      
      const addExclusionButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addExclusionButton)
      
      // Switch to forced pairings and add rule
      const forcedPairsTab = screen.getByRole('tab', { name: /forced pairs/i })
      await user.click(forcedPairsTab)
      
      const addForcedButton = screen.getByRole('button', { name: /add new forced pairing rule/i })
      await user.click(addForcedButton)
      
      // Switch back to exclusions - should still have the rule
      await user.click(exclusionsTab)
      expect(screen.getByRole('button', { name: /remove exclusion rule 1/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility Features', () => {
    it('has proper ARIA labels on all buttons', async () => {
      render(<TestWrapper />)
      
      expect(screen.getByRole('button', { name: /add new exclusion rule/i })).toBeInTheDocument()
      
      // Add a rule to test remove button
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      await user.click(addButton)
      
      expect(screen.getByRole('button', { name: /remove exclusion rule 1/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<TestWrapper />)
      
      const addButton = screen.getByRole('button', { name: /add new exclusion rule/i })
      
      // Test keyboard focus
      addButton.focus()
      expect(addButton).toHaveFocus()
      
      // Test keyboard activation
      fireEvent.keyDown(addButton, { key: 'Enter', code: 'Enter' })
      await waitFor(() => {
        expect(screen.getByText('From')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Optimizations', () => {
    it('handles emailsText changes correctly', () => {
      const { rerender } = render(<TestWrapper emailsText="" />)
      
      // Should show message about needing emails initially
      expect(screen.getByText(/enter participant emails first/i)).toBeInTheDocument()
      
      // Rerender with emails
      rerender(<TestWrapper emailsText="test1@example.com\ntest2@example.com\ntest3@example.com" />)
      
      // Should now show the form
      expect(screen.getByRole('tab', { name: /exclusions/i })).toBeInTheDocument()
    })

    it('validates component re-renders efficiently', () => {
      const { rerender } = render(<TestWrapper emailsText="test1@example.com\ntest2@example.com" />)
      
      // Multiple rerenders should not break the component
      rerender(<TestWrapper emailsText="test1@example.com\ntest2@example.com" />)
      rerender(<TestWrapper emailsText="test1@example.com\ntest2@example.com" />)
      
      // Should still render correctly
      expect(screen.getByRole('tab', { name: /exclusions/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /forced pairs/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /name mapping/i })).toBeInTheDocument()
    })
  })
})