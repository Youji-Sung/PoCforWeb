import React from 'react'
import { useImageStore } from '../store/imageStore'
import { imageApiService } from '../services/imageApiService'

const PlaybackControls: React.FC = () => {
  const { 
    playbackState, 
    currentFrame, 
    bufferSize,
    setPlaybackState, 
    setCurrentFrame,
    setBufferSize
  } = useImageStore()

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Play button clicked')
    try {
      const result = await imageApiService.play()
      console.log('Play result:', result)
      setPlaybackState('playing')
    } catch (error) {
      console.error('Failed to start playback:', error)
    }
  }

  const handlePause = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Pause button clicked')
    try {
      const result = await imageApiService.pause()
      console.log('Pause result:', result)
      setPlaybackState('paused')
    } catch (error) {
      console.error('Failed to pause playback:', error)
    }
  }

  const handleStop = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Stop button clicked')
    try {
      const result = await imageApiService.stop()
      console.log('Stop result:', result)
      setPlaybackState('stopped')
      setCurrentFrame(0)
    } catch (error) {
      console.error('Failed to stop playback:', error)
    }
  }

  const handleResolutionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = event.target.value as '1000x1000' | '2000x2000'
    setBufferSize(newSize)
  }

  const buttonStyle = {
    padding: '12px 24px',
    margin: '0 8px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 1000,
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
  }

  const playButtonStyle = {
    ...buttonStyle,
    backgroundColor: playbackState === 'playing' ? '#4CAF50' : '#45a049',
    color: 'white',
    opacity: playbackState === 'playing' ? 0.7 : 1,
  }

  const pauseButtonStyle = {
    ...buttonStyle,
    backgroundColor: playbackState === 'paused' ? '#FF9800' : '#f57c00',
    color: 'white',
    opacity: playbackState !== 'playing' ? 0.7 : 1,
  }

  const stopButtonStyle = {
    ...buttonStyle,
    backgroundColor: playbackState === 'stopped' ? '#f44336' : '#d32f2f',
    color: 'white',
    opacity: playbackState === 'stopped' ? 0.7 : 1,
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Resolution:</label>
        <select 
          value={bufferSize} 
          onChange={handleResolutionChange}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white'
          }}
        >
          <option value="1000x1000">1000 × 1000 (32-bit BGRA)</option>
          <option value="2000x2000">2000 × 2000 (32-bit BGRA)</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handlePlay} 
          disabled={playbackState === 'playing'}
          style={playButtonStyle}
        >
          ▶ Play
        </button>
        <button 
          onClick={handlePause} 
          disabled={playbackState !== 'playing'}
          style={pauseButtonStyle}
        >
          ⏸ Pause
        </button>
        <button 
          onClick={handleStop} 
          disabled={playbackState === 'stopped'}
          style={stopButtonStyle}
        >
          ⏹ Stop
        </button>
      </div>

      <div style={{ fontSize: '14px', color: '#666' }}>
        <span style={{ marginRight: '20px' }}>Status: <strong>{playbackState.toUpperCase()}</strong></span>
        <span>Frame: <strong>{currentFrame}</strong></span>
      </div>
    </div>
  )
}

export default PlaybackControls