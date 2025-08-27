export interface PerformanceMetrics {
  fps: number
  frameTime: number
  renderTime: number
  bufferUpdateTime: number
  totalFrames: number
}

export interface ImageBuffer {
  data: Uint8Array
  width: number
  height: number
  channels: number
}

export type BufferSize = '1000x1000' | '2000x2000' | '4000x4000'

export interface RenderStats {
  triangles: number
  drawCalls: number
  textureMemory: number
}