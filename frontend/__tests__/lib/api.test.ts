import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { SecretSantaRequest, SecretSantaResponse } from '../../lib/types'

// Create a mock axios instance
const mockAxiosInstance = {
  post: vi.fn(),
}

// Mock axios completely
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(),
  },
}))

const mockedAxios = vi.mocked(axios)

describe('secretSantaApi', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Ensure axios.create returns our mock
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePairs', () => {
    it('should successfully generate pairs', async () => {
      // Dynamic import after mocks are set up
      const { secretSantaApi } = await import('../../lib/api')
      
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

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await secretSantaApi.generatePairs(mockRequest)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/generatePairs', mockRequest)
      expect(result).toEqual(mockResponse)
    })

    it('should handle axios error with custom message', async () => {
      const { secretSantaApi } = await import('../../lib/api')
      
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

      mockAxiosInstance.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Not enough participants for Secret Santa')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/generatePairs', mockRequest)
    })

    it('should handle axios error without custom message', async () => {
      const { secretSantaApi } = await import('../../lib/api')
      
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com'],
        emailSendingEnabled: false
      }

      const mockError = {
        isAxiosError: true,
        message: 'Network Error'
      }

      mockAxiosInstance.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Network Error')
    })

    it('should handle axios error with fallback message', async () => {
      const { secretSantaApi } = await import('../../lib/api')
      
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

      mockAxiosInstance.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Failed to generate Secret Santa pairs')
    })

    it('should handle non-axios errors', async () => {
      const { secretSantaApi } = await import('../../lib/api')
      
      const mockRequest: SecretSantaRequest = {
        emails: ['john@example.com', 'jane@example.com'],
        emailSendingEnabled: false
      }

      const mockError = new Error('Unexpected error')

      mockAxiosInstance.post.mockRejectedValueOnce(mockError)
      mockedAxios.isAxiosError.mockReturnValueOnce(false)

      await expect(secretSantaApi.generatePairs(mockRequest))
        .rejects
        .toThrow('Unexpected error')
    })

    it('should handle request with all optional parameters', async () => {
      const { secretSantaApi } = await import('../../lib/api')
      
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

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await secretSantaApi.generatePairs(mockRequest)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/generatePairs', mockRequest)
      expect(result).toEqual(mockResponse)
    })

  })
})