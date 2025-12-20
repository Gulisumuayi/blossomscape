#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  // Normalize UV to centered coordinate system [-1,1]
  vec2 p = vUv * 2.0 - 1.0;
  // Compute polar coordinates
  float r = length(p);
  float angle = atan(p.y, p.x);

  // Petal shape parameters
  float petals = 6.0;
  // Radial petal boundary (uses a rose curve pattern)
  float petalRadius = 0.3 + 0.1 * cos(petals * angle + uTime * 0.2);
  float edge = 0.005;  // edge feathering width

  // Mask for petal region (1.0 inside petals, 0.0 outside, with smooth edges)
  float petalMask = 1.0 - smoothstep(petalRadius - edge, petalRadius + edge, r);
  // Mask for central disk of flower
  float centerRadius = 0.1;
  float centerMask = 1.0 - smoothstep(centerRadius - edge, centerRadius + edge, r);

  // Colors
  vec3 bgColor = vec3(0.0, 0.0, 0.0);
  vec3 petalColor = vec3(1.0, 0.5, 0.8);    // pink petals
  vec3 centerColor = vec3(1.0, 0.8, 0.2);   // yellow center

  // Combine layers: background, petals, then center
  vec3 color = mix(bgColor, petalColor, petalMask);
  color = mix(color, centerColor, centerMask);

  gl_FragColor = vec4(color, 1.0);
}

