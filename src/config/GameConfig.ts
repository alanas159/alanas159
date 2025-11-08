import Phaser from 'phaser';

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;
export const TILE_SIZE = 32;

// Time settings (in milliseconds)
export const DAY_DURATION = 420000; // 7 minutes
export const NIGHT_DURATION = 180000; // 3 minutes
export const FULL_CYCLE = DAY_DURATION + NIGHT_DURATION; // 10 minutes

// Horde settings
export const HORDE_INTERVAL = 5; // Every 5 in-game days
export const BASE_ZOMBIE_COUNT = 50;
export const ZOMBIE_SCALING = 1.5; // Multiply by this each horde

// Player settings
export const PLAYER_SPEED = 160;
export const PLAYER_BASE_HEALTH = 100;
export const PLAYER_BASE_STAMINA = 100;

// Resource types
export enum ResourceType {
  WOOD = 'wood',
  STONE = 'stone',
  IRON = 'iron',
  FOOD = 'food',
  WATER = 'water',
  HERBS = 'herbs'
}

// Building types
export enum BuildingType {
  WOODEN_WALL = 'wooden_wall',
  WOODEN_GATE = 'wooden_gate',
  SPIKE_PIT = 'spike_pit',
  CAMPFIRE = 'campfire',
  WORKBENCH = 'workbench',
  STORAGE = 'storage',
  STONE_WALL = 'stone_wall',
  TOWER = 'tower',
  FORGE = 'forge'
}

// Zombie types
export enum ZombieType {
  WALKER = 'walker',
  RUNNER = 'runner',
  KNIGHT = 'knight',
  PLAGUE_BEARER = 'plague_bearer',
  BERSERKER = 'berserker',
  TANK = 'tank',
  PLAGUE_LORD = 'plague_lord' // Boss
}

// Game configuration
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#2d2d2d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};
