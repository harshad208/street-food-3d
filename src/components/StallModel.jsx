import { useRef, useState, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import SteamEffect from './SteamEffect'
import useStore from '../store/useStore'

// ─────────────────────────────────────────────────────────────────────────────
//  GLBModel — loads a .glb file and auto-plays ALL embedded animation clips.
//  Uses React Three Fiber's useGLTF + useAnimations (drei).
//  Shadows are enabled on every mesh automatically.
// ─────────────────────────────────────────────────────────────────────────────
function GLBModel({ path, scale, rotation = [0, 0, 0], positionY = 0, stallId }) {
  const groupRef    = useRef()
  const pivotRef    = useRef()
  const { scene, animations } = useGLTF(path)
  const { actions, names, mixer } = useAnimations(animations, groupRef)

  // Read live Y offset from the YOffsetTuner every frame (no re-render needed)
  useFrame(() => {
    if (!pivotRef.current) return
    const liveY = window.__yOffsets?.[stallId] ?? positionY
    pivotRef.current.position.y = liveY
  })

  useEffect(() => {
    // ── 1. Enable shadows on every mesh inside the GLB ──
    scene.traverse(node => {
      if (node.isMesh) {
        node.castShadow    = true
        node.receiveShadow = true
        if (node.material) {
          // Fix common Sketchfab artefact — force front-side rendering
          node.material.side        = THREE.FrontSide
          node.material.needsUpdate = true
        }
      }
    })

    // ── 2. Play every animation clip found in the GLB ──
    if (names.length > 0) {
      console.log(`%c[GLB Animations] ${path}`, 'color:#FF6B00;font-weight:bold', names)
      names.forEach(clipName => {
        const action = actions[clipName]
        if (!action) return
        action.reset()
        action.setLoop(THREE.LoopRepeat, Infinity)
        action.fadeIn(0.4)
        action.play()
      })
    } else {
      console.log(`%c[GLB] ${path} — static model (no animation clips)`, 'color:#888')
    }

    return () => { mixer?.stopAllAction() }
  }, [actions, names, mixer, scene, path])

  return (
    <group ref={groupRef}>
      <group ref={pivotRef} position={[0, positionY, 0]}>
        <primitive object={scene} scale={scale} rotation={rotation} />
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ErrorBoundary — catches useGLTF failures (404, malformed GLB, etc.)
//  and renders the procedural fallback instead.
// ─────────────────────────────────────────────────────────────────────────────
import { Component } from 'react'

class GLBErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) {
    console.warn(`%c[GLB Error] Could not load model → showing procedural mesh`, 'color:#ff4444', err.message)
  }
  render() {
    if (this.state.failed) return <ProceduralStall stall={this.props.stall} />
    return this.props.children
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  ProceduralStall — rich hand-crafted mesh for when GLB is unavailable.
//  Each stall has unique geometry, colors, and animated details.
// ─────────────────────────────────────────────────────────────────────────────
function ProceduralStall({ stall }) {
  const steamRef = useRef()
  const bulbRefs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Pulse the decorative bulbs
    bulbRefs.current.forEach((b, i) => {
      if (b?.material) b.material.emissiveIntensity = 2 + Math.sin(t * 3 + i * 0.8) * 1
    })
  })

  const c  = stall.color
  const ac = stall.accentColor
  const lc = stall.lightColor

  return (
    <group>
      {/* ── COUNTER BASE ── */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.0, 1.8]} />
        <meshStandardMaterial color={c} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Decorative counter front panel */}
      <mesh position={[0, 0.5, 0.92]} castShadow>
        <boxGeometry args={[3.1, 0.85, 0.04]} />
        <meshStandardMaterial color={ac} roughness={0.8} />
      </mesh>

      {/* Counter top (marble-ish) */}
      <mesh position={[0, 1.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.12, 2.05]} />
        <meshStandardMaterial color="#EED9C4" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Counter top edge trim */}
      <mesh position={[0, 1.13, 0.96]}>
        <boxGeometry args={[3.42, 0.06, 0.06]} />
        <meshStandardMaterial color={ac} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── BACK WALL ── */}
      <mesh position={[0, 2.0, -1.02]} castShadow>
        <boxGeometry args={[3.4, 2.8, 0.14]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>

      {/* Shelf on back wall */}
      <mesh position={[0, 2.2, -0.88]}>
        <boxGeometry args={[2.8, 0.06, 0.3]} />
        <meshStandardMaterial color="#EED9C4" roughness={0.5} />
      </mesh>

      {/* ── SIDE WALLS ── */}
      {[-1.62, 1.62].map((x, i) => (
        <mesh key={i} position={[x, 2.0, -0.05]} castShadow>
          <boxGeometry args={[0.14, 2.8, 2.1]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}

      {/* ── ROOF ── */}
      <mesh position={[0, 3.45, -0.05]} castShadow>
        <boxGeometry args={[3.72, 0.16, 2.32]} />
        <meshStandardMaterial color={ac} roughness={0.55} />
      </mesh>

      {/* Roof front overhang */}
      <mesh position={[0, 3.2, 1.05]} castShadow>
        <boxGeometry args={[3.72, 0.12, 0.55]} />
        <meshStandardMaterial color={ac} roughness={0.6} />
      </mesh>

      {/* ── HANGING BANNER ── */}
      <mesh position={[0, 3.02, 0.78]}>
        <boxGeometry args={[2.9, 0.38, 0.03]} />
        <meshStandardMaterial color={c} roughness={0.7} emissive={c} emissiveIntensity={0.2} />
      </mesh>

      {/* ── BULB STRING LIGHTS ── */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={el => bulbRefs.current[i] = el}
          position={[-1.4 + i * 0.4, 3.06 + Math.sin(i * 1.1) * 0.04, 0.9]}
        >
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color={lc} emissive={lc} emissiveIntensity={3} />
        </mesh>
      ))}
      {/* Wire connecting bulbs */}
      <mesh position={[0, 3.07, 0.9]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.9, 0.01, 0.01]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* ── STALL-SPECIFIC PROPS ── */}
      <StallProps stall={stall} />
    </group>
  )
}

