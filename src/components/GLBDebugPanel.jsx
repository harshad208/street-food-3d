import { useState, useEffect, Component } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { STALLS } from '../data/stalls'

// ─────────────────────────────────────────────────────────────────────────────
//  Deep bounding box — handles Sketchfab models where root has no geometry
//  but children do. Also detects which axis is "up" (Y vs Z).
// ─────────────────────────────────────────────────────────────────────────────
function deepBoundingBox(scene) {
  // Force update all world matrices first
  scene.updateMatrixWorld(true)

  const box = new THREE.Box3()

  scene.traverse(node => {
    if (node.isMesh && node.geometry) {
      // Compute geometry bounding box in world space
      node.geometry.computeBoundingBox()
      if (node.geometry.boundingBox) {
        const worldBox = node.geometry.boundingBox.clone()
        worldBox.applyMatrix4(node.matrixWorld)
        box.union(worldBox)
      }
    }
  })

  return box
}

function analyzeGLB(scene, animations) {
  const box = deepBoundingBox(scene)
  const size = new THREE.Vector3()

  let isEmpty = false
  if (box.isEmpty()) {
    isEmpty = true
    // fallback: count nodes
    size.set(0, 0, 0)
  } else {
    box.getSize(size)
  }

  // Detect if model is Z-up (common in some Blender/Sketchfab exports)
  const isZUp = size.z > size.y * 1.5

  // "Height" = the vertical dimension (Y normally, Z if Z-up)
  const height  = isZUp ? size.z : size.y
  const maxDim  = Math.max(size.x, size.y, size.z)
  const targetH = 3.2 // desired stall height in scene units

  let suggestedScale = 1.0
  if (!isEmpty && maxDim > 0) {
    suggestedScale = +(targetH / maxDim).toFixed(5)
  }

  // Count meshes
  let meshCount = 0
  scene.traverse(n => { if (n.isMesh) meshCount++ })

  return {
    loaded: true,
    isEmpty,
    isZUp,
    rawSize: { x: +size.x.toFixed(3), y: +size.y.toFixed(3), z: +size.z.toFixed(3) },
    height:  +height.toFixed(3),
    maxDim:  +maxDim.toFixed(3),
    suggestedScale,
    animations: animations.map(a => ({ name: a.name, duration: +a.duration.toFixed(2) })),
    meshCount,
  }
}

// ─── Inspector component (runs inside Canvas) ────────────────────────────────
function GLBInspector({ stall, onReport }) {
  const { scene, animations } = useGLTF(stall.glbPath)

  useEffect(() => {
    const result = analyzeGLB(scene, animations)
    onReport(stall.id, result)
  }, [scene, animations]) // eslint-disable-line

  return null
}

class InspectorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { this.props.onFail(err.message) }
  render() { return this.state.failed ? null : this.props.children }
}

function GLBInspectorSafe({ stall, onReport }) {
  return (
    <InspectorBoundary onFail={msg => onReport(stall.id, { loaded: false, error: msg })}>
      <GLBInspector stall={stall} onReport={onReport} />
    </InspectorBoundary>
  )
}

export function GLBInspectors({ onReport }) {
  return (
    <>
      {STALLS.map(s => <GLBInspectorSafe key={s.id} stall={s} onReport={onReport} />)}
    </>
  )
}

