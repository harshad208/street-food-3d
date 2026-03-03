import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useStore from '../store/useStore'
import { STALLS } from '../data/stalls'

// ─── TIME TOGGLE ──────────────────────────────────────────────────────────────
function TimeToggle() {
  const { timeMode, setTimeMode } = useStore()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#2A150088',
      border: '1px solid #FF6B0033',
      borderRadius: 100,
      padding: '4px 5px',
    }}>
      {[['morning', '☀️', 'Morning'], ['evening', '🌆', 'Evening']].map(([mode, icon, label]) => (
        <button
          key={mode}
          onClick={() => setTimeMode(mode)}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.65rem', letterSpacing: '0.12em',
            padding: '5px 14px', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: timeMode === mode ? '#FF6B00' : 'transparent',
            color: timeMode === mode ? '#fff' : '#8B6040',
            boxShadow: timeMode === mode ? '0 0 14px #FF6B0066' : 'none',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  )
}

// ─── STALL NAV DOTS ───────────────────────────────────────────────────────────
function StallNav() {
  const { focusedStall, setFocusedStall, setActiveStall } = useStore()

  return (
    <div style={{
      position: 'absolute', right: 20, top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {STALLS.map((stall, i) => (
        <div
          key={stall.id}
          onClick={() => { setFocusedStall(i); setActiveStall(i) }}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            border: `2px solid ${focusedStall === i ? stall.color : '#FF6B0033'}`,
            background: focusedStall === i ? `${stall.color}22` : '#1A0A00AA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: focusedStall === i ? `0 0 16px ${stall.color}66` : 'none',
            transform: focusedStall === i ? 'scale(1.18)' : 'scale(1)',
            position: 'relative',
          }}
          onMouseOver={e => { if (focusedStall !== i) e.currentTarget.style.transform = 'scale(1.12)' }}
          onMouseOut={e => { if (focusedStall !== i) e.currentTarget.style.transform = 'scale(1)' }}
          title={stall.name}
        >
          {stall.emoji}
          {/* Label */}
          <div style={{
            position: 'absolute', right: 46,
            fontSize: '0.6rem', color: stall.color,
            whiteSpace: 'nowrap',
            background: '#1A0A00EE',
            padding: '2px 8px', borderRadius: 4,
            border: `1px solid ${stall.color}33`,
            opacity: 0, transition: 'opacity 0.2s',
            pointerEvents: 'none',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '0.1em',
          }}
            className="stall-label"
          >
            {stall.name}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── CART PANEL ───────────────────────────────────────────────────────────────
function CartPanel() {
  const { cart, totalPrice, clearCart, showToast } = useStore()

  const placeOrder = () => {
    if (cart.length === 0) { showToast('Add something first! 😋'); return }
    showToast(`🛵 Order on the way! Total ₹${totalPrice}`)
    clearCart()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5,
      maxWidth: 230,
    }}>
      <div style={{ fontSize: '0.55rem', color: '#8B604066', letterSpacing: '0.3em' }}>
        YOUR ORDER
      </div>

      {/* Items (last 3) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', width: '100%' }}>
        {cart.slice(-3).map(item => (
          <div key={item.id} style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.72rem', color: '#FFF8E7',
            background: '#2A150088',
            border: `1px solid ${item.color ?? '#FF6B00'}22`,
            borderRadius: 6,
            padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: 7,
            animation: 'slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {item.emoji} {item.name}
            <span style={{ color: '#FFC200', fontSize: '0.62rem' }}>₹{item.price}</span>
          </div>
        ))}
        {cart.length > 3 && (
          <div style={{ fontSize: '0.58rem', color: '#8B6040' }}>+{cart.length - 3} more items</div>
        )}
      </div>

      {cart.length > 0 && (
        <div style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: '0.85rem', fontWeight: 800,
          color: '#FFC200', letterSpacing: '0.05em',
        }}>
          Total: ₹{totalPrice}
        </div>
      )}

      <button
        onClick={placeOrder}
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: '0.92rem', fontWeight: 800,
          color: '#1A0A00',
          background: cart.length > 0
            ? 'linear-gradient(135deg, #FF6B00, #FFC200)'
            : '#3A2200',
          border: 'none', cursor: cart.length > 0 ? 'pointer' : 'default',
          padding: '0.55rem 1.6rem',
          borderRadius: 8, letterSpacing: '0.04em',
          boxShadow: cart.length > 0 ? '0 4px 20px #FF6B0055' : 'none',
          transition: 'all 0.3s',
          opacity: cart.length > 0 ? 1 : 0.5,
        }}
        onMouseOver={e => { if (cart.length > 0) e.target.style.transform = 'translateY(-2px)' }}
        onMouseOut={e => { e.target.style.transform = 'translateY(0)' }}
      >
        🛵 Place Order {cart.length > 0 ? `₹${totalPrice}` : ''}
      </button>
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast() {
  const { toast } = useStore()
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    if (toast) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 16, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }
      )
    } else {
      gsap.to(ref.current, { opacity: 0, y: 10, duration: 0.2 })
    }
  }, [toast])

  return (
    <div ref={ref} style={{
      position: 'fixed', bottom: '6.5rem', left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #FF6B00, #FFC200)',
      color: '#1A0A00',
      fontFamily: "'Baloo 2', cursive",
      fontSize: '0.95rem', fontWeight: 800,
      padding: '0.55rem 1.6rem',
      borderRadius: 100,
      zIndex: 80, opacity: 0,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px #FF6B0055',
    }}>
      {toast ?? ''}
    </div>
  )
}

// ─── MAIN HUD ─────────────────────────────────────────────────────────────────
export default function HUD() {
  const { isLoaded, focusedStall, setFocusedStall, clearActiveStall } = useStore()
  const hudRef = useRef()

  useEffect(() => {
    if (!hudRef.current) return
    if (isLoaded) {
      gsap.to(hudRef.current, { opacity: 1, duration: 1.2, delay: 0.3 })
    }
  }, [isLoaded])

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px) scale(0.85); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div
        ref={hudRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 10,
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        {/* ── TOP BAR ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #1A0A00CC 0%, transparent 100%)',
          borderBottom: '1px solid #FF6B0011',
          pointerEvents: 'all',
        }}>
          <div>
            <div style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: '1.4rem', fontWeight: 800,
              color: '#FF6B00',
              textShadow: '0 0 20px #FF6B0066',
              letterSpacing: '0.02em',
            }}>
              Mumbai<span style={{ color: '#FFC200' }}>Khana</span> 3D
            </div>
            <div style={{
              fontSize: '0.58rem', color: '#8B604066',
              letterSpacing: '0.3em', marginTop: -3,
            }}>
              INTERACTIVE STREET FOOD EXPERIENCE
            </div>
          </div>

          <TimeToggle />
        </div>

        {/* ── STALL NAV ── */}
        <div style={{ pointerEvents: 'all' }}>
          <StallNav />
        </div>

        {/* ── LEFT HINT ── */}
        {focusedStall !== null && (
          <div
            style={{
              position: 'absolute', top: '50%', left: 20,
              transform: 'translateY(-50%)',
              pointerEvents: 'all',
              cursor: 'pointer',
            }}
            onClick={() => { setFocusedStall(null); clearActiveStall() }}
          >
            <div style={{
              fontSize: '0.6rem', color: '#FF6B0088',
              letterSpacing: '0.2em',
              fontFamily: "'Poppins', sans-serif",
              background: '#1A0A00AA',
              border: '1px solid #FF6B0033',
              borderRadius: 6,
              padding: '5px 10px',
            }}>
              ← BACK
            </div>
          </div>
        )}

        {/* ── BOTTOM PANEL ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '1.2rem 1.5rem',
          background: 'linear-gradient(0deg, #1A0A00EE 0%, transparent 100%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          pointerEvents: 'all',
        }}>
          <div>
            <div style={{
              fontSize: '0.58rem', color: '#8B604055',
              letterSpacing: '0.25em',
              fontFamily: "'Poppins', sans-serif",
              marginBottom: 4,
            }}>
              DRAG TO EXPLORE · CLICK STALL TO ORDER
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {STALLS.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => { setFocusedStall(i) }}
                  style={{
                    fontSize: '0.6rem', color: '#FF6B0077',
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    padding: '2px 0',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = s.color}
                  onMouseOut={e => e.currentTarget.style.color = '#FF6B0077'}
                >
                  {s.emoji} {s.name}
                </div>
              ))}
            </div>
          </div>

          <CartPanel />
        </div>

        {/* ── CORNER ACCENTS ── */}
        {[
          { top: 5, left: 5, borderTop: '1px solid #FF6B0044', borderLeft: '1px solid #FF6B0044' },
          { top: 5, right: 5, borderTop: '1px solid #FF6B0044', borderRight: '1px solid #FF6B0044' },
          { bottom: 5, left: 5, borderBottom: '1px solid #FF6B0044', borderLeft: '1px solid #FF6B0044' },
          { bottom: 5, right: 5, borderBottom: '1px solid #FF6B0044', borderRight: '1px solid #FF6B0044' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 18, height: 18, ...s }} />
        ))}
      </div>

      {/* ── TOAST (outside HUD so always visible) ── */}
      <Toast />
    </>
  )
}