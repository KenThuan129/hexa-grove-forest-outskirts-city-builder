# 🏝️ Archipelago Frontiers: Hexagonal Settlement Odyssey

A tactical, cozy, low-poly 3D hexagonal strategy and island settlement puzzle game built with React, Three.js, and TypeScript.

---

## 🎮 System Requirements & Compatibility

This game is engineered to run seamlessly across desktops, laptops, tablets, and mobile devices.

### Minimum System Requirements
| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11, macOS 11+, Linux, Android 8+, iOS 14+ | Windows 11, macOS 13+, iOS 16+, Android 12+ |
| **Browser** | Chrome 90+, Edge 90+, Firefox 88+, Safari 14+, Mobile Chrome/Safari | Latest Chrome, Edge, Safari, or Firefox |
| **Graphics** | WebGL 1.0 compatible GPU / Integrated Graphics (Intel HD 4000+) | WebGL 2.0 with Hardware Acceleration enabled |
| **Memory (RAM)** | 2 GB RAM | 4 GB+ RAM |
| **Input** | Touchscreen OR Mouse & Keyboard | Mouse & Keyboard (Desktop) or Multi-touch (Mobile) |

### ⚡ Troubleshooting: Fixing Black Screens or Performance Lag

If you or a player experience a black screen or low frame rates:

1. **Enable Hardware Acceleration in Your Browser**:
   - **Google Chrome / Microsoft Edge**: Go to `Settings` → `System` (or search "Hardware acceleration") → Turn on **"Use graphics acceleration when available"** → Restart browser.
   - **Mozilla Firefox**: Go to `Settings` → `General` → `Performance` → Uncheck "Use recommended performance settings" → Check **"Use hardware acceleration when available"**.
   - **Apple Safari**: Hardware acceleration is enabled by default in macOS/iOS Safari (ensure iOS/macOS is updated).
2. **WebGL Context Diagnostics**:
   - Verify your browser supports WebGL by visiting [get.webgl.org](https://get.webgl.org/).
   - If WebGL is blocked, enter `chrome://flags` in Chrome/Edge, search for `Override software rendering list`, set to **Enabled**, and restart.
3. **Low-End Device Adaptive Mode**:
   - The game engine automatically detects low-spec devices (e.g. CPU cores ≤ 4 or low memory) and reduces shadow map resolutions, optimizes pixel ratios (max 1.5x DPR), and disables expensive post-processing to ensure consistent 60 FPS gameplay.

---

## 🕹️ Controls & Shortcuts

| Action | Mouse / Keyboard (Desktop) | Touch / Gesture (Mobile & Tablet) |
| :--- | :--- | :--- |
| **Place Tile / Cluster** | Left Click on target hex cell | Tap target hex cell |
| **Drag & Drop Placement** | Click and drag piece from bottom tray to board | Drag piece from bottom tray to board |
| **Rotate Multi-Hex Cluster** | Press **`[R]`** key OR click the **`Rotate 60°`** button | Tap the **`Rotate 60°`** button in the tray |
| **Rotate Turntable Zone** | Press **`[T]`** key OR click the Turntable dial | Tap the Turntable dial on the board |
| **Pan Camera** | Click and drag on empty terrain / ocean | One-finger drag on terrain / ocean |
| **Zoom Camera** | Mouse Scroll Wheel | Two-finger Pinch In / Pinch Out |
| **Retrieve / Relocate Tile** | Right-click placed tile OR click placed piece | Tap placed piece to pick up; right-click / tap return to tray |
| **Clean UI / Zen Mode** | Press **`[H]`** key | Tap Zen / Eye icon in bottom-left |

---

## 🧩 Gameplay Rules & Mechanics

### 1. Building Quotas & Color Resonance
- **Par Limit**: Each phase specifies a target tile quota (e.g. 5 tiles). Placing tiles at or under the Par count grants optimal Settlement points.
- **Color Zones**: Settle corresponding color pieces on designated target zones:
  - 🟡 **Amber**: Sunlit Hearth & Crop Farms
  - 🟢 **Emerald**: Verdant Groves & Ancient Pines
  - 🔵 **Sapphire**: Aquifer Springs & Water Channels
  - 🔴 **Ruby**: Terracotta Forges & Stoneworks
- **River Barriers**: Natural waterways cannot be built upon.

### 2. Multi-Phase Expansion (Levels 4+)
- Conquering the initial clearing pushes back the surrounding forest, revealing new territorial hexes, extra color zones, and elevated quotas in subsequent phases.

### 3. Settlement Penalties
- **Overlap (-100 pts)**: Multiple tiles placed on the exact same hex.
- **Overuse (-60 pts/tile)**: Exceeding the phase's Par building quota.
- **Disconnect (-80 pts)**: Isolated buildings that lack a continuous hex pathway back to the settlement core.
- **Off-Map (-120 pts)**: Pieces placed outside discovered boundary bounds or on riverways.

### 4. Chronicle Vault & Penalty Bypass Free Passes
- As you complete levels, unlock illustrated Memory Chronicles in the **Memories Gallery**.
- Assign earned memories to permanent **Penalty Free Passes** (+1 Overlap, Overuse, Disconnect, or Off-Map free pass per level).

### 5. Island Sanctuary & Idle Economy
- Earn **Coins** from level completions and star rating milestones.
- Upgrade resort island structures (Windmills, Waterwheels, Lighthouses, Botanical Villas) to generate passive gold and leaves.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React 18 with TypeScript
- **3D Graphics Engine**: Three.js (Procedural geometries, ACES Filmic tone mapping, PCF shadows, zero-allocation render loop)
- **Audio**: Web Audio API Sound Synthesizer (Zero asset latency with synthetic polyphonic arpeggios and user gesture unlock)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Confetti**: Canvas-Confetti

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
