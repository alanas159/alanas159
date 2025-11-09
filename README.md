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

### ✅ Implemented Features (Phase 1)
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

### 🚧 In Development (Phase 2)
- [ ] Full city building mechanics
- [ ] Unit movement system
- [ ] Tactical combat with terrain modifiers
- [ ] Technology research trees
- [ ] Building construction and upgrades
- [ ] Unit recruitment from cities

### 📋 Planned Features (Phase 3)
- [ ] Diplomacy system (alliances, trade, declarations)
- [ ] Victory condition tracking and end-game
- [ ] Advanced AI decision-making
- [ ] Naval warfare
- [ ] Multiplayer support
- [ ] Random events (plagues, barbarians, golden ages)
- [ ] Great people and wonders
- [ ] Sound effects and music
- [ ] Save/load system

## Technical Details

### Technology Stack
- **TypeScript**: Type-safe game logic
- **HTML5 Canvas**: 2D rendering
- **Vite**: Fast build tool and dev server
- **Vanilla JS**: No framework dependencies for performance

### Project Structure
```
src/
├── core/
│   ├── GameState.ts      # Game state management and turn logic
│   └── Renderer.ts        # Canvas rendering engine
├── civilizations/
│   └── CivilizationData.ts  # All 8 civilizations with bonuses
├── map/
│   └── MapGenerator.ts    # Procedural map generation
├── ui/
│   └── UIManager.ts       # UI updates and event handling
├── units/                 # Unit classes (planned)
├── combat/                # Combat system (planned)
├── types.ts               # TypeScript type definitions
└── main.ts                # Game initialization and loop
```

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

**Version**: 1.0.0 (Phase 1 Complete)
**Status**: Core gameplay implemented, combat and advanced features in development

---

## License

This project is part of a portfolio demonstration.

Enjoy building your eternal empire! 🏛️⚔️🌍
