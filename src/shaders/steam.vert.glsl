varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Wavy lateral drift as steam rises
  float wave  = sin(pos.y * 3.5 + uTime * 2.2) * 0.10;
  float drift = sin(pos.y * 2.0 + uTime * 1.6 + 1.0) * 0.07;
  float sway  = cos(pos.y * 1.2 + uTime * 0.9 + 2.0) * 0.05;

  pos.x += wave + sway;
  pos.z += drift;

  // Expand slightly as it rises
  pos.x *= 1.0 + pos.y * 0.15;
  pos.z *= 1.0 + pos.y * 0.10;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
