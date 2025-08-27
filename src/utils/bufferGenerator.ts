import { ImageBuffer } from '../types'

export function generateTestBuffer(width: number, height: number): ImageBuffer {
  const channels = 4 // RGBA
  const data = new Uint8Array(width * height * channels)
  
  const time = Date.now() * 0.001
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels
      
      // Create a dynamic pattern that changes over time
      const normalizedX = x / width
      const normalizedY = y / height
      
      // Animated wave patterns
      const wave1 = Math.sin(normalizedX * 20 + time * 2) * 0.5 + 0.5
      const wave2 = Math.sin(normalizedY * 15 + time * 1.5) * 0.5 + 0.5
      const wave3 = Math.sin((normalizedX + normalizedY) * 10 + time) * 0.5 + 0.5
      
      // Radial gradient from center
      const centerX = normalizedX - 0.5
      const centerY = normalizedY - 0.5
      const distance = Math.sqrt(centerX * centerX + centerY * centerY)
      const radial = Math.cos(distance * 10 + time * 3) * 0.5 + 0.5
      
      // Combine patterns
      const r = Math.floor((wave1 * radial) * 255)
      const g = Math.floor((wave2 * radial) * 255)
      const b = Math.floor((wave3 * radial) * 255)
      const a = 255
      
      data[index] = r     // Red
      data[index + 1] = g // Green
      data[index + 2] = b // Blue
      data[index + 3] = a // Alpha
    }
  }
  
  return {
    data,
    width,
    height,
    channels
  }
}

export function generateMedicalTestBuffer(width: number, height: number): ImageBuffer {
  const channels = 1 // Grayscale for medical imaging
  const data = new Uint8Array(width * height * channels)
  
  // Simulate medical image data patterns
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(centerX, centerY)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const normalizedDistance = distance / maxRadius
      
      let intensity = 0
      
      if (normalizedDistance < 0.8) {
        // Simulate organ structure with varying densities
        const angle = Math.atan2(dy, dx)
        const radialPattern = Math.sin(normalizedDistance * 8) * 0.3 + 0.7
        const angularPattern = Math.sin(angle * 6) * 0.2 + 0.8
        
        // Add some noise for realistic texture
        const noise = (Math.random() - 0.5) * 0.1
        
        intensity = (radialPattern * angularPattern + noise) * (1 - normalizedDistance * 0.3)
      } else {
        // Background with some noise
        intensity = Math.random() * 0.1
      }
      
      data[index] = Math.floor(Math.max(0, Math.min(255, intensity * 255)))
    }
  }
  
  return {
    data,
    width,
    height,
    channels
  }
}