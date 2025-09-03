import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { secretSantaApi } from '../../lib/api'
import { SecretSantaRequest, SecretSantaResponse } from '../../lib/types'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('secretSantaApi', () => {
  beforeEach(() => {
    // Mock axios.create to return a mock axios instance
    mockedAxios.create.mockReturnValue(mockedAxios as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePairs', () => {
    it('should successfully generate pairs', async () => {
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com', 'bob@example.com'],
        emailSendingEnabled: false
      }

      const mockResponse: SecretSantaResponse = {
        pairs: [
          { from: 'john@example.com', to: 'jane@example.com' },
          { from: 'jane@example.com', to: 'bob@example.com' },
          { from: 'bob@example.com', to: 'john@example.com' }
        ],
        emailStatus: 'DISABLED',
        emailResults: {},
        errors: [],
        timestamp: '2024-12-25T10:00:00.000Z'
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await secretSantaApi.generatePairs(mockRequest)

      expect(mockedAxios.post).toHaveBeenCalledWith('/generatePairs', mockRequest)
      expect(result).toEqual(mockResponse)
    })

    it('should handle axios error with custom message', async () => {
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com'],
        emailSendingEnabled: false
      }

      const mockError = {
        isAxiosError: true,
        response: {
          data: {
            message: 'Not enough participants for Secret Santa'
          }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Not enough participants for Secret Santa')

      expect(mockedAxios.post).toHaveBeenCalledWith('/generatePairs', mockRequest)
    })

    it('should handle axios error without custom message', async () => {
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com'],
        emailSendingEnabled: false
      }

      const mockError = {
        isAxiosError: true,
        message: 'Network Error'
      }

      mockedAxios.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Network Error')
    })

    it('should handle axios error with fallback message', async () => {
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com'],
        emailSendingEnabled: false
      }

      const mockError = {
        isAxiosError: true,
        response: {
          data: {}
        }
      }

      mockedAxios.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Failed to generate Secret Santa pairs')
    })

    it('should handle non-axios errors', async () => {
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com'],
        emailSendingEnabled: false
      }

      const mockError = new Error('Unexpected error')

      mockedAxios.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(false)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('An unexpected error occurred')
    })

    it('should handle request with all optional parameters', async () => {
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com', 'bob@example.com'],
        emailSendingEnabled: true,
        exclusions: {
          'john@example.com': ['jane@example.com']
        },
        mappings: {
          'john@example.com': 'John Doe'
        },
        cheats: {
          'jane@example.com': 'bob@example.com'
        }
      }

      const mockResponse: SecretSantaResponse = {
        pairs: [
          { from: 'john@example.com', to: 'bob@example.com' },
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
        timestamp: '2024-12-25T10:00:00.000Z'
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await secretSantaApi.generatePairs(mockRequest)

      expect(mockedAxios.post).toHaveBeenCalledWith('/generatePairs', mockRequest)
      expect(result).toEqual(mockResponse)
    })

    it('should use correct API configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })
})