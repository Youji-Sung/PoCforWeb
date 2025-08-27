import React, { useRef, useEffect, useCallback } from 'react'
import { WebGLRenderer } from '../webgl/WebGLRenderer'
import { useImageStore } from '../store/imageStore'
import { generateTestBuffer } from '../utils/bufferGenerator'

const ImageRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const animationRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)
  const frameCount = useRef<number>(0)
  const fpsUpdateTime = useRef<number>(0)

  const {
    bufferSize,
    imageBuffer,
    setImageBuffer,
    updatePerformanceMetrics,
    updateRenderStats,
    setIsRendering,
    isGeneratingBuffer,
    vsyncEnabled
  } = useImageStore()

  const updateBuffer = useCallback(async () => {
    if (!rendererRef.current || isGeneratingBuffer) return

    const [width, height] = bufferSize.split('x').map(Number)
    
    // Calculate quad count based on resolution
    // 1000x1000 = 4 quads (2x2), 2000x2000 = 16 quads (4x4), 4000x4000 = 64 quads (8x8)
    const quadCount = bufferSize === '1000x1000' ? 4 : 
                      bufferSize === '2000x2000' ? 16 : 64
    
    const startTime = performance.now()
    const buffer = generateTestBuffer(width, height)
    const bufferUpdateTime = performance.now() - startTime

    setImageBuffer(buffer)
    rendererRef.current.updateTexture(buffer)
    rendererRef.current.updateGeometry(quadCount)
    
    // Update render stats with new quad count
    const stats = rendererRef.current.getRenderStats()
    updateRenderStats({
      triangles: stats.triangles,
      drawCalls: stats.drawCalls
    })
    
    updatePerformanceMetrics({ bufferUpdateTime })
  }, [bufferSize, setImageBuffer, updatePerformanceMetrics, updateRenderStats, isGeneratingBuffer])

  const animateVSync = useCallback((currentTime: number) => {
    if (!rendererRef.current) return

    const frameStartTime = performance.now()
    const deltaTime = currentTime - lastFrameTime.current
    lastFrameTime.current = currentTime
    frameCount.current++

    // Update FPS more frequently for better accuracy
    if (currentTime - fpsUpdateTime.current >= 100) {
      const actualTimeDiff = currentTime - fpsUpdateTime.current
      const fps = (frameCount.current * 1000) / actualTimeDiff
      
      updatePerformanceMetrics({
        fps: parseFloat(fps.toFixed(1)),
        frameTime: parseFloat(deltaTime.toFixed(2)),
        totalFrames: frameCount.current
      })
      
      frameCount.current = 0
      fpsUpdateTime.current = currentTime
    }

    const renderStart = performance.now()
    
    const time = currentTime * 0.001
    const brightness = Math.sin(time) * 0.1
    const contrast = 1.0 + Math.sin(time * 0.5) * 0.2
    const gamma = 1.0 + Math.sin(time * 0.3) * 0.3
    
    rendererRef.current.render(brightness, contrast, gamma, time)
    
    const renderTime = performance.now() - renderStart
    const totalFrameTime = performance.now() - frameStartTime
    
    updatePerformanceMetrics({ 
      renderTime: parseFloat(renderTime.toFixed(3)),
      frameTime: parseFloat(totalFrameTime.toFixed(3))
    })

    animationRef.current = requestAnimationFrame(animateVSync)
  }, [updatePerformanceMetrics])

  const animateRaw = useCallback(() => {
    if (!rendererRef.current) return

    const currentTime = performance.now()
    const frameStartTime = currentTime
    const deltaTime = currentTime - lastFrameTime.current
    lastFrameTime.current = currentTime
    frameCount.current++

    // Update FPS every 50ms for more responsive raw FPS display
    if (currentTime - fpsUpdateTime.current >= 50) {
      const actualTimeDiff = currentTime - fpsUpdateTime.current
      const fps = (frameCount.current * 1000) / actualTimeDiff
      
      updatePerformanceMetrics({
        fps: parseFloat(fps.toFixed(1)),
        frameTime: parseFloat(deltaTime.toFixed(2)),
        totalFrames: frameCount.current
      })
      
      frameCount.current = 0
      fpsUpdateTime.current = currentTime
    }

    const renderStart = performance.now()
    
    const time = currentTime * 0.001
    const brightness = Math.sin(time) * 0.1
    const contrast = 1.0 + Math.sin(time * 0.5) * 0.2
    const gamma = 1.0 + Math.sin(time * 0.3) * 0.3
    
    rendererRef.current.render(brightness, contrast, gamma, time)
    
    const renderTime = performance.now() - renderStart
    const totalFrameTime = performance.now() - frameStartTime
    
    updatePerformanceMetrics({ 
      renderTime: parseFloat(renderTime.toFixed(3)),
      frameTime: parseFloat(totalFrameTime.toFixed(3))
    })

    // Use setTimeout(0) for unlimited FPS (no V-Sync)
    animationRef.current = setTimeout(animateRaw, 0) as any
  }, [updatePerformanceMetrics])

  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      if (vsyncEnabled) {
        cancelAnimationFrame(animationRef.current)
      } else {
        clearTimeout(animationRef.current)
      }
    }
    
    setIsRendering(true)
    lastFrameTime.current = performance.now()
    fpsUpdateTime.current = performance.now()
    frameCount.current = 0
    
    if (vsyncEnabled) {
      animationRef.current = requestAnimationFrame(animateVSync)
    } else {
      animateRaw() // Start raw FPS mode immediately
    }
  }, [animateVSync, animateRaw, vsyncEnabled, setIsRendering])

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      if (vsyncEnabled) {
        cancelAnimationFrame(animationRef.current)
      } else {
        clearTimeout(animationRef.current)
      }
      animationRef.current = undefined
    }
    setIsRendering(false)
  }, [vsyncEnabled, setIsRendering])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      rendererRef.current = new WebGLRenderer(canvas)
      
      const resizeCanvas = () => {
        const container = canvas.parentElement
        if (!container || !rendererRef.current) return

        const containerRect = container.getBoundingClientRect()
        const size = Math.min(containerRect.width - 40, containerRect.height - 40)
        
        canvas.width = size
        canvas.height = size
        canvas.style.width = `${size}px`
        canvas.style.height = `${size}px`
        
        rendererRef.current.resize(size, size)
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      updateBuffer()
      startAnimation()

      return () => {
        window.removeEventListener('resize', resizeCanvas)
        stopAnimation()
        if (rendererRef.current) {
          rendererRef.current.dispose()
          rendererRef.current = null
        }
      }
    } catch (error) {
      console.error('Failed to initialize WebGL renderer:', error)
    }
  }, [updateBuffer, startAnimation, stopAnimation])

  useEffect(() => {
    updateBuffer()
  }, [bufferSize, updateBuffer])

  useEffect(() => {
    // Restart animation when V-Sync mode changes
    if (rendererRef.current) {
      stopAnimation()
      startAnimation()
    }
  }, [vsyncEnabled, startAnimation, stopAnimation])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="webgl-canvas"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

export default ImageRenderer