import axios from 'axios'
import { ImageBuffer } from '../types'

const API_BASE_URL = 'http://localhost:5175/api'

export interface ImageBufferRequest {
  width: number
  height: number
  imageType: string
  channels: number
}

export interface ImageBufferResponse {
  data: string // Base64 encoded byte array from backend
  width: number
  height: number
  channels: number
  format: string
  generationTimeMs: number
}

export interface PerformanceMetrics {
  generationTimeMs: number
  memoryUsedBytes: number
  bufferSizeBytes: number
}

class ImageApiService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  async generateTestImage(size: string): Promise<ImageBuffer> {
    try {
      const response = await this.apiClient.get<ImageBufferResponse>(`/image/test/${size}`)
      return this.convertToImageBuffer(response.data)
    } catch (error) {
      console.error('Failed to generate test image:', error)
      throw new Error('Failed to generate test image from backend')
    }
  }

  async generateMedicalImage(size: string): Promise<ImageBuffer> {
    try {
      const response = await this.apiClient.get<ImageBufferResponse>(`/image/medical/${size}`)
      return this.convertToImageBuffer(response.data)
    } catch (error) {
      console.error('Failed to generate medical image:', error)
      throw new Error('Failed to generate medical image from backend')
    }
  }

  async generateCustomImage(request: ImageBufferRequest): Promise<ImageBuffer> {
    try {
      const response = await this.apiClient.post<ImageBufferResponse>('/image/generate', request)
      return this.convertToImageBuffer(response.data)
    } catch (error) {
      console.error('Failed to generate custom image:', error)
      throw new Error('Failed to generate custom image from backend')
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await this.apiClient.get<PerformanceMetrics>('/image/performance')
      return response.data
    } catch (error) {
      console.error('Failed to get performance metrics:', error)
      throw new Error('Failed to get performance metrics from backend')
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    try {
      const response = await this.apiClient.get('/image/health')
      return response.data
    } catch (error) {
      console.error('Backend health check failed:', error)
      throw new Error('Backend health check failed')
    }
  }

  async play(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.apiClient.post('/image/play')
      return response.data
    } catch (error) {
      console.error('Failed to start playback:', error)
      throw new Error('Failed to start playback')
    }
  }

  async pause(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.apiClient.post('/image/pause')
      return response.data
    } catch (error) {
      console.error('Failed to pause playback:', error)
      throw new Error('Failed to pause playback')
    }
  }

  async stop(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.apiClient.post('/image/stop')
      return response.data
    } catch (error) {
      console.error('Failed to stop playback:', error)
      throw new Error('Failed to stop playback')
    }
  }

  async getStatus(): Promise<{ status: string; frameCounter: number; timestamp: string }> {
    try {
      const response = await this.apiClient.get('/image/status')
      return response.data
    } catch (error) {
      console.error('Failed to get playback status:', error)
      throw new Error('Failed to get playback status')
    }
  }

  private convertToImageBuffer(response: ImageBufferResponse): ImageBuffer {
    // Decode base64 string to Uint8Array
    const binaryString = atob(response.data)
    const data = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      data[i] = binaryString.charCodeAt(i)
    }
    
    // Debug: Log first few pixels to verify BGRA pattern
    if (data.length >= 16) {
      console.log('First 4 pixels (BGRA):', 
        Array.from(data.slice(0, 16))
          .reduce((acc, val, i) => {
            if (i % 4 === 0) acc.push([])
            acc[acc.length - 1].push(val)
            return acc
          }, [] as number[][])
      )
    }
    
    return {
      data,
      width: response.width,
      height: response.height,
      channels: response.channels
    }
  }
}

export const imageApiService = new ImageApiService()