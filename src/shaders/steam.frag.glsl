varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uOpacity;

// Simple 2D noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), f.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
    f.y
  );
}

void main() {
  // Fade out at top and edges
  float fadeTop  = 1.0 - vUv.y;
  fadeTop = fadeTop * fadeTop;

  float fadeEdge = 1.0 - abs(vUv.x - 0.5) * 2.2;
  fadeEdge = clamp(fadeEdge, 0.0, 1.0);

  // Animated noise for wispy look
  vec2 uv = vUv * vec2(2.0, 3.0);
  float n1 = noise(uv + vec2(uTime * 0.3, uTime * 0.5));
  float n2 = noise(uv * 2.0 - vec2(uTime * 0.2, uTime * 0.4));
  float n  = n1 * 0.7 + n2 * 0.3;

  float alpha = fadeTop * fadeEdge * n * uOpacity;
  alpha = clamp(alpha, 0.0, 1.0);

  // Slightly brighter at base
  vec3 col = uColor * (1.0 + (1.0 - vUv.y) * 0.3);

  gl_FragColor = vec4(col, alpha);
}
