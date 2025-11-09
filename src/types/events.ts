/**
 * Random Events, Great People, and World Wonders
 */

// ========== RANDOM EVENTS ==========

export type EventType = 'positive' | 'negative' | 'neutral';

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  trigger: (gameState: any, playerId: string) => boolean;
  effect: (gameState: any, playerId: string) => void;
  probability: number; // 0-1
  minTurn: number;
  maxOccurrences: number;
}

// ========== GREAT PEOPLE ==========

export type GreatPersonType = 'scientist' | 'engineer' | 'artist' | 'general' | 'merchant' | 'prophet';

export interface GreatPerson {
  id: string;
  name: string;
  type: GreatPersonType;
  era: 'antiquity' | 'medieval' | 'modern';
  ability: {
    name: string;
    description: string;
    effect: (gameState: any, playerId: string, cityId?: string) => void;
  };
  passive?: {
    name: string;
    description: string;
    bonus: Record<string, number>;
  };
}

export interface GreatPersonProgress {
  type: GreatPersonType;
  points: number;
  threshold: number;
}

// ========== WORLD WONDERS ==========

export interface WorldWonder {
  id: string;
  name: string;
  description: string;
  era: 'antiquity' | 'medieval' | 'modern';
  cost: {
    production: number;
    turns: number;
  };
  requiredTech: string;
  effects: {
    global?: Record<string, number>; // Bonuses to all cities
    city?: Record<string, number>; // Bonuses to city that built it
    unique?: string; // Description of unique effect
  };
  onComplete?: (gameState: any, playerId: string, cityId: string) => void;
}

export interface BuiltWonder {
  wonderId: string;
  ownerId: string;
  cityId: string;
  turnCompleted: number;
}
