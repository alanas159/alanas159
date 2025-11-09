/**
 * Victory Conditions System
 */

export type VictoryType = 'domination' | 'science' | 'culture' | 'diplomacy' | 'time';

export interface VictoryCondition {
  type: VictoryType;
  name: string;
  description: string;
  checkCondition: (playerId: string, gameState: any) => boolean;
  progress: (playerId: string, gameState: any) => number; // 0-100%
}

export interface VictoryProgress {
  playerId: string;
  civilizationName: string;
  domination: number;
  science: number;
  culture: number;
  diplomacy: number;
  time: number;
}

export interface GameEndResult {
  winner: string;
  victoryType: VictoryType;
  turn: number;
  scores: PlayerScore[];
}

export interface PlayerScore {
  playerId: string;
  civilizationName: string;
  totalScore: number;
  breakdown: {
    cities: number;
    population: number;
    territory: number;
    technologies: number;
    military: number;
    wonders: number;
    greatPeople: number;
  };
}
