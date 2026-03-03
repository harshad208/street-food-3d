import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import steamVert from '../shaders/steam.vert.glsl'
import steamFrag from '../shaders/steam.frag.glsl'

/**
 * SteamEffect
 * Renders 3–5 overlapping shader planes that wave upward.
 * Place above a hot food item.
 */
export default function SteamEffect({ position = [0, 0, 0], color = [1, 0.9, 0.7], count = 4, opacity = 0.55 }) {
  const refs = useRef([])

  const uniforms = useMemo(() => Array.from({ length: count }, (_, i) => ({
    uTime:    { value: i * 0.7 },
    uColor:   { value: new THREE.Vector3(...color) },
    uOpacity: { value: opacity },
  })), [count, color, opacity])

  useFrame((_, delta) => {
    uniforms.forEach(u => { u.uTime.value += delta })
  })

  return (
    <group position={position}>
      {uniforms.map((u, i) => (
        <mesh
          key={i}
          ref={el => refs.current[i] = el}
          position={[
            (i - count / 2) * 0.18,
            0,
            (Math.sin(i * 1.3)) * 0.1,
          ]}
          rotation={[0, (i * Math.PI) / count, 0]}
        >
          <planeGeometry args={[0.55, 1.6, 4, 12]} />
          <shaderMaterial
            vertexShader={steamVert}
            fragmentShader={steamFrag}
            uniforms={u}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}