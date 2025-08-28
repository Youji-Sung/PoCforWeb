import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { PerformanceMetrics, ImageBuffer, BufferSize, RenderStats } from '../types'

type PlaybackState = 'stopped' | 'playing' | 'paused'

interface ImageStore {
  bufferSize: BufferSize
  imageBuffer: ImageBuffer | null
  performanceMetrics: PerformanceMetrics
  renderStats: RenderStats
  isRendering: boolean
  isGeneratingBuffer: boolean
  vsyncEnabled: boolean
  playbackState: PlaybackState
  currentFrame: number
  
  setBufferSize: (size: BufferSize) => void
  setImageBuffer: (buffer: ImageBuffer | null) => void
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void
  updateRenderStats: (stats: Partial<RenderStats>) => void
  setIsRendering: (rendering: boolean) => void
  setIsGeneratingBuffer: (generating: boolean) => void
  setVSyncEnabled: (enabled: boolean) => void
  setPlaybackState: (state: PlaybackState) => void
  setCurrentFrame: (frame: number) => void
  resetMetrics: () => void
}

const initialPerformanceMetrics: PerformanceMetrics = {
  fps: 0,
  frameTime: 0,
  renderTime: 0,
  bufferUpdateTime: 0,
  totalFrames: 0
}

const initialRenderStats: RenderStats = {
  triangles: 2,
  drawCalls: 1,
  textureMemory: 0
}

export const useImageStore = create<ImageStore>()(
  subscribeWithSelector((set, get) => ({
    bufferSize: '1000x1000',
    imageBuffer: null,
    performanceMetrics: initialPerformanceMetrics,
    renderStats: initialRenderStats,
    isRendering: false,
    isGeneratingBuffer: false,
    vsyncEnabled: false, // Default to raw FPS mode
    playbackState: 'stopped',
    currentFrame: 0,

    setBufferSize: (size) => {
      set({ bufferSize: size })
    },

    setImageBuffer: (buffer) => {
      const textureMemory = buffer 
        ? (buffer.width * buffer.height * buffer.channels) / (1024 * 1024)
        : 0
      
      set({ 
        imageBuffer: buffer,
        renderStats: { ...get().renderStats, textureMemory }
      })
    },

    updatePerformanceMetrics: (metrics) => {
      set((state) => ({
        performanceMetrics: { ...state.performanceMetrics, ...metrics }
      }))
    },

    updateRenderStats: (stats) => {
      set((state) => ({
        renderStats: { ...state.renderStats, ...stats }
      }))
    },

    setIsRendering: (rendering) => {
      set({ isRendering: rendering })
    },

    setIsGeneratingBuffer: (generating) => {
      set({ isGeneratingBuffer: generating })
    },

    setVSyncEnabled: (enabled) => {
      set({ vsyncEnabled: enabled })
    },

    setPlaybackState: (state) => {
      set({ playbackState: state })
    },

    setCurrentFrame: (frame) => {
      set({ currentFrame: frame })
    },

    resetMetrics: () => {
      set({
        performanceMetrics: initialPerformanceMetrics,
        renderStats: { ...initialRenderStats, textureMemory: get().renderStats.textureMemory }
      })
    }
  }))
)