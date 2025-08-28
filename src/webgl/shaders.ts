export const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`

export const fragmentShaderSource = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_gamma;
uniform float u_time;
uniform vec2 u_resolution;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    
    // Simply display the texture as-is to match C# original
    // No processing to preserve original BGRA pattern
    outColor = texColor;
}
`