// ─── Overlay UI (pure DOM, outside Canvas) ───────────────────────────────────
export function GLBDebugOverlay({ reports }) {
  const [visible, setVisible] = useState(true)
  const [copied, setCopied]   = useState(false)

  const allDone = Object.keys(reports).length === STALLS.length

  const generateSnippet = () =>
    STALLS.map(s => {
      const r = reports[s.id]
      if (!r) return `  // ${s.name}: ⏳ still loading`
      if (!r.loaded) return `  // ${s.name}: ❌ ${r.error}`

      const warnings = []
      if (r.isEmpty)  warnings.push('⚠️ empty bbox — nested geometry')
      if (r.isZUp)    warnings.push('⚠️ Z-up model — may need rotation')
      if (r.meshCount === 0) warnings.push('⚠️ no meshes found')

      const warn = warnings.length ? `  // ${warnings.join(' | ')}` : ''
      return `  { id: '${s.id}', scale: ${r.suggestedScale}, rotation: [0,0,0] },  // h:${r.height} meshes:${r.meshCount}${warn ? '\n' + warn : ''}`
    }).join('\n')

  const copy = () => {
    navigator.clipboard?.writeText(generateSnippet())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!visible) return (
    <button onClick={() => setVisible(true)} style={btnStyle}>🔍 GLB Debug</button>
  )

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ color:'#FF6B00', fontWeight:'bold', fontSize:'0.75rem' }}>🔍 GLB Debug Panel</span>
        <button onClick={() => setVisible(false)} style={{ background:'none', border:'none', color:'#8B6040', cursor:'pointer', fontSize:'1.1rem' }}>×</button>
      </div>

      {STALLS.map(stall => {
        const r = reports[stall.id]
        return (
          <div key={stall.id} style={{
            marginBottom:10, padding:'0.6rem 0.7rem',
            background:'#140800AA', borderRadius:7,
            border:`1px solid ${!r ? '#333' : r.loaded ? '#FF6B0033' : '#FF444433'}`,
          }}>
            <div style={{ color:stall.color, fontWeight:'bold', fontSize:'0.72rem', marginBottom:2 }}>
              {stall.emoji} {stall.name}
            </div>
            <div style={{ color:'#4A2A10', fontSize:'0.58rem', marginBottom:5 }}>
              {stall.glbPath}
            </div>

            {!r && <div style={{ color:'#555' }}>⏳ Inspecting…</div>}

            {r?.error && (
              <div>
                <div style={{ color:'#FF4444' }}>❌ Failed to load</div>
                <div style={{ color:'#FF666655', fontSize:'0.6rem', marginTop:2 }}>{r.error}</div>
                <div style={{ color:'#FF884466', fontSize:'0.6rem', marginTop:4 }}>
                  → Filename must be exactly: <span style={{ color:'#FF8844' }}>{stall.glbPath.split('/').pop()}</span>
                </div>
              </div>
            )}

            {r?.loaded && (
              <div>
                {/* Status badges */}
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
                  <Badge color="#00CC66">✅ Loaded</Badge>
                  <Badge color={r.meshCount > 0 ? '#00CC66' : '#FF4444'}>
                    {r.meshCount} meshes
                  </Badge>
                  {r.isEmpty  && <Badge color="#FF8800">⚠️ Empty bbox</Badge>}
                  {r.isZUp    && <Badge color="#FF8800">⚠️ Z-up axis</Badge>}
                  {r.animations.length > 0 && <Badge color="#00FF88">🎬 {r.animations.length} anims</Badge>}
                </div>

                {/* Dimensions table */}
                <Grid>
                  <Cell muted>Raw W×H×D</Cell>
                  <Cell>{r.rawSize.x} × {r.rawSize.y} × {r.rawSize.z}</Cell>
                  <Cell muted>Largest axis</Cell>
                  <Cell>{r.maxDim} units</Cell>
                  <Cell muted>Current scale</Cell>
                  <Cell warn={String(stall.scale) !== String(r.suggestedScale)}>
                    {stall.scale}{String(stall.scale) !== String(r.suggestedScale) ? ' ←' : ' ✓'}
                  </Cell>
                  <Cell muted>Suggested scale</Cell>
                  <Cell gold bold>{r.suggestedScale}</Cell>
                  {r.isEmpty && <>
                    <Cell muted>Note</Cell>
                    <Cell warn>Model uses nested transforms — scale may need manual tuning</Cell>
                  </>}
                  {r.isZUp && <>
                    <Cell muted>Fix rotation</Cell>
                    <Cell warn>Add rotation={`{[-Math.PI/2, 0, 0]}`} to stall</Cell>
                  </>}
                </Grid>

                {/* Animations */}
                {r.animations.length > 0 && (
                  <div style={{ marginTop:5 }}>
                    <div style={{ color:'#8B6040', fontSize:'0.6rem', marginBottom:2 }}>Animation clips:</div>
                    {r.animations.map(a => (
                      <div key={a.name} style={{ color:'#00FF88', fontSize:'0.62rem', paddingLeft:4, lineHeight:1.7 }}>
                        ▶ "{a.name}" <span style={{ color:'#4A7A4A' }}>{a.duration}s</span>
                      </div>
                    ))}
                  </div>
                )}

                {r.animations.length === 0 && (
                  <div style={{ color:'#4A4A4A', fontSize:'0.6rem', marginTop:4 }}>
                    No animation clips — static model. You can still add procedural animations.
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Generated snippet */}
      {allDone && (
        <div style={{ marginTop:4 }}>
          <div style={{ color:'#8B6040', fontSize:'0.6rem', marginBottom:5, letterSpacing:'0.15em' }}>
            ── COPY INTO stalls.js ──
          </div>
          <pre style={{
            background:'#0A0500', padding:'0.5rem 0.7rem', borderRadius:5,
            color:'#00FF88', fontSize:'0.6rem', overflowX:'auto',
            whiteSpace:'pre-wrap', margin:0, lineHeight:1.7,
          }}>
            {generateSnippet()}
          </pre>
          <button onClick={copy} style={{
            marginTop:7, width:'100%',
            background: copied ? '#00884422' : '#FF6B0022',
            border:`1px solid ${copied ? '#00CC66' : '#FF6B0055'}`,
            color: copied ? '#00CC66' : '#FF6B00',
            padding:'5px 0', borderRadius:4, cursor:'pointer',
            fontSize:'0.65rem', fontFamily:'monospace', fontWeight:'bold', transition:'all 0.2s',
          }}>
            {copied ? '✓ Copied to clipboard!' : '📋 Copy to stalls.js'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Tiny style helpers ────────────────────────────────────────────────────────
const panelStyle = {
  position:'fixed', top:68, left:14, zIndex:999,
  width:350, background:'#080400F4',
  border:'1px solid #FF6B0033', borderRadius:10,
  padding:'1rem', fontFamily:'monospace', fontSize:'0.68rem',
  backdropFilter:'blur(10px)',
  maxHeight:'calc(100vh - 90px)', overflowY:'auto',
}
const btnStyle = {
  position:'fixed', bottom:88, left:14, zIndex:999,
  background:'#1A0A00CC', border:'1px solid #FF6B0055',
  color:'#FF6B00', fontFamily:'monospace', fontSize:'0.68rem',
  padding:'5px 10px', cursor:'pointer', borderRadius:5,
}

function Badge({ color, children }) {
  return (
    <span style={{
      fontSize:'0.58rem', padding:'2px 6px', borderRadius:100,
      background:`${color}22`, border:`1px solid ${color}55`, color,
    }}>
      {children}
    </span>
  )
}

function Grid({ children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px 8px', marginTop:4 }}>
      {children}
    </div>
  )
}

function Cell({ children, muted, warn, gold, bold }) {
  return (
    <span style={{
      fontSize:'0.62rem', lineHeight:1.8,
      color: muted ? '#6A4A30' : warn ? '#FF8800' : gold ? '#FFC200' : '#DDD',
      fontWeight: bold ? 'bold' : 'normal',
    }}>
      {children}
    </span>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
//  Live Y-Offset Tuner  (separate from the main panel)
//  Renders sliders for each stall so you can drag the model up/down in real-time
//  and copy the resulting positionY values.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext } from 'react'

export const YOffsetContext = createContext({})

export function YOffsetTuner() {
  const [offsets, setOffsets] = useState(() =>
    Object.fromEntries(STALLS.map(s => [s.id, s.positionY ?? 0]))
  )
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const set = (id, val) => setOffsets(prev => ({ ...prev, [id]: +val }))

  const snippet = STALLS.map(s =>
    `  positionY: ${offsets[s.id].toFixed(3)},  // ${s.name}`
  ).join('\n')

  const copy = () => {
    navigator.clipboard?.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Expose to scene via window so StallModel can read live values
  useEffect(() => {
    window.__yOffsets = offsets
  }, [offsets])

  if (!visible) return (
    <button onClick={() => setVisible(true)} style={{
      ...btnStyle, bottom: 122, background: '#001A0ACC',
      border: '1px solid #00C89644', color: '#00C896',
    }}>
      ↕ Y-Offset Tuner
    </button>
  )

  return (
    <div style={{
      position: 'fixed', bottom: 88, right: 14, zIndex: 999,
      width: 300, background: '#060E0ACC',
      border: '1px solid #00C89633', borderRadius: 10,
      padding: '1rem', fontFamily: 'monospace', fontSize: '0.68rem',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
        <span style={{ color: '#00C896', fontWeight: 'bold' }}>↕ Live Y-Offset Tuner</span>
        <button onClick={() => setVisible(false)}
          style={{ background:'none', border:'none', color:'#8B6040', cursor:'pointer', fontSize:'1.1rem' }}>×</button>
      </div>

      <div style={{ color: '#4A7A5A', fontSize: '0.6rem', marginBottom: 10 }}>
        Drag sliders to fix model floating/sinking. Copy when happy.
      </div>

      {STALLS.map(s => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 3 }}>
            <span style={{ color: s.color }}>{s.emoji} {s.name}</span>
            <span style={{ color: '#FFC200', fontWeight:'bold' }}>{Number(offsets[s.id]).toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={-3} max={6} step={0.01}
            value={offsets[s.id]}
            onChange={e => set(s.id, e.target.value)}
            style={{ width: '100%', accentColor: s.color, cursor: 'pointer' }}
          />
          <div style={{ display:'flex', justifyContent:'space-between', color:'#4A3020', fontSize:'0.55rem' }}>
            <span>-3 (push down)</span><span>0</span><span>+6 (lift up)</span>
          </div>
        </div>
      ))}

      <pre style={{
        background: '#030805', padding: '0.4rem 0.6rem', borderRadius: 4,
        color: '#00FF88', fontSize: '0.6rem', margin: '8px 0 6px',
        whiteSpace: 'pre-wrap',
      }}>{snippet}</pre>

      <button onClick={copy} style={{
        width: '100%',
        background: copied ? '#00884422' : '#00C89622',
        border: `1px solid ${copied ? '#00CC66' : '#00C89655'}`,
        color: copied ? '#00CC66' : '#00C896',
        padding: '5px 0', borderRadius: 4, cursor: 'pointer',
        fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 'bold',
      }}>
        {copied ? '✓ Copied!' : '📋 Copy positionY values'}
      </button>
    </div>
  )
}