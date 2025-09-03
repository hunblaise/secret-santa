import axios from 'axios'
import { SecretSantaRequest, SecretSantaResponse, ApiErrorResponse, ApiError } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Validates and extracts error message from API error response
 */
function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const response = error.response
    const data = response?.data as ApiErrorResponse
    
    // Extract error message with fallback chain
    const message = 
      data?.message || 
      data?.error || 
      data?.details || 
      error.message || 
      'Failed to generate Secret Santa pairs'
    
    return {
      message,
      status: response?.status,
      code: response?.status ? `HTTP_${response.status}` : 'NETWORK_ERROR'
    }
  }
  
  // Handle non-axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    }
  }
  
  // Handle completely unknown errors
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  }
}

export const secretSantaApi = {
  async generatePairs(request: SecretSantaRequest): Promise<SecretSantaResponse> {
    try {
      const response = await api.post<SecretSantaResponse>('/generatePairs', request)
      return response.data
    } catch (error) {
      const apiError = parseApiError(error)
      const enhancedError = new Error(apiError.message) as Error & { code?: string; status?: number }
      enhancedError.code = apiError.code
      enhancedError.status = apiError.status
      throw enhancedError
    }
  },
}