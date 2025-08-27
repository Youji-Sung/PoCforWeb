import React from 'react'
import ImageRenderer from './components/ImageRenderer'
import PerformanceMonitor from './components/PerformanceMonitor'
import { useImageStore } from './store/imageStore'

const App: React.FC = () => {
  const { bufferSize, setBufferSize, isRendering, vsyncEnabled, setVSyncEnabled } = useImageStore()

  return (
    <div className="app">
      <div className="controls">
        <div className="control-group">
          <label htmlFor="buffer-size">Buffer Size:</label>
          <select
            id="buffer-size"
            value={bufferSize}
            onChange={(e) => setBufferSize(e.target.value as '1000x1000' | '2000x2000' | '4000x4000')}
            disabled={false}
          >
            <option value="1000x1000">1000 x 1000</option>
            <option value="2000x2000">2000 x 2000</option>
            <option value="4000x4000">4000 x 4000</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="vsync-toggle">V-Sync:</label>
          <button
            id="vsync-toggle"
            onClick={() => setVSyncEnabled(!vsyncEnabled)}
            style={{
              backgroundColor: vsyncEnabled ? '#4ade80' : '#ef4444',
              color: 'white',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {vsyncEnabled ? 'ON (60 FPS)' : 'OFF (RAW)'}
          </button>
        </div>
        
        <PerformanceMonitor />
      </div>
      
      <div className="canvas-container">
        <ImageRenderer />
      </div>
    </div>
  )
}

export default App