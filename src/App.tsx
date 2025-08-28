import React from 'react'
import ImageRenderer from './components/ImageRenderer'
import PerformanceMonitor from './components/PerformanceMonitor'
import PlaybackControls from './components/PlaybackControls'
import { useImageStore } from './store/imageStore'

const App: React.FC = () => {
  const { vsyncEnabled, setVSyncEnabled } = useImageStore()

  return (
    <div className="app">
      <div className="controls">
        <PlaybackControls />
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
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
      </div>
      
      <div className="canvas-container">
        <ImageRenderer />
      </div>
    </div>
  )
}

export default App