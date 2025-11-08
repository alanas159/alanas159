# Dark Ages: Survival

A medieval zombie apocalypse survival RPG built with Phaser 3 and TypeScript.

## Game Concept

Navigate a medieval world overrun by the undead. Survive increasingly dangerous zombie hordes while gathering resources, building defenses, and managing your base. Features a dynamic day/night cycle where zombies grow stronger after dark.

## Features

### Current Implementation (v0.1.0)

- **Player System**: Movement, health, stamina, and leveling
- **Zombie AI**: Multiple zombie types with different stats and behaviors
- **Day/Night Cycle**: 7-minute days, 3-minute nights
- **Resource Management**: Wood, stone, iron, food, water, herbs
- **Crafting System**: Weapons, buildings, and defensive structures
- **Technology Tree**: Unlocks based on progression
- **Zombie Spawning**: Dynamic spawning with horde events every 5 days
- **Mobile Controls**: Virtual joystick for touch devices
- **UI System**: Health/stamina bars, resource display, day/night timer

### Zombie Types

- **Walker**: Slow, weak, basic threat
- **Runner**: Fast, medium health, dangerous in groups
- **Knight**: Armored, slow, high health tank
- **Plague Bearer**: Medium speed, poison damage

### Building Types

- Wooden Wall, Wooden Gate
- Spike Pit (damages enemies)
- Campfire (warmth, cooking)
- Workbench (advanced crafting)
- Storage Chest
- Stone Wall (unlocks Day 10)
- Archer Tower (unlocks Day 15)
- Forge (unlocks Day 15)

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

The game will open in your browser at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Controls

### Desktop
- **Arrow Keys**: Move player
- **WASD**: Alternative movement (to be implemented)

### Mobile/Touch
- **Virtual Joystick**: Touch bottom-left area to show joystick, drag to move

### Planned Controls
- **Attack**: Auto-attack nearby zombies
- **Build Mode**: Place structures
- **Craft Menu**: Open crafting interface
- **Inventory**: Manage items

## Development Roadmap

### Phase 1: Core Gameplay (In Progress)
- [x] Player movement and stats
- [x] Zombie AI and spawning
- [x] Day/night cycle
- [x] Resource system
- [x] Basic UI
- [ ] Combat system with weapons
- [ ] Base building placement
- [ ] Inventory system

### Phase 2: Content Expansion
- [ ] Story mode with 3 acts (40 days)
- [ ] More zombie types and boss zombies
- [ ] Expanded crafting recipes
- [ ] NPC survivors
- [ ] Environmental hazards
- [ ] Quest system

### Phase 3: Polish & Features
- [ ] Endless survival mode
- [ ] Save/load system
- [ ] Achievement system
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] Tutorial/onboarding

### Phase 4: Monetization (Optional)
- [ ] Rewarded ads for bonuses
- [ ] Cosmetic items
- [ ] Ad removal option

## Technical Stack

- **Engine**: Phaser 3.70+
- **Language**: TypeScript 5.3+
- **Build Tool**: Vite 5.0+
- **Target**: Mobile browsers (iOS/Android)
- **Graphics**: Pixel art (placeholder graphics, to be replaced)

## Project Structure

```
src/
├── config/          # Game configuration and constants
├── entities/        # Game entities (Player, Zombie, etc.)
├── managers/        # Game managers (ZombieSpawner, etc.)
├── scenes/          # Phaser scenes (Boot, Game, Menu, etc.)
├── systems/         # Game systems (Resources, DayNight, Crafting)
├── ui/              # UI components
└── main.ts          # Entry point
```

## Contributing

This is a solo development project, but suggestions and feedback are welcome!

## License

MIT License - Feel free to learn from and build upon this code.

## Credits

- Developed with Phaser 3
- Inspired by classic survival games like Terraria, Don't Starve, and They Are Billions

---

**Status**: Early Alpha (v0.1.0)
**Last Updated**: 2025-11-08
