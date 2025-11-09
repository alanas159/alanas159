// Core type definitions for Empires Eternal

export type TerrainType = 'ocean' | 'plains' | 'grassland' | 'desert' | 'tundra' |
                          'forest' | 'jungle' | 'hills' | 'mountains' | 'snow';

export type ResourceType = 'food' | 'production' | 'gold' | 'science' | 'culture';

export type VictoryType = 'military' | 'economic' | 'scientific' | 'cultural';

export type EraType = 'antiquity' | 'exploration' | 'modern';

export type UnitType = 'settler' | 'warrior' | 'archer' | 'cavalry' | 'siege';

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  explored: boolean;
  visible: boolean;
  resources: Partial<Record<ResourceType, number>>;
  cityId?: string;
  unitId?: string;
  ownerId?: string; // Player/civilization ID
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
  bonuses: CivilizationBonus[];
  startingUnits: UnitType[];
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
}
