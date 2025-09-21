import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../../app/page'

// Mock the API service
vi.mock('../../lib/api', () => ({
  secretSantaApi: {
    generatePairs: vi.fn()
  }
}))

// Mock the toast hook
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('Christmas Theme and Animations', () => {
  describe('Hero Section', () => {
    it('should render hero section with Christmas theme', () => {
      render(<Home />)

      expect(screen.getByText('Secret Santa Generator')).toBeInTheDocument()
      expect(screen.getByText('Create magical gift exchanges with advanced pairing options')).toBeInTheDocument()
    })

    it('should have hero background gradient', () => {
      const { container } = render(<Home />)

      const heroBackground = container.querySelector('.bg-hero-gradient')
      expect(heroBackground).toBeInTheDocument()
    })

    it('should render animated gift icon', () => {
      const { container } = render(<Home />)

      const animatedGift = container.querySelector('.animate-bounce-gift')
      expect(animatedGift).toBeInTheDocument()
    })

    it('should show trust indicators with checkmarks', () => {
      render(<Home />)

      expect(screen.getByText('No registration')).toBeInTheDocument()
      expect(screen.getByText('Free forever')).toBeInTheDocument()
      expect(screen.getByText('Email delivery')).toBeInTheDocument()
      expect(screen.getByText('100% private')).toBeInTheDocument()

      // Should have checkmark indicators
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks).toHaveLength(4)
    })

    it('should have decorative separator line', () => {
      const { container } = render(<Home />)

      const separator = container.querySelector('.bg-gradient-to-r')
      expect(separator).toBeInTheDocument()
    })

    it('should be responsive with proper text sizing', () => {
      const { container } = render(<Home />)

      const title = container.querySelector('.text-5xl.md\\:text-6xl')
      expect(title).toBeInTheDocument()

      const subtitle = container.querySelector('.text-xl.md\\:text-2xl')
      expect(subtitle).toBeInTheDocument()
    })
  })

  describe('Snowfall Animation', () => {
    it('should render snowfall animation', () => {
      const { container } = render(<Home />)

      // Should have snowflake elements (15 snowflakes)
      const snowflakes = container.querySelectorAll('.animate-snowfall')
      expect(snowflakes).toHaveLength(15)
    })

    it('should have snowflakes with staggered delays', () => {
      const { container } = render(<Home />)

      const snowflakes = container.querySelectorAll('.snowflake')
      expect(snowflakes).toHaveLength(15)

      // Check that snowflakes have different animation delays
      const delays = Array.from(snowflakes).map(snowflake => 
        (snowflake as HTMLElement).style.animationDelay
      )
      
      // Should have different delays
      const uniqueDelays = new Set(delays)
      expect(uniqueDelays.size).toBeGreaterThan(1)
    })

    it('should be positioned fixed and non-interactive', () => {
      const { container } = render(<Home />)

      const snowfallContainer = container.querySelector('.fixed.inset-0.pointer-events-none')
      expect(snowfallContainer).toBeInTheDocument()
    })

    it('should have correct z-index layering', () => {
      const { container } = render(<Home />)

      const snowfallContainer = container.querySelector('.z-0')
      const mainContent = container.querySelector('.z-10')
      
      expect(snowfallContainer).toBeInTheDocument()
      expect(mainContent).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should have full height background container', () => {
      const { container } = render(<Home />)

      const backgroundContainer = container.querySelector('.min-h-screen.bg-hero-gradient')
      expect(backgroundContainer).toBeInTheDocument()
    })

    it('should have proper overflow handling', () => {
      const { container } = render(<Home />)

      const overflowContainer = container.querySelector('.overflow-hidden')
      expect(overflowContainer).toBeInTheDocument()
    })

    it('should center content in hero section', () => {
      const { container } = render(<Home />)

      const centeredContent = container.querySelector('.flex.items-center.justify-center')
      expect(centeredContent).toBeInTheDocument()
    })

    it('should have proper container max-width', () => {
      const { container } = render(<Home />)

      const maxWidthContainer = container.querySelector('.max-w-4xl')
      expect(maxWidthContainer).toBeInTheDocument()
    })
  })

  describe('Christmas Color Scheme', () => {
    it('should use Christmas red for primary elements', () => {
      const { container } = render(<Home />)

      // Gift icon should use primary color (Christmas red)
      const giftIcon = container.querySelector('.text-primary')
      expect(giftIcon).toBeInTheDocument()
    })

    it('should use secondary color for trust indicators', () => {
      const { container } = render(<Home />)

      // Trust indicator checkmarks should use secondary color
      const secondaryElements = container.querySelectorAll('.text-secondary')
      expect(secondaryElements.length).toBeGreaterThan(0)
    })

    it('should have proper background styling for gift icon', () => {
      const { container } = render(<Home />)

      const giftBackground = container.querySelector('.bg-primary\\/10')
      expect(giftBackground).toBeInTheDocument()
    })
  })

  describe('Responsive Trust Indicators', () => {
    it('should have responsive grid for trust indicators', () => {
      const { container } = render(<Home />)

      const trustGrid = container.querySelector('.grid.grid-cols-2.md\\:grid-cols-4')
      expect(trustGrid).toBeInTheDocument()
    })

    it('should have proper spacing and styling', () => {
      const { container } = render(<Home />)

      const trustItems = container.querySelectorAll('.flex.flex-col.items-center.gap-2')
      expect(trustItems.length).toBe(4)
    })

    it('should have circular backgrounds for checkmarks', () => {
      const { container } = render(<Home />)

      const checkmarkBackgrounds = container.querySelectorAll('.bg-secondary\\/20.rounded-full')
      expect(checkmarkBackgrounds.length).toBe(4)
    })
  })

  describe('Animation Classes', () => {
    it('should have bounce animation class available', () => {
      const { container } = render(<Home />)

      // Check that bounce-gift animation class is applied
      const animatedElement = container.querySelector('.animate-bounce-gift')
      expect(animatedElement).toBeInTheDocument()
    })

    it('should have snowfall animation classes', () => {
      const { container } = render(<Home />)

      const snowfallElements = container.querySelectorAll('.animate-snowfall')
      expect(snowfallElements.length).toBe(15)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Home />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Secret Santa Generator')
    })

    it('should have proper alt text for decorative elements', () => {
      // Snowflakes and other decorative elements should not interfere with screen readers
      // They use CSS content or are marked as decorative
      const { container } = render(<Home />)

      const decorativeElements = container.querySelectorAll('.pointer-events-none')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })

    it('should maintain focus order with animations', () => {
      render(<Home />)

      // Main interactive elements should be focusable
      const interactiveElements = screen.getAllByRole('button')
      expect(interactiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Considerations', () => {
    it('should use CSS animations rather than JavaScript', () => {
      const { container } = render(<Home />)

      // Animations should be CSS-based (class names, not inline styles for animation)
      const cssAnimatedElements = container.querySelectorAll('[class*="animate-"]')
      expect(cssAnimatedElements.length).toBeGreaterThan(0)
    })

    it('should not create excessive DOM elements for animations', () => {
      const { container } = render(<Home />)

      // Should have reasonable number of snowflakes (15, not hundreds)
      const animationElements = container.querySelectorAll('.animate-snowfall')
      expect(animationElements.length).toBe(15)
    })
  })
})