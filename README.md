# Dark Ages: Survival

A feature-complete medieval zombie apocalypse survival RPG built with Phaser 3 and TypeScript.

## Game Concept

Navigate an infinitely-generated medieval world overrun by the undead. Survive increasingly dangerous zombie hordes while gathering resources, building defenses, and managing your base. Features a dynamic day/night cycle, story mode with 3 acts, and endless survival challenges.

## Features

### Core Gameplay

**Combat System**
- 8 weapon types with unique stats (damage, speed, range, durability)
- Weapon crafting from gathered resources (Wood, Stone, Iron)
- Attack mechanics with stamina management
- Weapon durability and breakage system
- Fists, Wooden Club/Spear, Stone Axe, Iron Sword/Axe, Steel Longsword, Battle Axe

**Inventory & Resources**
- 20-slot inventory system with stackable items
- 6 resource types: Wood, Stone, Iron, Food, Water, Herbs
- Resource gathering from world objects (Trees, Rocks, Iron deposits, Berry bushes, Water sources)
- Automatic resource respawning with timers

**Building & Base Defense**
- 9 building types with progression tiers
- Grid-based placement system with collision detection
- Defensive structures that auto-attack zombies:
  - Wooden/Stone Walls and Gates
  - Spike Pits (damage on contact)
  - Archer Towers (ranged auto-attack)
  - Utility: Campfire, Workbench, Storage, Forge
- Buildings can be damaged and destroyed by zombies

**Crafting System**
- Full crafting UI with Weapons and Buildings tabs
- Recipe unlocking based on day progression
- Resource cost validation before crafting
- Instant weapon creation to inventory
- Building placement mode after crafting structures

### World & Environment

**Procedural World Generation**
- Infinite terrain using chunk-based generation
- Deterministic seeded random for consistent worlds
- 16x16 tile chunks spawn dynamically around player
- Varied terrain (grass/dirt) with natural distribution
- Resource nodes spawn procedurally per chunk

**Day/Night Cycle**
- 7-minute days, 3-minute nights (10 min full cycle)
- Visual day/night overlay
- Zombies are 50% faster and more aggressive at night
- Real-time countdown timer in UI

**Horde Events**
- Massive zombie attacks every 5 in-game days
- Progressive difficulty scaling (base 50 zombies × 1.5 per horde)
- 3-second warning before horde spawns
- Boss zombies appear in later hordes

### Zombie Types & Bosses

**7 Zombie Variants**
- **Walker**: Basic slow zombie (30 HP, slow)
- **Runner**: Fast, low health (20 HP, very fast)
- **Knight**: Armored tank (80 HP, slow, high damage)
- **Plague Bearer**: Poison damage dealer (40 HP, medium)
- **Berserker**: NEW - Fast and deadly (60 HP, 15 damage)
- **Tank**: NEW - Extremely tanky (150 HP, 20 damage)
- **Plague Lord (BOSS)**: Ultimate challenge (500 HP, 30 damage, 2x size, health bar)

**Boss Features**
- 2x larger sprite
- Persistent health bar above boss
- Special death event and cutscene
- Massive XP rewards (500 XP)

### Story Mode (3 Acts, 40 Days)

**Act 1: The Outbreak** (Days 1-10)
- Learn survival basics
- Objectives: Survive to Day 5, gather 50 wood, craft first weapon, build 5 walls, kill 20 zombies
- Unlocks: Wooden Spear, Spike Pit

**Act 2: Expansion & Fortification** (Days 11-25)
- Expand territory and build advanced defenses
- Objectives: Survive to Day 20, craft iron weapon, build stone walls/tower, survive horde, kill 10 Knights
- Unlocks: Iron Sword, Stone Wall, Archer Tower

**Act 3: The Reckoning** (Days 26-40)
- Ultimate endgame content
- Objectives: Survive to Day 35, craft legendary weapon, defeat Plague Lord boss, build 50+ structures, survive Day 40 horde
- Unlocks: Steel Longsword, Battle Axe
- Final Challenge: Choose to cure the plague OR escape to safe lands

**Story Features**
- Objective tracking system
- Completion percentage display
- Automatic progression through acts
- Stat tracking (zombies killed, buildings built, hordes survived)

### NPC Survivors

**4 NPC Roles**
- **Farmer**: Produces 2 food per minute
- **Guard**: Provides passive defense
- **Blacksmith**: Repairs weapons and buildings
- **Healer**: Heals player over time

**NPC Features**
- Assignable to buildings for productivity
- Color-coded by role
- Automatic resource production
- Persistent across save/load

### Save/Load System

**Save Features**
- LocalStorage-based persistence
- Complete state saving:
  - Player position, health, stamina, level, XP
  - All resources and inventory
  - Game progress (current day, zombies killed, buildings)
  - All building positions and health states
- Version checking for save compatibility
- Save info display (timestamp, current day)
- Manual save and delete functionality

### Tutorial & Onboarding

**7-Step Interactive Tutorial**
1. Welcome and movement controls
2. Resource gathering mechanics
3. Combat system basics
4. Crafting menu usage
5. Building placement
6. Day/night cycle explanation
7. Horde event preparation

**Tutorial Features**
- Event-triggered progression
- Persistent completion tracking
- Skippable at any time
- 15-second auto-advance per step
- Beautiful UI with gold accents

