#ifdef GL_ES
precision highp float;
#endif

// Vertex shader: pass UVs to fragment
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