// ─── Per-stall unique props ───────────────────────────────────────────────────
function StallProps({ stall }) {

  // ── VADA PAV ──────────────────────────────────────────────
  if (stall.id === 'vada-pav') {
    return (
      <group>
        {/* Stack of pav buns */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[-0.9 + i * 0.32, 1.2 + (i > 2 ? (i - 2) * 0.12 : 0), 0.25]} castShadow>
            <sphereGeometry args={[0.15, 14, 10]} />
            <meshStandardMaterial color="#D4A060" roughness={0.88} />
          </mesh>
        ))}

        {/* Kadhai (iron wok) */}
        <mesh position={[0.72, 1.22, 0.1]} castShadow>
          <cylinderGeometry args={[0.46, 0.34, 0.26, 20]} />
          <meshStandardMaterial color="#2A2A2A" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Oil inside kadhai */}
        <mesh position={[0.72, 1.3, 0.1]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 20]} />
          <meshStandardMaterial color="#C8820A" roughness={0.1} transparent opacity={0.9} />
        </mesh>
        {/* Vada (fried ball) in kadhai */}
        <mesh position={[0.72, 1.35, 0.1]} castShadow>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshStandardMaterial color="#8B4500" roughness={0.9} />
        </mesh>

        {/* Three chutney bowls */}
        {[['#2E7A00', 0], ['#8B0A00', 0.28], ['#6B4800', 0.56]].map(([col, dx], i) => (
          <group key={i} position={[-0.55 + dx, 1.14, -0.38]}>
            <mesh>
              <cylinderGeometry args={[0.11, 0.09, 0.09, 12]} />
              <meshStandardMaterial color="#DDD" roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.03, 12]} />
              <meshStandardMaterial color={col} roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Tongs on counter */}
        <mesh position={[0.5, 1.15, -0.2]} rotation={[0.3, 0.4, 0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Newspaper wrapping on counter */}
        <mesh position={[-1.1, 1.14, 0.3]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.35, 0.02, 0.28]} />
          <meshStandardMaterial color="#E8E0D0" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  // ── CHAI TAPRI ────────────────────────────────────────────
  if (stall.id === 'chai-tapri') {
    return (
      <AnimatedChaiProps />
    )
  }

  // ── PAV BHAJI ─────────────────────────────────────────────
  if (stall.id === 'pav-bhaji') {
    return (
      <AnimatedPavBhajiProps />
    )
  }

  // ── JUICE CENTER ──────────────────────────────────────────
  if (stall.id === 'juice-center') {
    return (
      <group>
        {/* Sugarcane press machine */}
        <mesh position={[-0.85, 1.6, 0.0]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.9, 14]} />
          <meshStandardMaterial color="#228855" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Rollers */}
        {[-0.1, 0.1].map((ox, i) => (
          <mesh key={i} position={[-0.85 + ox, 1.85, 0.0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 10]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color="#1A5533" roughness={0.4} metalness={0.6} />
          </mesh>
        ))}
        {/* Sugarcane stalks */}
        {[-0.05, 0.05, 0.0].map((ox, i) => (
          <mesh key={i} position={[-0.85 + ox, 2.3, 0.0]} rotation={[0, 0, 0.15 * (i - 1)]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 1.0, 8]} />
            <meshStandardMaterial color="#7AB648" roughness={0.8} />
          </mesh>
        ))}

        {/* Juice collection bowl */}
        <mesh position={[-0.85, 1.12, 0.0]}>
          <cylinderGeometry args={[0.18, 0.14, 0.12, 14]} />
          <meshStandardMaterial color="#AACC00" roughness={0.1} transparent opacity={0.85} />
        </mesh>

        {/* 4 juice glasses with different colours */}
        {[
          { col: '#FF6644', label: 'Mosambi' },
          { col: '#FFCC00', label: 'Mango' },
          { col: '#FF2288', label: 'Pomegranate' },
          { col: '#AADD00', label: 'Sugarcane' },
        ].map((j, i) => (
          <group key={i} position={[0.05 + i * 0.3, 0, 0.1]}>
            {/* Glass body */}
            <mesh position={[0, 1.32, 0]}>
              <cylinderGeometry args={[0.09, 0.07, 0.38, 12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.0} transparent opacity={0.22} />
            </mesh>
            {/* Juice fill */}
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.075, 0.06, 0.28, 12]} />
              <meshStandardMaterial color={j.col} roughness={0.1} transparent opacity={0.9} />
            </mesh>
            {/* Straw */}
            <mesh position={[0.04, 1.52, 0.04]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.008, 0.008, 0.35, 6]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#FF2200' : '#FFFFFF'} roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Fruit display */}
        {[
          { c: '#FF4422', r: 0.13, y: 0 },
          { c: '#FF8800', r: 0.14, y: 0 },
          { c: '#FFE000', r: 0.11, y: 0 },
          { c: '#22CC44', r: 0.10, y: 0 },
          { c: '#FF2244', r: 0.09, y: 0.18 },
        ].map((f, i) => (
          <mesh key={i} position={[-1.15 + i * 0.24, 1.2 + f.y, -0.36]} castShadow>
            <sphereGeometry args={[f.r, 14, 10]} />
            <meshStandardMaterial color={f.c} roughness={0.55} />
          </mesh>
        ))}

        {/* Ice bucket */}
        <mesh position={[1.1, 1.35, 0.1]} castShadow>
          <cylinderGeometry args={[0.16, 0.13, 0.3, 12]} />
          <meshStandardMaterial color="#AADDFF" roughness={0.1} transparent opacity={0.7} />
        </mesh>
      </group>
    )
  }

  return null
}

