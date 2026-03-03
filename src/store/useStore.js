import { create } from 'zustand'

const useStore = create((set, get) => ({
  // ── Time of Day ──
  timeMode: 'morning', // 'morning' | 'evening'
  setTimeMode: (mode) => set({ timeMode: mode }),

  // ── Active Stall ──
  activeStall: null,       // stall index or null
  focusedStall: null,      // stall index for camera focus
  setActiveStall: (idx) => set({ activeStall: idx }),
  setFocusedStall: (idx) => set({ focusedStall: idx }),
  clearActiveStall: () => set({ activeStall: null }),

  // ── Cart ──
  cart: [],
  totalPrice: 0,
  addToCart: (item) => set((state) => ({
    cart: [...state.cart, { ...item, id: Date.now() }],
    totalPrice: state.totalPrice + item.price,
  })),
  clearCart: () => set({ cart: [], totalPrice: 0 }),

  // ── Toast ──
  toast: null,
  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: null }), 2500)
  },

  // ── Loading ──
  isLoaded: false,
  setLoaded: () => set({ isLoaded: true }),
}))

export default useStore