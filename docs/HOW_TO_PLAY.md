# Hexa — How to Play

> A cozy hex-grid puzzle where you build a sanctuary for weary travelers in the Dream Forest.

---

## Table of Contents

1. [The Basics](#1-the-basics)
2. [Two Game Modes](#2-two-game-modes)
3. [Core Mechanics](#3-core-mechanics)
4. [Scoring & Stars](#4-scoring--stars)
5. [Penalties](#5-penalties)
6. [Tiles & Clusters](#6-tiles--clusters)
7. [Special Terrain](#7-special-terrain)
8. [Advanced Mechanics](#8-advanced-mechanics)
9. [Boss Battles](#9-boss-battles)
10. [Economy & Progression](#10-economy--progression)
11. [Memories & Penalty Bypasses](#11-memories--penalty-bypasses)
12. [Controls & Shortcuts](#12-controls--shortcuts)
13. [Guest vs. Signed-In](#13-guest-vs-signed-in)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. The Basics

You are **the Young Pioneer**, building a sanctuary in the Dream Forest for people escaping burnout and modern life.

### Goal
Fill every **colored zone** on the board with tiles of the matching color, then complete the phase.

### The Board
- Board is a hexagonal grid of cells
- Each cell is either **neutral** (gray, any tile) or **colored** (requires a specific tile color)
- Some phases also have **fog cells**, **river cells**, or **rotation zones**

### One Turn
1. Pick a tile from the tray (bottom of screen)
2. Click a valid hex on the board to place it
3. Repeat until all colored zones are fulfilled
4. Click **Complete** or **Expand** to advance

---

## 2. Two Game Modes

Choose one at the Home screen before starting a level.

| Feature | **Building Mode** | **Challenger Mode** |
|---|---|---|
| Primary resource | 💡 Lightbulbs | Building Quota (Par) |
| Penalties active | No | Yes |
| Star rating | Disabled | Active (★1 / ★2 / ★3) |
| Score formula | Disabled | Active |
| Recommended for | Relaxing, exploration | Mastery, challenges |

**Tip:** Switch anytime from Home or Settings. Progress is saved independently.

### Additional Toggle: Casual vs Try-Hard

Independent from Building/Challenger, there is a **difficulty toggle**:

- **Casual** (default): Zero requirements to pass — just complete zones.
- **Try-Hard** (unlocks after Level 40, requires Admin auth): Requires at least **1★** AND **Mastery Challenge** completed to advance.

---

## 3. Core Mechanics

### Tile Placement
Click a tile to pick it up → click a board hex to place it.

- **Left-click** a placed tile → pick it back up
- **Right-click** a placed tile → return to tray
- **Right-click** while holding a tile → cancel placement

### Color Matching
- **Neutral (gray)** cells: any tile works
- **Colored** cells: only a tile of the **exact matching color** works
  - 🟡 Amber (golden sun)
  - 🟢 Emerald (forest green)
  - 🔵 Sapphire (water blue)
  - 🔴 Ruby (fire red)

Attempting to place a mismatched tile on a colored cell is blocked.

### Phase Expansion
Each level has **1 to 5 phases**.

- Complete the current phase's colored zones → button turns into **Expand**
- Clicking Expand unlocks the next phase's terrain (new cells rise up)
- Complete the **final phase** → level victory

### Connectivity
All placed tiles must form **one connected cluster**. Isolated islands trigger the **Disconnect** penalty.

Bridges are exempt — they can connect across water.

---

## 4. Scoring & Stars

Challenger Mode only.

### Score Formula

```text
Score = (Tiles Placed × 220)
      + (Zone Tiles Matched × 450)
      + 300  (if within Par)
      − Penalty Deductions
      + 600  (if Mastery Challenge completed)
```

### Star Thresholds

Each level defines **three star targets** (visible in Right Sidebar):

- ★1: Lowest threshold
- ★2: Mid threshold
- ★3: Highest threshold

Stars are earned **live** as your score climbs. Dropping below a threshold (e.g., by incurring a penalty) loses the star.

### Penalty Deductions

| Penalty | Deduction |
|---|---|
| Overuse (per tile over Par) | -150 |
| Disconnect (per component) | -120 |
| Overlap (per stacked tile) | -100 |
| Off-Map (per dropped tile) | -80 |
| Falsehood | Score drops to **0** |

### Mastery Challenge
Levels 13+ have a **Mastery Challenge**:
- Not required in Casual Mode
- **Required** in Try-Hard Mode to advance
- Grants **+600 bonus score** when completed

Example types: "Zero disconnects", "Score ≥ 2500", "Use at least 1 road", etc.

---

## 5. Penalties

### The 5 Penalties

**1. Overuse (-150 pts)**  
Exceeding the Par limit. Par = expected tile count for a clean build.

**2. Disconnect (-120 pts)**  
Placing tiles isolated from the main connected cluster.

**3. Overlap (-100 pts)**  
Stacking a tile on an already-occupied cell.  
- *Fix:* remove the top tile (right-click it)
- *Effect:* the penalty only triggers if you leave the overlap in place when completing the phase

**4. Off-Map (-80 pts)**  
Placing a tile outside the valid unlocked boundary.

**5. Falsehood (score → 0)**  
Placing a tile on a **fog cell** that is NOT connected to safe ground.  
- *Fix:* remove the tile or connect it to a safe area
- *Effect:* Score becomes 0 until resolved

### Strict Penalty Limit
Starting **Level 20**, penalties are capped (usually 3 total). Exceed the limit → **score = 0** and disqualification. A shield icon on the sidebar shows the limit.

### Memory Bypasses
Each completed Memory Picture grants **+1 free pass** for a specific penalty type (max 3 per type). Free passes absorb penalties automatically — no score deduction.

---

## 6. Tiles & Clusters

### Single Tiles
One hex. Simple, precise.

| Piece | Description |
|---|---|
| Timber Cottage (neutral) | Any gray cell |
| Sunlit Townhall (amber) | Amber cells |
| Verdant Shelter (emerald) | Emerald cells |
| Aquifer Lodge (sapphire) | Sapphire cells |
| Terracotta Hearth (ruby) | Ruby cells |

### Multi-Hex Clusters
2 to 6 hexes bound as one piece. Must fit entirely — no partial placement.

| Cluster Type | Hexes | Notes |
|---|---|---|
| **Duo** | 2 | Easy to place |
| **Triad** | 3 | Flexible shapes |
| **Quad** | 4 | Wider footprint |
| **Pentad** | 5 | Big anchor |
| **Blossom** | 6 | Ring-shaped mega-cluster |

**Rotate:** While holding a cluster, press **R** or click **Rotate Cluster** to rotate 60° clockwise.

**Split (booster):** Use **Cluster Splitter** to break a cluster into single hexes.

### Roads & Bridges
**Roads** connect settlements. A road must be placed adjacent to a House, Tower, Landmark, Road, or Bridge — otherwise it's invalid.

**Bridges** span water and rivers. Safe from off-map penalties.

**Junctions** (special single-hex pieces):
- 3-way junction → requires 3 adjacent roads
- 4-way crossroads → requires 4 adjacent roads
- Grand roundabout → requires 5 adjacent roads

Roads and bridges fuse visually when adjacent to form continuous networks.

---

## 7. Special Terrain

### Fog Cells (purple, Level 21+)
Preview next phase boundaries. You can place tiles on fog cells **only if connected to safe ground**.

- ✅ Connected → safe, no penalty, +3 bonus safe tiles next phase
- ❌ Isolated → **Falsehood penalty** (score → 0)

Fog cells can reveal future strategy — plan ahead!

### River Cells (blue, Level 22+)
Unbuildable natural water barriers. Only **Bridges** can span river cells. Trying to place any other tile on a river cell is blocked.

### Rotation Zones (cyan, Level 11+)
"Turntables" that rotate **single tiles** (not clusters) by 60° around their center.

- Click the 3D dial or press **T**
- Level 20+: **Also rotates the color zone requirements** underneath
- Clusters sitting on turntables **do not move** — only single tiles rotate

### Pre-Placed Roads (locked, traffic attack levels)
Some roads are pre-built and cannot be moved (locked by "Town Council"). They count as existing infrastructure.

### Traffic Attack Levels (36+)
Levels with **Transit Charter requirements**. You must place houses adjacent to specific pre-placed road segments. Check the sidebar for progress bars (e.g., "2/4 houses").

---

## 8. Advanced Mechanics

### Zone Inspection (Boss levels only)
Hover (desktop) or long-press (mobile) a colored zone **without holding a tile** to **inspect** it:

- Amber/Ruby → +35 Popularity
- Sapphire → +35 Ambience
- Emerald → +1 Bonus Slot

Inspections feed your stats in the Boss Battle. Uninspected zones = weaker start.

### Synthesia Multiplier (Boss levels)
Fulfilling unique colored zones adds a multiplier to your boss stats: **+0.05 per zone**, capped at **1.25×**.

### Penalty Bypasses (Memory rewards)
Each completed Memory grants one free pass per level for a specific penalty type. Max 3 per type. Check the sidebar for shield icons — each shield = 1 free pass active.

### Par Expander (Booster)
Adds **+5 free tiles** to the current level's par, letting you build beyond the quota without overuse penalty.

### Titan Shield (Booster)
Immunity from **all penalties** for the rest of the level, **+500 score surge**. Can't be used if a penalty was already incurred in the current attempt.

### Mist Piercer (Booster)
Instantly converts **all fog cells** on the board into safe ground (no penalty risk).

### Chisel Brush (Booster)
Restores the most recent misplaced tile (or top tile of an overlap). Zero penalty applied.

---

## 9. Boss Battles

Boss levels (25, 51) feature **Tycoon Sterling Vance** and **Baron Rexford Throttle** in a **Commercial Showdown**.

### Before Battle
- Fill colored zones as usual
- **Inspect zones** to earn extra Popularity / Ambience / Bonus Slots
- Complete phases
- Enter the Showdown from the sidebar

### Battle Rules

**Win conditions** (any of these):
1. Reduce boss Popularity OR Ambience to **0**
2. Capture **all 500 guests** in the market

**Lose conditions:**
1. Your Popularity OR Ambience drops to **0**
2. Boss captures all 500 guests

### Milestones (25% / 55% / 85%)
At each milestone, **Bonus Breakthrough** modal appears. Choose:
- **1 Primary Benefit** (Boost or Reduction)
- **1 Pace Definder** (optional, coexists with Primary)

**Boost examples:** +50 Popularity, +50 Ambience, +35 both  
**Reduction examples:** -40 boss Popularity, -40 boss Ambience  
**Pace Definder examples:** +45 surge this phase, +12 recurring in other phases

### Boss Counter-Attacks
- **40% mark — Executive Order:** Boss gains +50 Pop & +50 Amb, doubles drain for 3 rounds
- **70% mark — Hostile Takeover:** Boss steals 40 guests, cancels your active Pace Definder

### Zero Stats Rule
If you exceed the Lightbulb budget OR trigger 2+ non-overuse penalties during the level, **all your boss stats drop to 0** at battle start.

---

## 10. Economy & Progression

### Currencies

| Currency | Earned By | Spent On |
|---|---|---|
| 🪙 **Coins** | Level completion (+100/+150/+200 per star), Journey Chests | Tactical Boosters |
| 🍃 **Leaves** | Journey Chests (every 2-3 levels) | Construction upgrades on Home |
| 💡 **Lightbulbs** | Building Mode budget (per level) | Placing tiles |

### Journey Chests
Unlock at levels 2, 5, 8, 12, 16, 20, 25, 30, 35, 40. Each grants Coins + Leaves.

### Boosters (unlocked by level)

| Booster | Unlock | Cost | Effect |
|---|---|---|---|
| 🖌️ Chisel Brush | Lv 5 | 120 🪙 | Restore last misplaced tile |
| 🔨 Cluster Splitter | Lv 8 | 250 🪙 | Split current cluster into singles |
| 📐 Par Expander | Lv 15 | 450 🪙 | +5 free tile quota |
| 🏮 Mist Piercer | Lv 23 | 750 🪙 | Clear all fog cells |
| 🛡️ Titan Shield | Lv 33 | 1200 🪙 | Full penalty immunity +500 score |

### Constructions (Home)
10 resort buildings, each upgradeable from Level 0 → 3 with Leaves:
- Timber Lodge, Glade Pool, Campfire Hearth, Sand Land, Greenhouse,
- Waterwheel Spa, Starlit Terrace, Bakery Workshop, Windmill Keep, Shrine Pavilion

Max all 10 → unlock **Golden Ticket**.

---

## 11. Memories & Penalty Bypasses

Memories unlock by level progression. Each gives you **+1 free pass per level** for one penalty type.

### Available Memories (14 total)

| Chapter | Memory | Unlocked At |
|---|---|---|
| 1 | The First Hearth | Lvl 1 |
| 1 | Sunlit Meadow & Grove | Lvl 3 |
| 1 | Whispering Elder Stones | Lvl 5 |
| 1 | The Great Stoneworks | Lvl 8 |
| 1 | Citadel of the Pioneers | Lvl 10 |
| 2 | The Rotary Riverbend | Lvl 12 |
| 2 | Highland Citadel Keep | Lvl 16 |
| 2 | The Blossom Metropolis | Lvl 20 |
| 3 | Mistveil Forecast | Lvl 22 |
| 3 | The Titan Awakens | Lvl 25 |
| 3 | The Quad-Color Meridian | Lvl 30 |
| 4 | The Great Blossom Weir | Lvl 33 |
| 4 | Dual Matrix Citadel | Lvl 38 |
| 4 | The Sovereign Eternal Empire | Lvl 40 |

### How to Choose Your Bypass
1. Go to **Memories** from Home or level complete screen
2. Click a Memory Picture
3. Choose one of the 4 penalty types (Overlap, Overuse, Disconnect, Off-Map)
4. Max 3 bypasses per penalty type (across all memories)

The chosen bypass applies automatically in every future level.

---

## 12. Controls & Shortcuts

### Desktop

| Action | Input |
|---|---|
| Pick up / place tile | Left-click |
| Return tile | Right-click |
| Cancel selection | Right-click while holding |
| Rotate cluster 60° | Press **R** |
| Spin turntable | Press **T** |
| Hide UI (clean view) | Press **H** |
| Toggle dev debugger | Press **Tab** |
| Pan board | Drag with left mouse |
| Zoom board | Mouse wheel |

### Mobile

| Action | Input |
|---|---|
| Pick up tile | Tap tray card |
| Place tile | Tap board hex (with tile held) |
| Drag tile | Press-and-drag up from tray |
| Preview color zone | Long-press hex (boss levels) |
| Preview road requirement | Long-press pre-placed road |
| Rotate cluster | Tap **Rotate** button |
| Spin turntable | Tap **Spin** button |
| Complete phase | Tap **Complete** / **Expand** |
| Pause | Tap top-left pause button |

---

## 13. Guest vs. Signed-In

### Guest Mode (no account)
- Play **5 trial levels**: 3, 10, 14, 16, 19
- Full feature access within trial levels
- **No cloud save** — progress lost when browser data cleared
- Cannot purchase boosters, claim chests, or access Memories

### Signed-In Mode
- All **51 levels** unlocked
- Cloud sync across devices
- Full economy (Coins, Leaves, Chests, Boosters)
- Memories & visual novel chapters
- 30-minute idle timeout → must re-authenticate

To sign in: Home → **Sign In** button → email + password (min 6 chars).

---

## 14. Troubleshooting

**"I can't complete the level even with all zones filled"**  
Check the sidebar for active penalties. Any of Overlap / Off-Map / Falsehood / Disconnect **blocks level completion**. Right-click the offending tile to remove it.

**"The score is 0"**  
You either:
- Exceeded the strict penalty limit (Level 20+)
- Triggered Falsehood (fog tile not connected to safe ground)

Resolve the penalty to restore scoring.

**"My cluster won't place"**  
Clusters must fit entirely within unlocked cells. Check:
- All hexes of the cluster land on valid, colored-matching cells
- No overlap with existing tiles
- No river cells (unless it's a bridge cluster)

**"The turntable doesn't move my tiles"**  
Turntables rotate **single tiles only**. Clusters stay fixed. If you have clusters on the turntable, rotate them **before** placing them.

**"The boss stats are 0 before I even start"**  
You exceeded the Lightbulb budget or incurred 2+ non-overuse penalties during the level. Both conditions drop all stats to 0. Restart and be more careful.

**"Cloud save is not syncing"**  
- Check internet connection
- Click **Sync Now** in Settings or the header cloud indicator
- If a conflict modal appears, choose **Local** or **Cloud** — whichever has the higher level

**"I lost my progress"**  
- Guest progress is in `localStorage` — clearing browser data wipes it
- Signed-in progress is in the cloud — sign in again to restore
- If both exist with different timestamps, a **Conflict Resolution Modal** lets you pick

---