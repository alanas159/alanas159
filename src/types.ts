// Core type definitions for Empires Eternal

export type TerrainType = 'ocean' | 'plains' | 'grassland' | 'desert' | 'tundra' |
                          'forest' | 'jungle' | 'hills' | 'mountains' | 'snow';

export type ResourceType = 'food' | 'production' | 'gold' | 'science' | 'culture';

export type StrategicResourceType = 'iron' | 'horses' | 'wheat' | 'fish' | 'stone' | 'luxury';

export type VictoryType = 'military' | 'economic' | 'scientific' | 'cultural';

export type EraType = 'antiquity' | 'medieval' | 'modern';

export type UnitType = 'settler' | 'warrior' | 'archer' | 'cavalry' | 'siege' | 'spearman' | 'swordsman';

export type BuildingType = 'barracks' | 'granary' | 'library' | 'market' | 'walls' | 'temple' | 'workshop' | 'university';

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  explored: boolean;
  visible: boolean;
  resources: Partial<Record<ResourceType, number>>;
  strategicResource?: StrategicResourceType;
  hasRiver?: boolean;
  cityId?: string;
  unitId?: string;
  ownerId?: string; // Player/civilization ID
  improvementType?: string; // Farm, mine, etc.
  occupyingUnitId?: string; // Unit attempting to occupy this tile
  occupationProgress?: number; // Turns occupied (0-3)
}

export interface Resources {
  food: number;
  production: number;
  gold: number;
  science: number;
  culture: number;
}

export interface CivilizationBonus {
  type: ResourceType;
  amount: number;
  terrain?: TerrainType;
}

export interface CivilizationData {
  id: string;
  name: string;
  description: string;
  color: string;
  capitalName: string;
  bonuses: CivilizationBonus[];
  startingUnits: UnitType[];
  startingTechnologies: string[];
  uniqueAbility: string;
}

export interface Unit {
  id: string;
  type: UnitType;
  ownerId: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  movement: number;
  maxMovement: number;
  attack: number;
  defense: number;
  hasActed: boolean;
}

export interface Building {
  type: BuildingType;
  name: string;
  cost: Partial<Record<ResourceType, number>>;
  effects: Partial<Record<ResourceType, number>>;
}

export interface City {
  id: string;
  name: string;
  ownerId: string;
  x: number;
  y: number;
  population: number;
  territories: Array<{x: number; y: number}>;
  production: Partial<Record<ResourceType, number>>;
  isCapital: boolean;
  buildings: BuildingType[];
  currentProduction?: {
    type: 'unit' | 'building';
    name: string;
    progress: number;
    required: number;
  };
}

export interface Technology {
  id: string;
  name: string;
  cost: number;
  era: EraType;
  branch: 'military' | 'economy' | 'infrastructure' | 'naval' | 'science_culture';
  prerequisites: string[];
  unlocks: string[];
  bonus?: {
    type: 'production' | 'food' | 'gold' | 'science' | 'culture' | 'movement' | 'defense' | 'attack';
    amount: number;
    description: string;
  };
}

export interface Player {
  id: string;
  civilizationId: string;
  resources: Resources;
  cities: City[];
  units: Unit[];
  territories: Array<{x: number; y: number}>;
  era: EraType;
  isAI: boolean;
  technologies: string[];
  currentResearch?: {
    techId: string;
    progress: number;
  };
}

export interface GameConfig {
  mapWidth: number;
  mapHeight: number;
  seed?: number;
  numberOfAIPlayers: number;
}

export interface GameState {
  turn: number;
  era: EraType;
  players: Player[];
  currentPlayerId: string;
  map: Tile[][];
  config: GameConfig;
  selectedTile: {x: number; y: number} | null;
  selectedUnit: Unit | null;
  selectedCity: City | null;
  notifications: Array<{message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp: number}>;
}