### Graphics & Polish

**Enhanced Visuals**
- Detailed player sprite (head, body, legs, weapon visible)
- Enhanced zombie sprites (torn clothes, reaching arms, red eyes)
- Textured terrain tiles with random details
- Building sprites with depth and shading
- Boss zombies are 2x larger with unique colors

**UI/UX**
- Clean status bar (health, stamina, day/night timer, resources)
- Floating damage numbers (future)
- Screen shake effects on hits (future)
- Smooth animations for all actions
- Mobile-optimized touch controls

## Controls

### Desktop
- **Arrow Keys**: Move player
- **C**: Open crafting menu
- **E**: Gather resources / Interact
- **SPACE**: Attack nearby zombie
- **ESC**: Cancel building placement / Close menus

### Mobile/Touch
- **Virtual Joystick**: Touch bottom-left to move
- **ATK Button** (Red): Attack zombies
- **E Button** (Green): Gather resources
- **C Button** (Blue): Open crafting menu

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Game runs at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Development Roadmap

### ✅ Phase 1: Core Gameplay (COMPLETE)
- [x] Player movement and stats
- [x] Combat system with weapons
- [x] Inventory management
- [x] Resource gathering
- [x] Crafting system with UI
- [x] Building placement mechanics
- [x] Zombie AI and spawning
- [x] Day/night cycle
- [x] Basic UI and mobile controls

### ✅ Phase 2: Content Expansion (COMPLETE)
- [x] Story mode with 3 acts (40 days)
- [x] Procedural world generation (infinite)
- [x] More zombie types (7 total)
- [x] Boss zombies with health bars
- [x] NPC survivor system
- [x] Enhanced crafting recipes

### ✅ Phase 3: Polish & Features (COMPLETE)
- [x] Save/load system
- [x] Tutorial and onboarding
- [x] Enhanced pixel art graphics
- [x] Story objectives tracking
- [x] Stat tracking system
- [ ] Sound effects and music (planned)
- [ ] Particle effects (planned)

### 🚀 Future Enhancements
- [ ] Endless survival mode with leaderboards
- [ ] More weapon types (crossbows, halberds)
- [ ] Equipment system (armor, accessories)
- [ ] Quest system with random events
- [ ] Multiplayer co-op (2-4 players)
- [ ] Achievement system
- [ ] Daily challenges
- [ ] Seasonal events

## Technical Stack

- **Engine**: Phaser 3.70+
- **Language**: TypeScript 5.3+
- **Build Tool**: Vite 5.0+
- **Target**: Mobile browsers (iOS/Android) + Desktop
- **Graphics**: Procedural pixel art
- **Storage**: LocalStorage for saves

## Project Structure

```
src/
├── config/
│   ├── GameConfig.ts       # Constants and enums
│   └── StoryMode.ts        # Story acts and objectives
├── entities/
│   ├── Player.ts           # Player with combat & inventory
│   ├── Zombie.ts           # Zombie AI with boss support
│   └── NPCSurvivor.ts      # NPC system
├── items/
│   ├── Weapon.ts           # Weapon stats and types
│   └── Inventory.ts        # Inventory management
├── managers/
│   ├── ZombieSpawner.ts    # Zombie spawning logic
│   └── BuildingManager.ts  # Building placement
├── scenes/
│   ├── BootScene.ts        # Asset generation
│   └── GameScene.ts        # Main gameplay
├── systems/
│   ├── CraftingSystem.ts   # Recipes and crafting
│   ├── DayNightSystem.ts   # Day/night cycle
│   ├── ResourceManager.ts  # Resource tracking
│   ├── SaveLoadSystem.ts   # Save/load functionality
│   └── TutorialSystem.ts   # Tutorial flow
├── ui/
│   ├── GameUI.ts           # HUD and status display
│   └── CraftingUI.ts       # Crafting menu
├── world/
│   ├── Building.ts         # Building entities
│   ├── WorldObject.ts      # Harvestable objects
│   └── WorldGenerator.ts   # Procedural generation
└── main.ts                 # Entry point
```

## Game Stats

- **Total Zombie Types**: 7 (including boss)
- **Weapon Types**: 8
- **Building Types**: 9
- **Resource Types**: 6
- **Story Acts**: 3 (40 days total)
- **NPC Roles**: 4
- **World**: Infinite procedural generation
- **File Size**: ~1.5MB (mostly Phaser engine)

## Performance

- Target: 60 FPS on mid-range devices
- Resolution: 720x1280 (mobile portrait)
- Build size: ~1.5MB minified
- Chunk loading: Dynamic (minimal memory)
- Battery optimized: 2+ hours gameplay

## Contributing

This is a solo development project showcasing full-stack game development skills. Feedback and suggestions are welcome via issues!

## License

MIT License - Free to learn from and build upon.

## Credits

- **Developer**: Built with ❤️ using Phaser 3
- **Inspired by**: Terraria, Don't Starve, They Are Billions, Kingdom Rush
- **Tools**: TypeScript, Vite, Phaser 3

---

**Status**: Feature-Complete Alpha (v1.0.0)
**Last Updated**: 2025-11-08
**Play Time**: Endless (Story mode: ~2-3 hours)
**Difficulty**: Mid-core with scaling challenge

🎮 **Ready to survive the Dark Ages?**
