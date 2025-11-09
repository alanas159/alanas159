# Empires Eternal

**A 2D Turn-Based Strategy Game of World Conquest**

Empires Eternal is a classic 4X (eXplore, eXpand, eXploit, eXterminate) strategy game where you lead a historical civilization from humble beginnings to world domination through military might, economic power, scientific advancement, or cultural influence.

## Game Overview

Choose from 8 unique civilizations, each with distinct bonuses and playstyles, and embark on a journey to conquer a procedurally generated world. Build cities, manage resources, recruit armies, research technologies, and outmaneuver your opponents in turn-based strategic warfare.

### Core Features

- **8 Unique Civilizations**: Celts, Romans, Egyptians, Baltic Tribes, Mongols, Mali Empire, Aztecs, and Zulus
- **Procedural World Generation**: Each game features a unique map with diverse terrains and strategic resources
- **Fog of War**: Explore the unknown and uncover hidden territories
- **Resource Management**: Balance Food, Production, Gold, Science, and Culture
- **Turn-Based Strategy**: Plan your moves carefully in classic turn-based gameplay
- **Multiple Victory Paths**: Military conquest, economic dominance, scientific supremacy, or cultural influence

## Civilizations

### Celts
**Forest Defenders**
- Bonus: +2 Production from forests
- Specialty: Guerrilla warfare and strong defensive positions
- Best for: Players who enjoy defensive strategies and forest terrain

### Romans
**All Roads Lead to Rome**
- Bonus: +3 Production for engineering, +2 Gold from trade
- Specialty: Superior legions and rapid expansion via road networks
- Best for: Military conquest and efficient empire management

### Egyptians
**Gift of the Nile**
- Bonus: +3 Food from grasslands, +2 Science
- Specialty: Early scientific advances and wonder construction
- Best for: Scientific and cultural victories

### Baltic Tribes
**Northern Resilience**
- Bonus: +3 Gold from amber trade, +2 Production from hills
- Specialty: Hardy warriors adapted to harsh climates
- Best for: Economic strength and hill/tundra dominance

### Mongols
**Horde Tactics**
- Bonus: +2 Production from plains, cavalry moves +2 spaces
- Specialty: Lightning-fast cavalry assaults
- Best for: Aggressive military expansion

### Mali Empire
**Trans-Saharan Trade**
- Bonus: +5 Gold per turn, trade caravans provide intelligence
- Specialty: Vast wealth and trade route domination
- Best for: Economic and diplomatic victories

### Aztecs
**Warrior Priests**
- Bonus: +2 Food and Production from jungles
- Specialty: Jungle warfare and sacrificial rituals for morale
- Best for: Players who control jungle territories

### Zulus
**Impi Warriors**
- Bonus: +3 Food from cattle, melee units cost -25%
- Specialty: Elite warriors and superior cattle economy
- Best for: Aggressive military expansion with economic support

## Terrain Types

Each terrain type provides different resources and strategic advantages:

- **Ocean**: Basic food and gold, enables naval movement
- **Grassland**: High food (+3), ideal for city growth
- **Plains**: Balanced food and production (+2 each)
- **Desert**: Low resources, difficult to settle
- **Tundra**: Cold climate with minimal yields
- **Snow**: Harsh terrain with no resources
- **Forest**: High production (+3), provides cover in combat
- **Jungle**: Balanced resources, ambush opportunities
- **Hills**: High production (+3), defensive bonuses
- **Mountains**: Impassable terrain, strategic barriers

## Game Mechanics

### Resources

- **Food**: Grows population in cities
- **Production**: Builds units, buildings, and wonders
- **Gold**: Maintains armies and enables trade
- **Science**: Unlocks new technologies
- **Culture**: Expands territory and influences other civilizations

### Turn System

1. **Resource Collection**: Cities generate resources based on terrain
2. **Unit Actions**: Move armies, explore, or attack
3. **City Management**: Build structures, recruit units
4. **Research**: Advance through technology trees
5. **Diplomacy**: Negotiate with other civilizations
6. **End Turn**: AI opponents take their turns

### Fog of War

- **Unexplored**: Black areas you haven't discovered yet
- **Explored**: Revealed but not currently visible (dimmed)
- **Visible**: Areas near your units and cities

### Victory Conditions

1. **Military Victory**: Conquer all enemy capitals
2. **Economic Victory**: Control all major trade routes
3. **Scientific Victory**: Unlock space colonization technology
4. **Cultural Victory**: Spread your influence to every territory

## Controls

### Map Navigation
- **Mouse Wheel**: Zoom in/out
- **Click + Drag**: Pan across the map
- **Click Tile**: Select and view tile information

### UI Buttons
- **End Turn**: Complete your turn and pass to next player
- **Found City**: Build a new city (requires settler unit)
- **Recruit Unit**: Train new military units (coming soon)

## Current Implementation Status

### ✅ Phase 1 - Core Foundation (COMPLETE)
- [x] 8 unique civilizations with distinct bonuses
- [x] Procedural world map generation with 10 terrain types
- [x] Fog of war and exploration system
- [x] Resource management (Food, Production, Gold, Science, Culture)
- [x] Turn-based game flow
- [x] City founding and territory control
- [x] Starting units (settlers, warriors, archers, cavalry)
- [x] Beautiful UI with civilization selection
- [x] Map rendering with zoom and pan
- [x] AI opponent framework (3 AI players)

