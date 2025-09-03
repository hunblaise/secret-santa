import { describe, it, expect } from 'vitest'
import { parseEmails, buildSecretSantaRequest, validateEmail, formatTimestamp } from '../../lib/utils'
import { FormData } from '../../lib/types'

describe('parseEmails', () => {
  it('should parse valid emails from text', () => {
    const emailText = `john@example.com
    jane@example.com
    bob@example.com`
    
    const result = parseEmails(emailText)
    
    expect(result).toEqual([
      'john@example.com',
      'jane@example.com',
      'bob@example.com'
    ])
  })

  it('should filter out invalid emails', () => {
    const emailText = `john@example.com
    invalid-email
    jane@example.com
    another-invalid`
    
    const result = parseEmails(emailText)
    
    expect(result).toEqual([
      'john@example.com',
      'jane@example.com'
    ])
  })

  it('should handle empty lines and whitespace', () => {
    const emailText = `  john@example.com  
    
    jane@example.com
    
      bob@example.com  `
    
    const result = parseEmails(emailText)
    
    expect(result).toEqual([
      'john@example.com',
      'jane@example.com',
      'bob@example.com'
    ])
  })

  it('should return empty array for empty input', () => {
    expect(parseEmails('')).toEqual([])
    expect(parseEmails('   ')).toEqual([])
    expect(parseEmails('\n\n')).toEqual([])
  })
})

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('john@example.com')).toBe(true)
    expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true)
    expect(validateEmail('user.name@domain-name.com')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('user@domain')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})

describe('buildSecretSantaRequest', () => {
  it('should build basic request with emails only', () => {
    const formData: FormData = {
      emailsText: 'john@example.com\njane@example.com\nbob@example.com',
      sendEmails: true,
      exclusions: [],
      forcedPairings: [],
      nameMappings: []
    }

    const result = buildSecretSantaRequest(formData)

    expect(result).toEqual({
      emails: ['john@example.com', 'jane@example.com', 'bob@example.com'],
      emailSendingEnabled: true,
      exclusions: undefined,
      mappings: undefined,
      cheats: undefined
    })
  })

  it('should build request with exclusions', () => {
    const formData: FormData = {
      emailsText: 'john@example.com\njane@example.com\nbob@example.com',
      sendEmails: false,
      exclusions: [
        { id: '1', from: 'john@example.com', to: 'jane@example.com' },
        { id: '2', from: 'john@example.com', to: 'bob@example.com' }
      ],
      forcedPairings: [],
      nameMappings: []
    }

    const result = buildSecretSantaRequest(formData)

    expect(result.exclusions).toEqual({
      'john@example.com': ['jane@example.com', 'bob@example.com']
    })
    expect(result.emailSendingEnabled).toBe(false)
  })

  it('should build request with forced pairings (cheats)', () => {
    const formData: FormData = {
      emailsText: 'john@example.com\njane@example.com\nbob@example.com',
      sendEmails: true,
      exclusions: [],
      forcedPairings: [
        { id: '1', from: 'john@example.com', to: 'jane@example.com' }
      ],
      nameMappings: []
    }

    const result = buildSecretSantaRequest(formData)

    expect(result.cheats).toEqual({
      'john@example.com': 'jane@example.com'
    })
  })

  it('should build request with name mappings', () => {
    const formData: FormData = {
      emailsText: 'john@example.com\njane@example.com',
      sendEmails: true,
      exclusions: [],
      forcedPairings: [],
      nameMappings: [
        { id: '1', email: 'john@example.com', name: 'John Doe' },
        { id: '2', email: 'jane@example.com', name: 'Jane Smith' }
      ]
    }

    const result = buildSecretSantaRequest(formData)

    expect(result.mappings).toEqual({
      'john@example.com': 'John Doe',
      'jane@example.com': 'Jane Smith'
    })
  })

  it('should ignore empty exclusions, pairings, and mappings', () => {
    const formData: FormData = {
      emailsText: 'john@example.com\njane@example.com',
      sendEmails: true,
      exclusions: [
        { id: '1', from: '', to: 'jane@example.com' }, // Missing from
        { id: '2', from: 'john@example.com', to: '' }  // Missing to
      ],
      forcedPairings: [
        { id: '1', from: '', to: '' } // Both missing
      ],
      nameMappings: [
        { id: '1', email: 'john@example.com', name: '' }, // Missing name
        { id: '2', email: '', name: 'Jane Smith' }         // Missing email
      ]
    }

    const result = buildSecretSantaRequest(formData)

    expect(result.exclusions).toBeUndefined()
    expect(result.cheats).toBeUndefined()
    expect(result.mappings).toBeUndefined()
  })
})

describe('formatTimestamp', () => {
  it('should format ISO timestamp to locale string', () => {
    const timestamp = '2024-12-25T10:30:00.000Z'
    const result = formatTimestamp(timestamp)
    
    // Just verify it's a string and contains expected parts
    expect(typeof result).toBe('string')
    expect(result).toContain('25') // Day
    expect(result).toContain('12') // Month or 12 (Dec)
  })

  it('should handle different timestamp formats', () => {
    const timestamp = '2024-01-01T00:00:00.000Z'
    const result = formatTimestamp(timestamp)
    
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})