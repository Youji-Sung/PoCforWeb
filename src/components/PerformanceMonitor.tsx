import React from 'react'
import { useImageStore } from '../store/imageStore'

const PerformanceMonitor: React.FC = () => {
  const { performanceMetrics, renderStats, bufferSize, vsyncEnabled } = useImageStore()

  const getFpsColor = (fps: number): string => {
    if (fps >= 50) return '#4ade80' // green
    if (fps >= 30) return '#22d3ee' // cyan 
    if (fps >= 20) return '#fbbf24' // yellow
    return '#ef4444' // red
  }

  const getPerformanceStatus = (bufferSize: string, fps: number): { status: string, color: string } => {
    if (bufferSize === '4000x4000') {
      if (fps >= 15) return { status: 'EXTREME TEST PASSED ✓', color: '#4ade80' }
      if (fps >= 10) return { status: 'Challenging ⚠', color: '#fbbf24' }
      return { status: 'GPU Stress Test ⚡', color: '#ef4444' }
    } else if (bufferSize === '2000x2000') {
      if (fps >= 30) return { status: 'TARGET ACHIEVED ✓', color: '#4ade80' }
      if (fps >= 25) return { status: 'Near Target ⚠', color: '#fbbf24' }
      return { status: 'Below Target ✗', color: '#ef4444' }
    } else {
      if (fps >= 50) return { status: 'Excellent ✓', color: '#4ade80' }
      if (fps >= 30) return { status: 'Good ✓', color: '#22d3ee' }
      return { status: 'Below Expected ⚠', color: '#fbbf24' }
    }
  }

  const formatMemory = (bytes: number): string => {
    return `${bytes.toFixed(1)} MB`
  }


  return (
    <>
      <div className="control-group">
        <span className="fps-display" style={{ color: getFpsColor(performanceMetrics.fps) }}>
          FPS: {performanceMetrics.fps.toFixed(1)}
        </span>
      </div>

      <div className="performance-stats">
        <div><strong>Performance Metrics</strong></div>
        <div>Buffer Size: {bufferSize} ({
          bufferSize === '1000x1000' ? '1M' : 
          bufferSize === '2000x2000' ? '4M' : '16M'
        } pixels)</div>
        <div>FPS: <span style={{ color: getFpsColor(performanceMetrics.fps) }}>
          {performanceMetrics.fps.toFixed(1)}
        </span> ({vsyncEnabled ? 'V-Sync ON' : 'RAW, No Cap'})</div>
        <div>Frame Time: {performanceMetrics.frameTime.toFixed(3)}ms</div>
        <div>Render Time: {performanceMetrics.renderTime.toFixed(3)}ms</div>
        <div>Buffer Update: {performanceMetrics.bufferUpdateTime.toFixed(2)}ms</div>
        <div>Total Frames: {performanceMetrics.totalFrames.toLocaleString()}</div>
        
        <div style={{ marginTop: '8px' }}><strong>Render Stats</strong></div>
        <div>Triangles: {renderStats.triangles} ({
          bufferSize === '1000x1000' ? '4 quads' :
          bufferSize === '2000x2000' ? '16 quads' : '64 quads'
        })</div>
        <div>Draw Calls: {renderStats.drawCalls} (batched)</div>
        <div>Texture Memory: {formatMemory(renderStats.textureMemory)}</div>
        
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
          <div>• Resolution change affects quad count:</div>
          <div>• 1000x1000: 4 quads (2x2 grid) = 8 triangles</div>
          <div>• 2000x2000: 16 quads (4x4 grid) = 32 triangles</div>
          <div>• 4000x4000: 64 quads (8x8 grid) = 128 triangles</div>
          <div>• Same texture, more geometry = GPU stress test!</div>
        </div>
        
        <div style={{ marginTop: '8px' }}>
          <strong style={{ color: getPerformanceStatus(bufferSize, performanceMetrics.fps).color }}>
            {getPerformanceStatus(bufferSize, performanceMetrics.fps).status}
          </strong>
        </div>
        
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#888' }}>
          {bufferSize === '4000x4000' ? 'Extreme Test: 15+ FPS' :
           bufferSize === '2000x2000' ? 'PoC Target: 30+ FPS' : 'Expected: 50+ FPS'}
        </div>
      </div>
    </>
  )
}

export default PerformanceMonitor