### ✅ Phase 2 - Complete 4X Mechanics (COMPLETE)
- [x] **Enhanced UI**: Top status bar, minimap, notifications, empire stats, tech progress
- [x] **Advanced World Generation**: Rivers, strategic resources, continents, realistic biomes
- [x] **Technology System**: 27 technologies across 3 eras with prerequisites
- [x] **Building System**: 8 buildings with resource bonuses and production queues
- [x] **Unit Recruitment**: 7 unit types with production/gold costs
- [x] **Pathfinding**: A* algorithm with terrain-based movement costs
- [x] **Combat System**: Tactical combat with terrain modifiers (hills, forests, rivers)
- [x] **Strategic Resources**: Iron, horses, wheat, fish, stone, luxury goods
- [x] **Turn Processing**: Auto-research, auto-construction, population growth

### 📋 Phase 3 - Endgame & Polish (PLANNED)
- [ ] Diplomacy system (alliances, trade, declarations)
- [ ] Victory condition tracking and end-game screens
- [ ] Advanced AI decision-making (city placement, unit tactics, research priorities)
- [ ] Naval warfare and ocean units
- [ ] Multiplayer support (hot-seat and online)
- [ ] Random events (plagues, barbarians, golden ages)
- [ ] Great people and world wonders
- [ ] Sound effects and background music
- [ ] Save/load system with cloud sync
- [ ] Map editor and custom scenarios

## Technical Details

### Technology Stack
- **TypeScript**: Type-safe game logic
- **HTML5 Canvas**: 2D rendering
- **Vite**: Fast build tool and dev server
- **Vanilla JS**: No framework dependencies for maximum performance

### Project Structure
```
src/
├── core/
│   ├── GameState.ts         # Game state management, turn processing, game logic
│   ├── Renderer.ts           # Canvas rendering with zoom/pan
│   ├── TechnologyData.ts     # 27 technologies across 3 eras
│   ├── BuildingData.ts       # 8 buildings with bonuses
│   ├── Pathfinding.ts        # A* pathfinding algorithm
│   └── CombatSystem.ts       # Tactical combat with terrain modifiers
├── civilizations/
│   └── CivilizationData.ts   # 8 civilizations with unique bonuses
├── map/
│   └── MapGenerator.ts       # Advanced procedural generation (rivers, resources, continents)
├── ui/
│   └── UIManager.ts          # UI updates and event handling
├── types.ts                  # Comprehensive TypeScript interfaces
└── main.ts                   # Game loop and initialization
```

### Game Statistics
- **Technologies**: 27 (across 3 eras)
- **Buildings**: 8 types
- **Unit Types**: 7 (settler, warrior, spearman, archer, swordsman, cavalry, siege)
- **Terrain Types**: 10 (ocean, plains, grassland, forest, jungle, hills, mountains, desert, tundra, snow)
- **Strategic Resources**: 6 (iron, horses, wheat, fish, stone, luxury)
- **Civilizations**: 8 unique playable civilizations
- **AI Players**: Up to 7 opponents
- **Map Sizes**: 80x50 tiles (4000 total tiles)
- **Build Size**: 35KB minified (from 20KB in Phase 1)

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Gameplay Tips

1. **Choose Your Civilization Wisely**: Each civilization excels in different victory conditions
2. **Explore Early**: Send scouts to uncover resources and plan expansion routes
3. **Balance Resources**: Don't neglect any resource - all are crucial
4. **Terrain Matters**: Build cities near diverse terrain for balanced yields
5. **Plan Your Expansion**: Space cities to maximize territory without overlap
6. **Defend Your Capital**: Losing your capital can cripple your empire

## Future Expansions

### DLC Concepts
- Additional civilizations (Greeks, Chinese, Vikings, Incas)
- New terrain types and natural wonders
- Advanced diplomatic options
- Espionage and spy networks
- Religion and cultural mechanics
- Modern era units and technologies

## Credits

Inspired by classic 4X strategy games like Civilization, Age of Empires, and Europa Universalis.

**Version**: 2.0.0 (Phase 2 Complete - Full 4X Mechanics)
**Status**: All core 4X systems implemented. Diplomacy and endgame features planned for Phase 3.
**Lines of Code**: ~2,500+
**Development Time**: Phase 1 (8 hours) + Phase 2 (12 hours)

---

## What's New in Version 2.0 (Phase 2)

### UI Overhaul
- ✨ Top status bar with real-time resource tracking
- 🗺️ Minimap for world overview
- 🔔 Animated notification system
- 📊 Empire statistics dashboard
- 🎨 Enhanced visual effects and hover states

### World Generation 2.0
- 🌊 Flowing river systems from mountains to oceans
- ⛰️ Realistic continental generation
- 💎 Strategic resource placement (6 types)
- 🌲 Natural forest and mountain range formation
- 🎯 Balanced starting locations based on nearby resources

### Complete Technology Tree
- 📚 27 technologies from Antiquity to Modern era
- 🔬 Research progress tracking
- 🔓 Tech prerequisites and unlock chains
- 🏗️ Technologies unlock buildings and units

### Building & Production System
- 🏛️ 8 building types with unique bonuses
- ⚙️ Production queue management
- 📈 Cumulative resource bonuses
- 🔨 Turn-based construction progress

### Advanced Combat
- ⚔️ Tactical combat with terrain modifiers
- 🗺️ A* pathfinding for intelligent unit movement
- 🛡️ Defense bonuses from hills, forests, rivers
- 💪 Health-based damage calculation
- 🏹 Ranged vs melee unit differentiation

## License

This project is part of a portfolio demonstration showcasing full-stack game development skills.

---

**Enjoy building your eternal empire!** 🏛️⚔️🌍

*From humble settlements to world domination - command your civilization through the ages!*
