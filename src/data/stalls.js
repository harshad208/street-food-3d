// ─────────────────────────────────────────────────────────────────────────────
//  STALL DATA — scales & positionY corrected from latest debug panel readings
//
//  positionY calculation:
//    If model sinks underground → positive value lifts it up
//    If model floats above ground → negative value pushes it down
//    Start with: (raw_height * scale) / 2  then fine-tune with Y-Offset Tuner
//
//  vada-pav:    h:3.185  * 0.68221 / 2 = 1.087  (test both 0 and 1.087)
//  chai-tapri:  h:59.678 * 0.05362 / 2 = 1.599  (1 mesh = likely base only — see note)
//  pav-bhaji:   h:2.669  * 0.95304 / 2 = 1.271
//  juice-center:h:13.097 * 0.16706 / 2 = 1.094
// ─────────────────────────────────────────────────────────────────────────────

export const STALLS = [
  {
    id: 'vada-pav',
    name: 'Vada Pav',
    emoji: '🥖',
    tagline: "Mumbai's soul — crispy batata vada in a soft pav",
    description: "The original Mumbai burger. A spiced potato fritter (vada) sandwiched in a soft bread roll (pav) with three chutneys. Born in 1971, eaten by millions daily.",
    ingredients: ['Batata Vada', 'Pav Bun', 'Green Chutney', 'Tamarind Chutney', 'Garlic Chutney', 'Mustard Seeds', 'Curry Leaves', 'Hing'],
    price: 15,
    calories: 286,
    prepTime: '5 mins',
    position: [-9, 0, 0],
    cameraOffset: [0, 3, 8],
    glbPath: '/models/vada_pav_stall.glb',
    scale: 1.25,
    rotation: [0, 0, 0],
    positionY: 0, 
    steamPosition: [0, 2.5, 0],
    steamColor: [1, 0.9, 0.7],
    color: '#E8A020',
    accentColor: '#C84010',
    lightColor: '#FF8800',
  },

  {
    id: 'chai-tapri',
    name: 'Chai Tapri',
    emoji: '☕',
    tagline: "Cutting chai — the heartbeat of every Mumbaikar",
    description: "Strong, milky, spiced tea served in tiny glasses. The 'cutting' means half a cup — enough to share, enough to reset. Every corner has one.",
    ingredients: ['Masala Tea Leaves', 'Buffalo Milk', 'Ginger', 'Cardamom', 'Sugar', 'Cinnamon', 'Cloves', 'Fennel'],
    price: 10,
    calories: 90,
    prepTime: '3 mins',
    position: [-3, 0, 0],
    cameraOffset: [0, 3, 8],
    glbPath: '/models/chai_tapri.glb',
    scale: 0.06366,
    rotation: [0, Math.PI, 0] ,
    positionY: 1.90,
    steamPosition: [0, 2.8, 0],
    steamColor: [0.95, 0.88, 0.82],
    color: '#C87832',
    accentColor: '#7A3A10',
    lightColor: '#FF7722',
  },

  {
    id: 'pav-bhaji',
    name: 'Pav Bhaji',
    emoji: '🍲',
    tagline: "Buttery mashed sabzi with toasted pav — legend since 1850s",
    description: "A thick vegetable curry (bhaji) cooked on a massive iron tawa with a mountain of butter, served with toasted pav. Mumbai's greatest gift to Indian cuisine.",
    ingredients: ['Mixed Vegetables', 'Pav Bread', 'Butter', 'Pav Bhaji Masala', 'Onion', 'Tomato', 'Capsicum', 'Lemon', 'Coriander'],
    price: 60,
    calories: 450,
    prepTime: '10 mins',
    position: [3, 0, 0],
    cameraOffset: [0, 3, 8],
    glbPath: '/models/pav_bhaji.glb',
    scale: 1.4,
    rotation: [0, Math.PI / 2, 0],
    positionY: 1.27,     
    steamPosition: [0, 2.4, 0],
    steamColor: [1.0, 0.75, 0.55],
    color: '#FF6B00',
    accentColor: '#CC2200',
    lightColor: '#FF4400',
  },

  {
    id: 'juice-center',
    name: 'Juice Center',
    emoji: '🥤',
    tagline: "Fresh sugarcane & seasonal fruit juices — ₹20 only",
    description: "Hand-pressed sugarcane juice, mosambi (sweet lime), pomegranate, and seasonal blends. Served with black salt and a squeeze of lemon. Pure Mumbai summer.",
    ingredients: ['Sugarcane', 'Mosambi', 'Pomegranate', 'Mango Pulp', 'Black Salt', 'Chaat Masala', 'Ice Cubes', 'Lemon'],
    price: 20,
    calories: 120,
    prepTime: '2 mins',
    position: [9, 0, 0],
    cameraOffset: [0, 3, 8],
    glbPath: '/models/juice_center.glb',
    scale: 0.212,
    rotation: [0, 0, 0],
    positionY: 1.09,
    steamPosition: [0, 2.2, 0],
    steamColor: [0.82, 1.0, 0.9],
    color: '#00C896',
    accentColor: '#006644',
    lightColor: '#00FF99',
  },
]