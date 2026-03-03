import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'

const MORNING = {
  sky:     new THREE.Color(0x1A0800),
  fog:     new THREE.Color(0x1A0800),
  ambient: new THREE.Color(0xFFDDAA),
  ambientI: 1.2,
  sun:     new THREE.Color(0xFFEECC),
  sunI:    2.5,
  hemi:    new THREE.Color(0xFF8844),
  hemiGnd: new THREE.Color(0x332200),
  sunPos:  new THREE.Vector3(10, 20, 8),
  exposure: 1.0,
}

const EVENING = {
  sky:     new THREE.Color(0x060212),
  fog:     new THREE.Color(0x060212),
  ambient: new THREE.Color(0x4422AA),
  ambientI: 0.35,
  sun:     new THREE.Color(0xFF4400),
  sunI:    0.5,
  hemi:    new THREE.Color(0x330066),
  hemiGnd: new THREE.Color(0x110022),
  sunPos:  new THREE.Vector3(-12, 5, 5),
  exposure: 1.5,
}

export default function SkyLighting() {
  const ambRef = useRef()
  const sunRef = useRef()
  const hemiRef = useRef()
  const { timeMode } = useStore()

  const target = timeMode === 'morning' ? MORNING : EVENING
  const tPos = new THREE.Vector3()
  const tCol = new THREE.Color()

  useFrame(({ scene, gl }) => {
    const t = 0.03 // lerp speed

    if (!ambRef.current || !sunRef.current || !hemiRef.current) return

    // Ambient
    ambRef.current.color.lerp(target.ambient, t)
    ambRef.current.intensity += (target.ambientI - ambRef.current.intensity) * t

    // Sun directional
    sunRef.current.color.lerp(target.sun, t)
    sunRef.current.intensity += (target.sunI - sunRef.current.intensity) * t
    sunRef.current.position.lerp(target.sunPos, t)

    // Hemisphere
    hemiRef.current.color.lerp(target.hemi, t)
    hemiRef.current.groundColor.lerp(target.hemiGnd, t)

    // Scene background + fog
    if (scene.background) scene.background.lerp(target.sky, t)
    if (scene.fog) scene.fog.color.lerp(target.fog, t)

    // Tone mapping exposure
    gl.toneMappingExposure += (target.exposure - gl.toneMappingExposure) * t
  })

  return (
    <>
      <color attach="background" args={[MORNING.sky]} />
      <fog attach="fog" args={[MORNING.fog, 22, 55]} />

      <ambientLight ref={ambRef} color={MORNING.ambient} intensity={MORNING.ambientI} />

      <directionalLight
        ref={sunRef}
        color={MORNING.sun}
        intensity={MORNING.sunI}
        position={MORNING.sunPos.toArray()}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <hemisphereLight
        ref={hemiRef}
        color={MORNING.hemi}
        groundColor={MORNING.hemiGnd}
        intensity={0.8}
      />
    </>
  )
}