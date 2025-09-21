import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultsDisplay } from '../../../components/secret-santa/results-display'
import type { SecretSantaResponse } from '../../../lib/types'

// Mock the toast hook
vi.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('ResultsDisplay Enhanced Features', () => {
  const mockOnReset = vi.fn()
  const clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined)

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    writable: true,
    value: {
      writeText: clipboardWriteTextMock,
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    clipboardWriteTextMock.mockReset()
    clipboardWriteTextMock.mockResolvedValue(undefined)
    if (navigator.clipboard) {
      Object.defineProperty(navigator.clipboard, 'writeText', {
        configurable: true,
        writable: true,
        value: clipboardWriteTextMock,
      })
    }
    mockOnReset.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const successResults: SecretSantaResponse = {
    pairs: [
      { from: 'john@example.com', to: 'jane@example.com' },
      { from: 'jane@example.com', to: 'bob@example.com' },
      { from: 'bob@example.com', to: 'john@example.com' }
    ],
    emailStatus: 'SUCCESS',
    emailResults: {
      'john@example.com': 'DELIVERED',
      'jane@example.com': 'DELIVERED',
      'bob@example.com': 'DELIVERED'
    },
    errors: [],
    timestamp: '2024-12-25T10:00:00Z'
  }

  const errorResults: SecretSantaResponse = {
    pairs: [],
    emailStatus: 'FAILED',
    emailResults: {},
    errors: ['Cannot generate pairs: insufficient participants'],
    timestamp: '2024-12-25T10:00:00Z'
  }

  const partialEmailResults: SecretSantaResponse = {
    pairs: [
      { from: 'john@example.com', to: 'jane@example.com' },
      { from: 'jane@example.com', to: 'john@example.com' }
    ],
    emailStatus: 'PARTIAL',
    emailResults: {
      'john@example.com': 'DELIVERED',
      'jane@example.com': 'FAILED'
    },
    errors: [],
    timestamp: '2024-12-25T10:00:00Z'
  }

  it('should render success header with enhanced styling', () => {
    render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    expect(screen.getByText('✨ Secret Santa Pairs Generated! ✨')).toBeInTheDocument()
    expect(screen.getByText('Successfully created 3 magical assignments')).toBeInTheDocument()
    expect(screen.getByText(/Generated at/)).toBeInTheDocument()
  })

  it('should show celebration confetti on successful generation', () => {
    render(<ResultsDisplay results={successResults} onReset={mockOnReset} celebrationDuration={1000} />)

    const confettiContainer = screen.getByTestId('celebration-confetti')
    expect(confettiContainer.querySelectorAll('.animate-confetti').length).toBe(30)
  })

  it('should hide celebration after 4 seconds', async () => {
    const { container } = render(
      <ResultsDisplay results={successResults} onReset={mockOnReset} celebrationDuration={10} />
    )

    expect(screen.getByTestId('celebration-confetti')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.queryByTestId('celebration-confetti')).not.toBeInTheDocument()
        expect(container.querySelector('.success-celebration')).toBeNull()
      },
      { timeout: 200 }
    )
  })

  it('should not show celebration for error results', () => {
    render(<ResultsDisplay results={errorResults} onReset={mockOnReset} />)

    expect(screen.queryAllByText(/[🎁🎄⭐❄️🎅]/).length).toBe(0)
  })

  it('should show success icon with animation for successful results', () => {
    const { container } = render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    const successIcon = container.querySelector('.animate-pulse-success')
    expect(successIcon).toBeInTheDocument()
  })

  it('should show error icon for failed results', () => {
    render(<ResultsDisplay results={errorResults} onReset={mockOnReset} />)

    // Should show error icon (XCircle) instead of success
    const errorElement = screen.getByText('Issues Found')
    expect(errorElement).toBeInTheDocument()
  })

  it('should display email status with enhanced styling', () => {
    render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    expect(screen.getByText('Email Status:')).toBeInTheDocument()
    expect(screen.getByText('SUCCESS')).toBeInTheDocument()
    expect(screen.getByText(/Generated at/)).toBeInTheDocument()
  })

  it('should show individual email delivery status', async () => {
    render(<ResultsDisplay results={partialEmailResults} onReset={mockOnReset} />)

    expect(await screen.findByText('Email Delivery Status')).toBeInTheDocument()
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DELIVERED').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0)
  })

  it('should display error messages when present', () => {
    render(<ResultsDisplay results={errorResults} onReset={mockOnReset} />)

    expect(screen.getByText('Issues Found')).toBeInTheDocument()
    expect(screen.getByText('• Cannot generate pairs: insufficient participants')).toBeInTheDocument()
  })

  it('should handle copy pairs functionality', async () => {
    const user = userEvent.setup()
    render(<ResultsDisplay results={successResults} onReset={mockOnReset} celebrationDuration={1000} />)

    expect(typeof navigator.clipboard?.writeText).toBe('function')
    ;(navigator.clipboard as Clipboard).writeText = clipboardWriteTextMock

    const copyButton = screen.getByRole('button', { name: /Copy Pairs/ })
    await user.click(copyButton)
    await act(async () => {
      fireEvent.click(copyButton)
    })

    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalledWith(
        'john@example.com → jane@example.com\njane@example.com → bob@example.com\nbob@example.com → john@example.com'
      )
    })
  })

  it('should handle download results functionality', async () => {
    const user = userEvent.setup()

    // Mock document.createElement and link click
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn()
    }
    const originalCreateElement = document.createElement
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
        if (tagName.toLowerCase() === 'a') {
          return mockLink as any
        }
        return originalCreateElement.call(document, tagName, options)
      }) as any)

    render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    const downloadButton = screen.getByRole('button', { name: /Download Results/ })
    await user.click(downloadButton)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('secret-santa-'))
    expect(mockLink.click).toHaveBeenCalled()

    createElementSpy.mockRestore()
  })

  it('should call onReset when Generate New Pairs is clicked', async () => {
    const user = userEvent.setup()
    render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    const resetButton = screen.getByRole('button', { name: /Generate New Pairs/ })
    await user.click(resetButton)

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('should show pairs with enhanced styling and numbering', () => {
    const { container } = render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    expect(screen.getByText('Secret Santa Assignments')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
    
    // Should show arrow indicators (ArrowRight icons)
    const arrowIcons = container.querySelectorAll('svg')
    expect(arrowIcons.length).toBeGreaterThan(0) // Should have arrow icons
  })

  it('should show email delivery badges for each pair', () => {
    render(<ResultsDisplay results={partialEmailResults} onReset={mockOnReset} />)

    // Should show delivery status badges for participants
    expect(screen.getAllByText('DELIVERED').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0)
  })

  it('should not show email sections when emails are disabled', () => {
    const disabledEmailResults: SecretSantaResponse = {
      ...successResults,
      emailStatus: 'DISABLED',
      emailResults: {}
    }

    render(<ResultsDisplay results={disabledEmailResults} onReset={mockOnReset} />)

    expect(screen.queryByText('Email Status:')).not.toBeInTheDocument()
    expect(screen.queryByText('Email Delivery Status')).not.toBeInTheDocument()
  })

  it('should format timestamp correctly', () => {
    render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    // Should format the timestamp (exact format depends on locale)
    expect(screen.getByText(/Generated at.*2024/)).toBeInTheDocument()
  })

  it('should have success celebration class when celebrating', async () => {
    const { container } = render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    await waitFor(() => {
      const successCard = container.querySelector('.success-celebration')
      expect(successCard).toBeInTheDocument()
    })
  })

  it('should handle clipboard copy failure gracefully', async () => {
    const user = userEvent.setup()

    // Mock clipboard to reject
    clipboardWriteTextMock.mockRejectedValueOnce(new Error('Clipboard error'))

    render(<ResultsDisplay results={successResults} onReset={mockOnReset} />)

    expect(typeof navigator.clipboard?.writeText).toBe('function')
    ;(navigator.clipboard as Clipboard).writeText = clipboardWriteTextMock

    const copyButton = screen.getByRole('button', { name: /Copy Pairs/ })
    await user.click(copyButton)

    // Should handle the error gracefully (toast should be called with error)
    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalled()
    })
  })
})
