# 🍛 Mumbai Street Food 3D

> Interactive 3D Street Food Experience — India Edition  
> Built with React + Three.js (React Three Fiber) + GLSL Shaders + GSAP

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

---

## 📁 Project Structure

```
street-food-3d/
├── public/
│   └── models/                    ← Place your GLB files here
│       ├── vada_pav_stall.glb
│       ├── chai_tapri.glb
│       ├── pav_bhaji.glb
│       └── juice_center.glb
│
├── src/
│   ├── main.jsx                   ← React entry point
│   ├── App.jsx                    ← Root: wires Scene + UI
│   │
│   ├── components/
│   │   ├── Scene.jsx              ← R3F Canvas, camera, OrbitControls
│   │   ├── StallModel.jsx         ← GLB loader + procedural fallback
│   │   ├── SteamEffect.jsx        ← Custom GLSL steam shader
│   │   ├── SkyLighting.jsx        ← Animated morning/evening lighting
│   │   └── StreetEnvironment.jsx  ← Ground, buildings, lamps, wires
│   │
│   ├── ui/
│   │   ├── HUD.jsx                ← Full overlay: topbar, nav, cart
│   │   ├── DetailCard.jsx         ← Item popup with ingredients + add
│   │   └── LoadingScreen.jsx      ← Animated loader
│   │
│   ├── shaders/
│   │   ├── steam.vert.glsl        ← Vertex: wavy rise animation
│   │   └── steam.frag.glsl        ← Fragment: noise-based wisps
│   │
│   ├── store/
│   │   └── useStore.js            ← Zustand: cart, stall, time, toast
│   │
│   └── data/
│       └── stalls.js              ← All stall data + GLB paths
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 🎮 Controls

| Action | Control |
|---|---|
| Orbit camera | Click + Drag |
| Zoom | Scroll wheel |
| Focus a stall | Click the stall OR sidebar dots |
| Open detail card | Click stall in 3D scene |
| Add to order | Click stall → "Add to Order" |
| Day/Night | Top-right toggle |
| Place order | Bottom-right button |

---

## 🗿 Adding GLB Models

### Where to get free GLB models

| Site | Best for |
|---|---|
| [sketchfab.com](https://sketchfab.com) | Detailed food stalls, street scenes |
| [poly.pizza](https://poly.pizza) | Simple CC0 food items |
| [quaternius.com](https://quaternius.com) | Stylized food packs |
| [kenney.nl](https://kenney.nl) | Game-ready props |
| [cgtrader.com](https://cgtrader.com) | Professional models (some free) |

### Steps

1. Download `.glb` file
2. Drop into `/public/models/`
3. Update the `glbPath` in `src/data/stalls.js`:

```js
{
  id: 'vada-pav',
  glbPath: '/models/vada_pav_stall.glb',  // ← your file name
  scale: 1.2,                               // ← adjust scale
  ...
}
```

4. The app auto-detects — if GLB loads, it shows it. If not, it falls back to the built-in procedural mesh.

### Recommended search terms on Sketchfab
- `"street food stall low poly"`
- `"indian food cart"`
- `"chai shop"`
- `"food truck"`

---

## ✨ Features

- ✅ **React Three Fiber** — declarative Three.js in React
- ✅ **GLB model loading** via `@react-three/drei useGLTF` with auto-fallback
- ✅ **Custom GLSL steam shader** — noise-based wispy steam rising from hot food
- ✅ **Morning ↔ Evening** lighting with smooth LERP transitions
- ✅ **Zustand state** — cart, active stall, time mode, toast
- ✅ **GSAP animations** — stall bounce on click, card entrance, toast
- ✅ **OrbitControls** with damping + camera focus transitions
- ✅ **HTML overlays in 3D** via `<Html>` from drei (floating labels)
- ✅ **Procedural fallback** — app works even without GLB models
- ✅ **Responsive + touch** support
- ✅ **Add to cart** with cart summary + order placement

---

## 🔧 Tech Stack

| Package | Version | Role |
|---|---|---|
| `react` | 18 | UI framework |
| `@react-three/fiber` | 8 | React renderer for Three.js |
| `@react-three/drei` | 9 | Helpers: OrbitControls, Html, useGLTF, Stars |
| `three` | 0.170 | 3D engine |
| `gsap` | 3.12 | Animations |
| `zustand` | 5 | State management |
| `vite` | 6 | Build tool |
| `vite-plugin-glsl` | 1.3 | Import `.glsl` files as strings |

---

## 🌶️ Customising

### Add a new stall
Open `src/data/stalls.js` and add a new object to the `STALLS` array.

### Change stall props (3D objects)
Edit the `StallProps` component in `src/components/StallModel.jsx`.

### Adjust steam intensity
In `src/components/SteamEffect.jsx`, tweak `count`, `opacity`, and `color` props.

### Tweak lighting
In `src/components/SkyLighting.jsx`, edit the `MORNING` and `EVENING` config objects.