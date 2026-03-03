import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import useStore from '../store/useStore'

export default function LoadingScreen() {
  const { isLoaded } = useStore()
  const [pct, setPct] = useState(0)
  const [hidden, setHidden] = useState(false)
  const ref = useRef()
  const emojis = ['🥖', '☕', '🍲', '🥤', '🌶️', '🧅', '🫛']
  const [emojiIdx, setEmojiIdx] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      setPct(p => {
        const next = Math.min(100, p + Math.random() * 5 + 1.5)
        return next
      })
      setEmojiIdx(i => (i + 1) % emojis.length)
    }, 60)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (pct >= 100 || isLoaded) {
      setTimeout(() => {
        if (ref.current) {
          gsap.to(ref.current, {
            opacity: 0, duration: 0.9, ease: 'power2.inOut',
            onComplete: () => setHidden(true),
          })
        }
      }, 300)
    }
  }, [pct, isLoaded])

  if (hidden) return null

  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#1A0A00',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* Animated emoji */}
      <div style={{
        fontSize: '4.5rem',
        animation: 'loadBounce 0.65s infinite alternate',
        marginBottom: '0.5rem',
        filter: 'drop-shadow(0 0 20px #FF6B0088)',
      }}>
        {emojis[emojiIdx]}
      </div>

      <div style={{
        fontFamily: "'Baloo 2', cursive",
        fontSize: '2.2rem', fontWeight: 800,
        color: '#FF6B00',
        textShadow: '0 0 30px #FF6B0077',
        letterSpacing: '0.04em',
        marginBottom: 4,
      }}>
        MumbaiKhana 3D
      </div>

      <div style={{
        fontSize: '0.7rem', color: '#8B6040',
        letterSpacing: '0.35em', textTransform: 'uppercase',
        marginBottom: '2.5rem',
      }}>
        Loading Street Food Experience...
      </div>

      {/* Progress bar */}
      <div style={{
        width: 280, height: 3,
        background: '#2A1500',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #FF6B00, #FFC200)',
          boxShadow: '0 0 12px #FF6B00',
          borderRadius: 2,
          transition: 'width 0.06s linear',
        }} />
      </div>

      <div style={{
        fontSize: '0.68rem', color: '#8B6040',
        letterSpacing: '0.2em', marginTop: 10,
      }}>
        {Math.floor(pct)}%
      </div>

      {/* Food labels cycling */}
      <div style={{
        position: 'absolute', bottom: 40,
        display: 'flex', gap: 20,
        fontSize: '0.65rem', color: '#5A3A18',
        letterSpacing: '0.2em',
      }}>
        {['VADA PAV', 'CHAI', 'PAV BHAJI', 'JUICE'].map(n => (
          <span key={n}>{n}</span>
        ))}
      </div>

      <style>{`
        @keyframes loadBounce {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-14px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}