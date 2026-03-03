import * as THREE from 'three'

// Lamp post helper
function LampPost({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.08, 5.5, 8]} />
        <meshStandardMaterial color="#333322" roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} />
        <meshStandardMaterial color="#444433" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, 3.15, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#FFEE88" emissive="#FFEE88" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 3.15, 0]} color="#FFDD88" intensity={1.8} distance={10} />
    </group>
  )
}

// Building helper
function Building({ position, size, color, windows = true }) {
  const [wx, wy, wz] = size
  return (
    <group position={[position[0], wy / 2, position[2]]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {windows && Array.from({ length: Math.floor(wy / 2) }, (_, row) =>
        [-0.9, 0, 0.9].map((ox, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[ox, -wy / 2 + row * 2 + 1.2, wz / 2 + 0.02]}
          >
            <planeGeometry args={[0.38, 0.48]} />
            <meshStandardMaterial
              color="#FFCC44"
              emissive="#FFCC44"
              emissiveIntensity={Math.random() > 0.35 ? 1.8 : 0}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

export default function StreetEnvironment() {
  return (
    <group>
      {/* ── GROUND ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 35, 35, 18]} />
        <meshStandardMaterial color="#2A1800" roughness={0.95} />
      </mesh>

      {/* Pavement lines */}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-12 + i * 2, 0.01, 0]}>
          <planeGeometry args={[0.08, 30]} />
          <meshStandardMaterial color="#3A2200" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`v${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -8 + i * 2]}>
          <planeGeometry args={[30, 0.08]} />
          <meshStandardMaterial color="#3A2200" roughness={0.9} />
        </mesh>
      ))}

      {/* ── BACKGROUND BUILDINGS ── */}
      <Building position={[-18, 0, -9]}  size={[5, 10, 5]}  color="#2A1500" />
      <Building position={[-12, 0, -11]} size={[4, 7, 4]}   color="#1E1000" />
      <Building position={[14,  0, -10]} size={[6, 12, 5]}  color="#251200" />
      <Building position={[20,  0, -8]}  size={[4, 8, 4]}   color="#1A0D00" />
      <Building position={[-22, 0, -6]}  size={[3, 6, 3]}   color="#2D1800" windows={false} />
      <Building position={[22,  0, -7]}  size={[5, 9, 4]}   color="#1C0E00" />
      <Building position={[0,   0, -13]} size={[8, 5, 3]}   color="#200F00" windows={false} />

      {/* ── LAMP POSTS ── */}
      {[-9, -3, 3, 9].map((x, i) => (
        <LampPost key={i} position={[x, 2.75, 3.8]} />
      ))}

      {/* ── ROAD GARBAGE / PROPS ── */}
      {/* Crates */}
      {[[-11.5, 0, 2], [11, 0, 2], [-5, 0, -1.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshStandardMaterial color="#5A3A10" roughness={0.9} />
        </mesh>
      ))}

      {/* ── ELECTRIC WIRES (decorative) ── */}
      {[-6, 0, 6].map((x, i) => {
        const points = [
          new THREE.Vector3(x - 0.5, 5.8, -3),
          new THREE.Vector3(x, 5.5, 0),
          new THREE.Vector3(x + 0.5, 5.8, 3.5),
        ]
        const curve = new THREE.CatmullRomCurve3(points)
        const geo = new THREE.TubeGeometry(curve, 20, 0.015, 6, false)
        return (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}