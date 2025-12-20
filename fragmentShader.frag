// Fragment shader: procedural flower (inspired by Ksenia Kondrashova's shader:contentReference[oaicite:4]{index=4})
#define PI 3.14159265359

uniform float u_ratio;
uniform float u_moving;
uniform float u_stop_time;
uniform float u_speed;
uniform vec2 u_stop_randomizer;
uniform float u_clean;
uniform vec2 u_cursor;
uniform sampler2D u_texture;
varying vec2 vUv;

// Utility: random noise
float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n);
  vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x),
             mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

// Flower shape function
float flower_shape(vec2 _pt, float _size, float _outline, float _thickness, float _noise, float _angle_offset) {
  float rnd = noise(vUv);
  // Petal configuration
  float petals = 5.0 + floor(u_stop_randomizer.x * 4.0);
  // Animate petal angle slightly over time
  float angle_offset = 0.7 * (rnd - 0.5) / (0.2 + 30.0 * u_stop_time);
  float angle = atan(_pt.y, _pt.x) - angle_offset;
  // Sector shape for petals
  float petal_shape = abs(sin(angle * 0.5 * petals + _angle_offset)) + _thickness * 0.5;
  // Radial shape for flower (radius varies with noise and petal count)
  vec2 sizeRange = vec2(4.0, 18.0);
  float radial = length(_pt) * (sizeRange.x + sizeRange.y * u_stop_randomizer.x);
  float radius_noise = sin(angle * 13.0 + 15.0 * rnd);
  radial += _noise * radius_noise;
  // Grow effect over time (rapidly reaches full size)
  float grow = min(20000.0 * u_stop_time, 1.0);
  grow = 1.0 / grow;
  // Combine to form the flower shape mask (0 to 1)
  float shape = 1.0 - smoothstep(0.0, _size * petal_shape, _outline * grow * radial);
  // Hide flower if moving
  shape *= (1.0 - u_moving);
  // Stop drawing once time >= 1 (flower finalized)
  shape *= (1.0 - step(1.0, u_stop_time));
  return shape;
}

void main() {
  // Base color from the previous texture (background)
  vec3 base = texture2D(u_texture, vUv).rgb;
  // Coordinate of current fragment relative to cursor (center of flower)
  vec2 pt = vUv - u_cursor;
  pt.x *= u_ratio;  // correct aspect ratio

  // === Stem (small circle at cursor when moving) ===
  vec3 stem_color = vec3(0.0, 2.0, 2.0);
  float stem_radius = 0.005 * u_speed * u_moving;
  float stem_shape = 1.0 - pow(smoothstep(0.0, stem_radius, dot(pt, pt)), 0.03);
  vec3 stem = stem_shape * stem_color;

  // === Flower Petals ===
  vec3 flower_color = vec3(0.7 + u_stop_randomizer.y, 0.8 * u_stop_randomizer.y, 2.9 + u_stop_randomizer.x * 0.6);
  vec3 flower_main = flower_color * flower_shape(pt, 1.0, 0.96, 1.0, 0.15, 0.0);
  vec3 flower_mask = 1.0 - vec3(flower_shape(pt, 1.05, 1.07, 1.0, 0.15, 0.0));
  vec3 flower_center = vec3(-0.6) * flower_shape(pt, 0.15, 1.0, 2.0, 0.1, 1.9);

  // Composite final color: base background through flower mask, plus flower layers
  vec3 color = base * flower_mask + (flower_main + flower_center + stem);
  color *= u_clean;  // (unused in this simple case, u_clean = 1)
  // Clamp colors to create a soft palette (avoids pure blacks or oversaturated colors)
  color = clamp(color, vec3(0.0, 0.0, 0.15), vec3(1.0, 1.0, 0.4));

  gl_FragColor = vec4(color, 1.0);
}

