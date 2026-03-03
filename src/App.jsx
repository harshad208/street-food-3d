import Scene from './components/Scene'
import HUD from './ui/HUD'
import DetailCard from './ui/DetailCard'
import LoadingScreen from './ui/LoadingScreen'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Canvas */}
      <Scene />

      {/* 2D React UI overlays */}
      <HUD />
      <DetailCard />
      <LoadingScreen />
    </div>
  )
}