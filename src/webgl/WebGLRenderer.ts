import { vertexShaderSource, fragmentShaderSource } from './shaders'
import { ImageBuffer } from '../types'

export class WebGLRenderer {
  private gl: WebGL2RenderingContext
  private program: WebGLProgram | null = null
  private vertexBuffer: WebGLBuffer | null = null
  private indexBuffer: WebGLBuffer | null = null
  private texture: WebGLTexture | null = null
  private vao: WebGLVertexArrayObject | null = null
  
  private uniforms: { [key: string]: WebGLUniformLocation | null } = {}
  private attributes: { [key: string]: number } = {}
  
  private currentQuadCount: number = 4 // Default for 1000x1000
  private indexCount: number = 6 * 4 // 6 indices per quad × 4 quads

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    })

    if (!gl) {
      throw new Error('WebGL2 not supported')
    }

    this.gl = gl
    this.initializeWebGL()
  }

  private initializeWebGL(): void {
    const gl = this.gl

    this.program = this.createShaderProgram()
    if (!this.program) {
      throw new Error('Failed to create shader program')
    }

    this.attributes.a_position = gl.getAttribLocation(this.program, 'a_position')
    this.attributes.a_texCoord = gl.getAttribLocation(this.program, 'a_texCoord')

    this.uniforms.u_texture = gl.getUniformLocation(this.program, 'u_texture')
    this.uniforms.u_brightness = gl.getUniformLocation(this.program, 'u_brightness')
    this.uniforms.u_contrast = gl.getUniformLocation(this.program, 'u_contrast')
    this.uniforms.u_gamma = gl.getUniformLocation(this.program, 'u_gamma')
    this.uniforms.u_time = gl.getUniformLocation(this.program, 'u_time')
    this.uniforms.u_resolution = gl.getUniformLocation(this.program, 'u_resolution')

    this.setupGeometry()
    this.setupTexture()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  private createShaderProgram(): WebGLProgram | null {
    const gl = this.gl
    
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    if (!vertexShader || !fragmentShader) return null

    const program = gl.createProgram()
    if (!program) return null

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking error:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }

    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    return program
  }

  private setupGeometry(): void {
    this.updateGeometry(4) // Start with 4 quads for 1000x1000
  }

  public updateGeometry(quadCount: number): void {
    const gl = this.gl
    this.currentQuadCount = quadCount
    this.indexCount = 6 * quadCount

    // Generate vertices for multiple quads arranged in a grid
    const gridSize = Math.sqrt(quadCount)
    const vertices: number[] = []
    const indices: number[] = []

    let vertexIndex = 0
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x1 = -1.0 + (col / gridSize) * 2.0
        const y1 = -1.0 + (row / gridSize) * 2.0
        const x2 = -1.0 + ((col + 1) / gridSize) * 2.0
        const y2 = -1.0 + ((row + 1) / gridSize) * 2.0

        // Quad vertices (position + texCoord)
        vertices.push(
          x1, y1, 0.0, 1.0, // bottom-left
          x2, y1, 1.0, 1.0, // bottom-right
          x2, y2, 1.0, 0.0, // top-right
          x1, y2, 0.0, 0.0  // top-left
        )

        // Quad indices
        const baseIndex = vertexIndex * 4
        indices.push(
          baseIndex, baseIndex + 1, baseIndex + 2,
          baseIndex + 2, baseIndex + 3, baseIndex
        )
        
        vertexIndex++
      }
    }

    const vertexArray = new Float32Array(vertices)
    const indexArray = new Uint16Array(indices)

    if (!this.vao) {
      this.vao = gl.createVertexArray()
    }
    
    gl.bindVertexArray(this.vao)

    if (!this.vertexBuffer) {
      this.vertexBuffer = gl.createBuffer()
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

    gl.enableVertexAttribArray(this.attributes.a_position)
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 16, 0)

    gl.enableVertexAttribArray(this.attributes.a_texCoord)
    gl.vertexAttribPointer(this.attributes.a_texCoord, 2, gl.FLOAT, false, 16, 8)

    if (!this.indexBuffer) {
      this.indexBuffer = gl.createBuffer()
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW)

    gl.bindVertexArray(null)
  }

  private setupTexture(): void {
    const gl = this.gl
    
    this.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  }

  public updateTexture(buffer: ImageBuffer): void {
    const gl = this.gl
    
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    
    const format = buffer.channels === 1 ? gl.RED : 
                   buffer.channels === 3 ? gl.RGB : gl.RGBA
    const internalFormat = buffer.channels === 1 ? gl.R8 :
                          buffer.channels === 3 ? gl.RGB8 : gl.RGBA8

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      buffer.width,
      buffer.height,
      0,
      format,
      gl.UNSIGNED_BYTE,
      buffer.data
    )
  }

  public render(brightness: number = 0.0, contrast: number = 1.0, gamma: number = 1.0, time: number = 0.0): void {
    const gl = this.gl
    
    if (!this.program || !this.vao) return

    gl.clear(gl.COLOR_BUFFER_BIT)
    
    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)
    
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniform1i(this.uniforms.u_texture, 0)
    
    gl.uniform1f(this.uniforms.u_brightness, brightness)
    gl.uniform1f(this.uniforms.u_contrast, contrast)
    gl.uniform1f(this.uniforms.u_gamma, gamma)
    gl.uniform1f(this.uniforms.u_time, time)
    gl.uniform2f(this.uniforms.u_resolution, gl.canvas.width, gl.canvas.height)
    
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0)
  }

  public resize(width: number, height: number): void {
    const gl = this.gl
    gl.viewport(0, 0, width, height)
  }

  public getRenderStats(): { triangles: number, drawCalls: number } {
    return {
      triangles: this.currentQuadCount * 2, // 2 triangles per quad
      drawCalls: 1 // Single draw call for all quads
    }
  }

  public dispose(): void {
    const gl = this.gl
    
    if (this.program) gl.deleteProgram(this.program)
    if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer)
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer)
    if (this.texture) gl.deleteTexture(this.texture)
    if (this.vao) gl.deleteVertexArray(this.vao)
  }
}