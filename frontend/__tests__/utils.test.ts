import { describe, it, expect } from 'vitest'
import { parseEmails, validateEmail, cn } from '../lib/utils'

describe('parseEmails', () => {
  it('parses valid email list', () => {
    const input = 'john@example.com\njane@example.com\nbob@example.com'
    const result = parseEmails(input)
    
    expect(result).toEqual([
      'john@example.com',
      'jane@example.com', 
      'bob@example.com'
    ])
  })

  it('filters out empty lines and invalid emails', () => {
    const input = 'john@example.com\n\ninvalid-email\njane@example.com\n   \nuser@domain\nuser..name@domain.com'
    const result = parseEmails(input)
    
    expect(result).toEqual([
      'john@example.com',
      'jane@example.com'
    ])
  })

  it('handles empty input', () => {
    const result = parseEmails('')
    expect(result).toEqual([])
  })
})

describe('validateEmail', () => {
  it('validates correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('user+tag@example.org')).toBe(true)
    expect(validateEmail('user_123@sub.domain.com')).toBe(true)
    expect(validateEmail('firstName.lastName@company.co')).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user..name@domain.com')).toBe(false)
    expect(validateEmail('user@domain')).toBe(false)
    expect(validateEmail('user name@domain.com')).toBe(false)
    expect(validateEmail('user@domain..com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })

  it('handles edge cases properly', () => {
    expect(validateEmail('user@domain.c')).toBe(false)
    expect(validateEmail('user@.domain.com')).toBe(false)
    expect(validateEmail('user@domain.com.')).toBe(false)
    expect(validateEmail('user@domain..com')).toBe(false)
  })
})

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('base-class', 'additional-class')
    expect(result).toContain('base-class')
    expect(result).toContain('additional-class')
  })

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toContain('base')
    expect(result).toContain('conditional')
    expect(result).not.toContain('hidden')
  })
})