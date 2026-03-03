import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useStore from '../store/useStore'
import { STALLS } from '../data/stalls'

export default function DetailCard() {
  const { activeStall, clearActiveStall, setFocusedStall, addToCart, showToast } = useStore()
  const cardRef = useRef()
  const isVisible = activeStall !== null
  const stall = isVisible ? STALLS[activeStall] : null

  useEffect(() => {
    if (!cardRef.current) return
    if (isVisible) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.75, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.7)' }
      )
    } else {
      gsap.to(cardRef.current, { opacity: 0, scale: 0.8, y: 20, duration: 0.25 })
    }
  }, [isVisible, activeStall])

  const handleAdd = () => {
    if (!stall) return
    addToCart({ name: stall.name, emoji: stall.emoji, price: stall.price, color: stall.color })
    showToast(`${stall.emoji} ${stall.name} added to order!`)
    handleClose()
  }

  const handleClose = () => {
    clearActiveStall()
    setFocusedStall(null)
  }

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 360,
        background: 'linear-gradient(145deg, #1A0A00F5, #0D0500F5)',
        border: `1px solid ${stall?.color ?? '#FF6B00'}44`,
        borderRadius: 20,
        padding: '2rem',
        zIndex: 50,
        opacity: 0,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 24px 60px #00000088, 0 0 40px ${stall?.color ?? '#FF6B00'}22`,
        pointerEvents: isVisible ? 'all' : 'none',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {stall && (
        <>
          {/* Close */}
          <button onClick={handleClose} style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none',
            color: '#8B6040', fontSize: '1.2rem',
            cursor: 'pointer', lineHeight: 1,
            transition: 'color 0.2s',
          }}
            onMouseOver={e => e.target.style.color = stall.color}
            onMouseOut={e => e.target.style.color = '#8B6040'}
          >✕</button>

          {/* Emoji */}
          <div style={{ fontSize: '3.8rem', textAlign: 'center', marginBottom: 6 }}>
            {stall.emoji}
          </div>

          {/* Name */}
          <div style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '1.7rem', fontWeight: 800,
            color: stall.color,
            textAlign: 'center',
            textShadow: `0 0 18px ${stall.color}66`,
            marginBottom: 4,
          }}>
            {stall.name}
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: '0.72rem', color: '#8B6040',
            textAlign: 'center', letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}>
            {stall.tagline}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: '1rem',
            justifyContent: 'center',
          }}>
            {[
              { label: 'CALORIES', val: stall.calories },
              { label: 'PREP', val: stall.prepTime },
            ].map(({ label, val }) => (
              <div key={label} style={{
                background: '#2A150066',
                border: `1px solid ${stall.color}22`,
                borderRadius: 8,
                padding: '0.3rem 0.8rem',
                textAlign: 'center',
                flex: 1,
              }}>
                <div style={{ fontSize: '0.55rem', color: '#8B6040', letterSpacing: '0.25em' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: '#FFF8E7', fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{
            fontSize: '0.72rem', color: '#C8A080',
            lineHeight: 1.6, marginBottom: '1.1rem',
          }}>
            {stall.description}
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: '1.3rem' }}>
            <div style={{ fontSize: '0.58rem', color: '#8B6040', letterSpacing: '0.3em', marginBottom: 8 }}>
              INGREDIENTS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {stall.ingredients.map(ing => (
                <span key={ing} style={{
                  fontSize: '0.62rem',
                  padding: '3px 9px',
                  borderRadius: 100,
                  background: '#2A150077',
                  border: `1px solid ${stall.color}33`,
                  color: '#FFF8E7',
                }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Price + Add */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: '1.8rem', fontWeight: 800,
              color: '#FFC200',
              textShadow: '0 0 12px #FFC20055',
            }}>
              ₹{stall.price}
            </div>
            <button
              onClick={handleAdd}
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1rem', fontWeight: 800,
                background: `linear-gradient(135deg, ${stall.color}, #FFC200)`,
                color: '#1A0A00',
                border: 'none', cursor: 'pointer',
                padding: '0.55rem 1.6rem',
                borderRadius: 10,
                letterSpacing: '0.03em',
                boxShadow: `0 4px 20px ${stall.color}55`,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.target.style.transform = 'scale(1.06)'; e.target.style.boxShadow = `0 6px 28px ${stall.color}88` }}
              onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = `0 4px 20px ${stall.color}55` }}
            >
              + Add to Order
            </button>
          </div>
        </>
      )}
    </div>
  )
}