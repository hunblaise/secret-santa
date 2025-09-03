import axios from 'axios'
import { SecretSantaRequest, SecretSantaResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const secretSantaApi = {
  async generatePairs(request: SecretSantaRequest): Promise<SecretSantaResponse> {
    try {
      const response = await api.post<SecretSantaResponse>('/generatePairs', request)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || 'Failed to generate Secret Santa pairs'
        throw new Error(message)
      }
      throw new Error('An unexpected error occurred')
    }
  },
}