// ── Animated chai props (kettle bob, pouring effect) ─────────────────────────
function AnimatedChaiProps() {
  const kettleRef = useRef()
  const steamGlassRef = useRef([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (kettleRef.current) {
      kettleRef.current.rotation.z = Math.sin(t * 1.2) * 0.03
    }
  })

  return (
    <group>
      {/* Gas stove */}
      <mesh position={[-0.45, 1.17, 0.12]}>
        <boxGeometry args={[0.75, 0.14, 0.55]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.25} metalness={0.9} />
      </mesh>
      {/* Stove grate */}
      {[-0.15, 0.15].map((ox, i) => (
        <mesh key={i} position={[-0.45 + ox, 1.25, 0.12]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 8]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      {/* Gas flame glow (small emissive disc) */}
      <mesh position={[-0.45, 1.26, 0.12]}>
        <cylinderGeometry args={[0.08, 0.08, 0.01, 12]} />
        <meshStandardMaterial color="#FF6600" emissive="#FF4400" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>

      {/* Big chai kettle (animated) */}
      <mesh ref={kettleRef} position={[-0.45, 1.58, 0.12]} castShadow>
        <cylinderGeometry args={[0.24, 0.19, 0.58, 16]} />
        <meshStandardMaterial color="#B07830" roughness={0.28} metalness={0.72} />
      </mesh>
      {/* Kettle lid */}
      <mesh position={[-0.45, 1.9, 0.12]}>
        <cylinderGeometry args={[0.12, 0.24, 0.08, 16]} />
        <meshStandardMaterial color="#8B5E20" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Kettle handle */}
      <mesh position={[-0.7, 1.58, 0.12]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.1, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#5A3A10" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* 6 cutting chai glasses */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[0.28 + i * 0.2, 0, 0.0]}>
          <mesh position={[0, 1.145, 0]}>
            <cylinderGeometry args={[0.07, 0.055, 0.24, 10]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.0} transparent opacity={0.25} />
          </mesh>
          {/* Tea fill */}
          <mesh position={[0, 1.13, 0]}>
            <cylinderGeometry args={[0.058, 0.048, 0.17, 10]} />
            <meshStandardMaterial color="#CC7722" roughness={0.1} transparent opacity={0.92} />
          </mesh>
        </group>
      ))}

      {/* Small saucer under each glass */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.28 + i * 0.2, 1.03, 0.0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.02, 12]} />
          <meshStandardMaterial color="#EEE" roughness={0.5} />
        </mesh>
      ))}

      {/* Biscuit tin */}
      <mesh position={[1.05, 1.33, -0.25]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.42, 14]} />
        <meshStandardMaterial color="#CC2200" roughness={0.45} metalness={0.3} />
      </mesh>
      {/* Tin lid */}
      <mesh position={[1.05, 1.56, -0.25]}>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 14]} />
        <meshStandardMaterial color="#AA1800" roughness={0.5} />
      </mesh>

      {/* Calendar / board on back wall */}
      <mesh position={[0, 2.4, -0.87]}>
        <boxGeometry args={[0.7, 0.5, 0.02]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.9} />
      </mesh>

      {/* Spice jars on shelf */}
      {[['#CC4400', 0], ['#884400', 0.22], ['#226600', 0.44]].map(([col, dx], i) => (
        <mesh key={i} position={[-0.5 + dx, 2.33, -0.77]}>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 10]} />
          <meshStandardMaterial color={col} roughness={0.5} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ── Animated pav bhaji tawa (bhaji stirring) ──────────────────────────────────
function AnimatedPavBhajiProps() {
  const spatulaRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Stirring motion
    if (spatulaRef.current) {
      spatulaRef.current.rotation.y = t * 1.5
      spatulaRef.current.position.x = -0.2 + Math.sin(t * 1.5) * 0.15
      spatulaRef.current.position.z =  0.1 + Math.cos(t * 1.5) * 0.15
    }
  })

  return (
    <group>
      {/* Big iron tawa */}
      <mesh position={[-0.2, 1.17, 0.12]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.65, 0.08, 24]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.2} metalness={0.92} />
      </mesh>

      {/* Bhaji (red-orange mash) */}
      <mesh position={[-0.2, 1.24, 0.12]}>
        <cylinderGeometry args={[0.62, 0.62, 0.1, 24]} />
        <meshStandardMaterial color="#CC3300" roughness={0.85} />
      </mesh>

      {/* Butter slab melting on bhaji */}
      <mesh position={[-0.05, 1.31, 0.0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.25, 0.07, 0.16]} />
        <meshStandardMaterial color="#FFE044" roughness={0.88} />
      </mesh>
      {/* Melted butter pool */}
      <mesh position={[-0.05, 1.29, 0.0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 14]} />
        <meshStandardMaterial color="#FFD700" roughness={0.1} transparent opacity={0.75} />
      </mesh>

      {/* Spatula (animated stirring) */}
      <group ref={spatulaRef} position={[-0.2, 1.3, 0.1]}>
        <mesh rotation={[0.4, 0, 0]} position={[0, 0.3, 0]}>
          <boxGeometry args={[0.06, 0.55, 0.01]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh rotation={[0.4, 0, 0]} position={[0, 0.06, 0.06]}>
          <boxGeometry args={[0.12, 0.08, 0.01]} />
          <meshStandardMaterial color="#777" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Pav buns (toasting on tawa edge) */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i} position={[0.55 + i * 0.27, 0, 0.25]}>
          {/* Bottom half */}
          <mesh position={[0, 1.18, 0]} castShadow>
            <sphereGeometry args={[0.14, 14, 10]} />
            <meshStandardMaterial color="#D4A060" roughness={0.88} />
          </mesh>
          {/* Top half stacked */}
          <mesh position={[0, 1.32, 0]} castShadow>
            <sphereGeometry args={[0.13, 14, 10]} />
            <meshStandardMaterial color="#E8C878" roughness={0.88} />
          </mesh>
        </group>
      ))}

      {/* Chopped onion & coriander on counter */}
      <mesh position={[-0.9, 1.16, -0.35]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 12]} />
        <meshStandardMaterial color="#EEE" roughness={0.5} />
      </mesh>
      {/* Onion pieces */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.9 + Math.cos(i * 1.05) * 0.12, 1.2, -0.35 + Math.sin(i * 1.05) * 0.1]}>
          <boxGeometry args={[0.06, 0.02, 0.04]} />
          <meshStandardMaterial color="#CC88AA" roughness={0.8} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Lemon halves */}
      {[[-1.1, 0.1], [-1.2, -0.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.16, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
          <meshStandardMaterial color="#FFE044" roughness={0.7} />
        </mesh>
      ))}

      {/* Masala dabba (spice box) */}
      <mesh position={[1.1, 1.35, -0.3]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[1.1, 1.41, -0.3]}>
        <cylinderGeometry args={[0.21, 0.21, 0.03, 16]} />
        <meshStandardMaterial color="#AAAAAA" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN StallModel — outer wrapper with click, hover, GSAP, steam, label
