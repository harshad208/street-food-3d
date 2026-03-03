import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import StallModel from './StallModel'
import SkyLighting from './SkyLighting'
import StreetEnvironment from './StreetEnvironment'
import { GLBInspectors, GLBDebugOverlay, YOffsetTuner } from './GLBDebugPanel'
import { STALLS } from '../data/stalls'
import useStore from '../store/useStore'

// ─── CAMERA CONTROLLER ────────────────────────────────────────────────────────
function CameraController() {
  const { camera } = useThree()
  const { focusedStall } = useStore()
  const targetPos  = useRef(new THREE.Vector3(0, 8, 22))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    if (focusedStall !== null) {
      const s = STALLS[focusedStall]
      const [sx,, sz] = s.position
      const [ox, oy, oz] = s.cameraOffset
      targetPos.current.set(sx + ox, oy, sz + oz)
      targetLook.current.set(sx, 1.5, sz)
    } else {
      targetPos.current.set(0, 8, 22)
      targetLook.current.set(0, 0, 0)
    }
  }, [focusedStall])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.045)
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const want = targetLook.current.clone().sub(camera.position).normalize()
    dir.lerp(want, 0.045)
    camera.lookAt(camera.position.clone().add(dir))
  })

  return null
}

// ─── FIREFLIES ────────────────────────────────────────────────────────────────
function Fireflies({ count = 50 }) {
  const mesh = useRef()
  const basePos = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) =>
      i % 3 === 1 ? Math.random() * 5 + 0.3 : (Math.random() - 0.5) * 30
    )
  )
  const phases = useRef(Array.from({ length: count }, () => Math.random() * Math.PI * 2))

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.elapsedTime
    const arr = mesh.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i*3]   = basePos.current[i*3]   + Math.sin(t*0.5 + phases.current[i]) * 0.35
      arr[i*3+1] = basePos.current[i*3+1] + Math.sin(t*0.7 + phases.current[i]+1) * 0.2
      arr[i*3+2] = basePos.current[i*3+2] + Math.cos(t*0.4 + phases.current[i]) * 0.3
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
    mesh.current.material.opacity = 0.3 + Math.sin(t * 2.2) * 0.15
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={basePos.current} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFCC44" size={0.07} transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// ─── SCENE CONTENT ────────────────────────────────────────────────────────────
function SceneContent({ onGLBReport }) {
  const { timeMode, setLoaded } = useStore()

  useEffect(() => {
    const t = setTimeout(() => setLoaded(), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <SkyLighting />
      <CameraController />
      <StreetEnvironment />

      {STALLS.map((stall, i) => (
        <StallModel key={stall.id} stall={stall} index={i} />
      ))}

      {/* GLB inspectors — invisible, just read size + animations */}
      <GLBInspectors onReport={onGLBReport} />

      <Fireflies count={50} />

      <Stars
        radius={80} depth={40}
        count={timeMode === 'evening' ? 2500 : 300}
        factor={3} saturation={0} fade speed={0.5}
      />

      <OrbitControls
        enablePan={false}
        minDistance={5} maxDistance={42}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.08}
        enableDamping dampingFactor={0.06}
        rotateSpeed={0.6}
      />
    </>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Scene() {
  const [glbReports, setGlbReports] = useState({})

  const handleGLBReport = useCallback((id, data) => {
    setGlbReports(prev => ({ ...prev, [id]: data }))
  }, [])

  return (
    <>
      <Canvas
        camera={{ position: [0, 8, 22], fov: 55, near: 0.1, far: 200 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContent onGLBReport={handleGLBReport} />
      </Canvas>

      {/* Debug panel lives outside Canvas (pure React DOM) */}
      <GLBDebugOverlay reports={glbReports} />
      <YOffsetTuner />
    </>
  )
}