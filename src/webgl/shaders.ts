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

// Heavy computational functions to stress GPU
vec3 complexProcessing(vec3 color, vec2 coord) {
    // Simulate heavy medical image processing
    vec3 result = color;
    
    // Multiple passes of heavy operations
    for(int i = 0; i < 50; i++) {
        float fi = float(i);
        
        // Complex mathematical operations
        result.r = sin(result.r * 10.0 + fi * 0.1) * 0.5 + 0.5;
        result.g = cos(result.g * 8.0 + fi * 0.15) * 0.5 + 0.5;
        result.b = sin(result.b * 12.0 + fi * 0.08) * 0.5 + 0.5;
        
        // Distance calculations (expensive)
        vec2 center = vec2(0.5);
        float dist = length(coord - center + sin(u_time + fi) * 0.1);
        result *= 1.0 + dist * 0.1;
        
        // Power operations (very expensive on some GPUs)
        result = pow(abs(result), vec3(1.1));
    }
    
    return result;
}

vec3 adjustBrightness(vec3 color, float brightness) {
    return color + brightness;
}

vec3 adjustContrast(vec3 color, float contrast) {
    return (color - 0.5) * contrast + 0.5;
}

vec3 adjustGamma(vec3 color, float gamma) {
    return pow(abs(color), vec3(1.0 / gamma));
}

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    
    vec3 color = texColor.rgb;
    
    // Apply heavy processing (this should show performance difference)
    color = complexProcessing(color, v_texCoord);
    
    // Apply standard adjustments
    color = adjustBrightness(color, u_brightness);
    color = adjustContrast(color, u_contrast);
    color = adjustGamma(color, u_gamma);
    
    outColor = vec4(clamp(color, 0.0, 1.0), texColor.a);
}
`