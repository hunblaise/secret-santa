import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedEmailInput } from '../../../components/secret-santa/enhanced-email-input'
import { Form, FormField } from '../../../components/ui/form'
import { useForm } from 'react-hook-form'

type TestFormValues = {
  emailsText: string
}

describe('EnhancedEmailInput', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderEnhancedInput = (value = '') => {
    const Wrapper = () => {
      const form = useForm<TestFormValues>({
        defaultValues: { emailsText: value },
      })

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="emailsText"
            render={({ field }) => (
              <EnhancedEmailInput
                value={field.value}
                onChange={(val) => {
                  field.onChange(val)
                  mockOnChange(val)
                }}
                placeholder="Enter emails..."
              />
            )}
          />
        </Form>
      )
    }

    return render(<Wrapper />)
  }

  it('should render with empty state', () => {
    renderEnhancedInput()

    expect(screen.getByText('Email Addresses')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter emails...')).toBeInTheDocument()
    expect(screen.getByText(/Enter one email address per line • 0 valid participants/)).toBeInTheDocument()
    expect(screen.getByText('0 participants')).toBeInTheDocument()
  })

  it('should validate single valid email', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'john@example.com')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('john@example.com')
      expect(screen.getByText('1 valid')).toBeInTheDocument()
      expect(screen.getByText('1 participant')).toBeInTheDocument()
    })
  })

  it('should validate multiple valid emails', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'john@example.com\njane@example.com\nbob@example.com')

    await waitFor(() => {
      expect(screen.getByText('3 valid')).toBeInTheDocument()
      expect(screen.getByText('3 participants')).toBeInTheDocument()
    })
  })

  it('should identify invalid emails', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'john@example.com\ninvalid-email\njane@example.com')

    await waitFor(() => {
      expect(screen.getByText('2 valid')).toBeInTheDocument()
      expect(screen.getByText('1 invalid')).toBeInTheDocument()
      expect(screen.getByText('Invalid email format: Line 2')).toBeInTheDocument()
    })
  })

  it('should detect duplicate emails', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'john@example.com\njane@example.com\njohn@example.com')

    await waitFor(() => {
      expect(screen.getByText('1 valid')).toBeInTheDocument()
      expect(screen.getByText('2 duplicate')).toBeInTheDocument()
      expect(screen.getByText('2 duplicate emails found')).toBeInTheDocument()
    })
  })

  it('should handle mixed valid, invalid, and duplicate emails', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'john@example.com\ninvalid-email\njane@example.com\njohn@example.com\nanother-invalid')

    await waitFor(() => {
      expect(screen.getByText('1 valid')).toBeInTheDocument()
      expect(screen.getByText('2 invalid')).toBeInTheDocument()
      expect(screen.getByText('2 duplicate')).toBeInTheDocument()
      expect(screen.getByText('Invalid email format: Line 2, Line 5')).toBeInTheDocument()
      expect(screen.getByText('2 duplicate emails found')).toBeInTheDocument()
    })
  })

  it('should ignore empty lines', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'john@example.com\n\n\njane@example.com\n\nbob@example.com')

    await waitFor(() => {
      expect(screen.getByText('3 valid')).toBeInTheDocument()
      expect(screen.getByText('3 participants')).toBeInTheDocument()
    })
  })

  it('should limit error display to first 3 invalid emails', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'invalid1\ninvalid2\ninvalid3\ninvalid4\ninvalid5')

    await waitFor(() => {
      expect(screen.getByText('5 invalid')).toBeInTheDocument()
      expect(screen.getByText('Invalid email format: Line 1, Line 2, Line 3 and 2 more')).toBeInTheDocument()
    })
  })

  it('should update participant count with correct singular/plural form', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    
    // Single participant
    await user.type(textarea, 'john@example.com')
    await waitFor(() => {
      expect(screen.getByText('1 participant')).toBeInTheDocument()
    })

    // Multiple participants
    await user.type(textarea, '\njane@example.com')
    await waitFor(() => {
      expect(screen.getByText('2 participants')).toBeInTheDocument()
    })
  })

  it('should handle pre-filled value', () => {
    renderEnhancedInput('john@example.com\njane@example.com')

    expect(screen.getByText('2 valid')).toBeInTheDocument()
    expect(screen.getByText('2 participants')).toBeInTheDocument()
  })

  it('should show correct badge variants based on minimum requirement', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    
    // Less than 3 participants - secondary badge
    await user.type(textarea, 'john@example.com\njane@example.com')
    await waitFor(() => {
      const badge = screen.getByText('2 participants')
      expect(badge).toHaveClass('bg-secondary')
    })

    // 3 or more participants - default badge
    await user.type(textarea, '\nbob@example.com')
    await waitFor(() => {
      const badge = screen.getByText('3 participants')
      expect(badge).toHaveClass('bg-primary')
    })
  })

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup()
    renderEnhancedInput()

    const textarea = screen.getByPlaceholderText('Enter emails...')
    await user.type(textarea, 'j')

    expect(mockOnChange).toHaveBeenCalledWith('j')
  })

  it('should handle empty input gracefully', () => {
    renderEnhancedInput('')

    expect(screen.getByText('0 participants')).toBeInTheDocument()
    expect(screen.getByText(/0 valid participants/)).toBeInTheDocument()
    expect(screen.queryByText(/invalid/)).not.toBeInTheDocument()
    expect(screen.queryByText(/duplicate/)).not.toBeInTheDocument()
  })
})