// ─────────────────────────────────────────────────────────────────────────────
export default function StallModel({ stall, index }) {
  const groupRef  = useRef()
  const hoverRef  = useRef(false)
  const { setActiveStall, setFocusedStall, focusedStall, timeMode } = useStore()

  // Gentle ambient bob
  useFrame(({ clock }) => {
    if (!groupRef.current || hoverRef.current) return
    const t = clock.elapsedTime
    groupRef.current.position.y = Math.sin(t * 0.7 + index * 1.5) * 0.012
  })

  const handleClick = (e) => {
    e.stopPropagation()
    setActiveStall(index)
    setFocusedStall(index)
    if (!groupRef.current) return
    gsap.to(groupRef.current.position, {
      y: 0.35, duration: 0.15, ease: 'power2.out',
      onComplete: () =>
        gsap.to(groupRef.current.position, { y: 0, duration: 0.55, ease: 'elastic.out(1, 0.38)' })
    })
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    hoverRef.current = true
    document.body.style.cursor = 'pointer'
    if (groupRef.current) gsap.to(groupRef.current.position, { y: 0.15, duration: 0.3, ease: 'power2.out' })
  }

  const handlePointerOut = () => {
    hoverRef.current = false
    document.body.style.cursor = 'default'
    if (groupRef.current) gsap.to(groupRef.current.position, { y: 0, duration: 0.4, ease: 'power2.inOut' })
  }

  return (
    <group
      ref={groupRef}
      position={stall.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Per-stall point light */}
      <pointLight
        position={[0, 3.8, 0.5]}
        color={stall.lightColor}
        intensity={timeMode === 'evening' ? 6 : 2.8}
        distance={15}
      />

      {/* ── GLB (with animations) or procedural fallback ── */}
      <GLBErrorBoundary stall={stall}>
        <Suspense fallback={<ProceduralStall stall={stall} />}>
          <GLBModel path={stall.glbPath} scale={stall.scale} rotation={stall.rotation ?? [0,0,0]} positionY={stall.positionY ?? 0} stallId={stall.id} />
        </Suspense>
      </GLBErrorBoundary>

      {/* Steam effect */}
      <SteamEffect
        position={stall.steamPosition}
        color={stall.steamColor}
        count={4}
        opacity={0.52}
      />

      {/* Floating HTML label */}
      <Html
        position={[0, 4.6, 0]}
        center
        distanceFactor={14}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        occlude
      >
        <div style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: '13px', fontWeight: 800,
          color: stall.color,
          textShadow: `0 0 14px ${stall.color}99`,
          whiteSpace: 'nowrap',
          background: '#1A0A00CC',
          padding: '3px 12px',
          borderRadius: 20,
          border: `1px solid ${stall.color}44`,
          backdropFilter: 'blur(4px)',
          letterSpacing: '0.05em',
        }}>
          {stall.emoji} {stall.name}
        </div>
      </Html>

      {/* Invisible full-stall hitbox */}
      <mesh visible={false}>
        <boxGeometry args={[4.0, 4.5, 3.0]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}