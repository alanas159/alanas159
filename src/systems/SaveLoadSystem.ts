import { ResourceManager } from './ResourceManager';
import { Player } from '../entities/Player';
import { ResourceType } from '../config/GameConfig';

export interface SaveData {
  version: string;
  timestamp: number;
  playerData: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    level: number;
    experience: number;
  };
  resources: {
    [key in ResourceType]: number;
  };
  gameState: {
    currentDay: number;
    zombiesKilled: number;
    buildingsBuilt: number;
  };
  inventory: any[];
  buildings: Array<{
    type: string;
    x: number;
    y: number;
    health: number;
  }>;
}

export class SaveLoadSystem {
  private static SAVE_KEY = 'dark_ages_survival_save';
  private static VERSION = '1.0.0';

  static save(
    player: Player,
    resourceManager: ResourceManager,
    currentDay: number,
    zombiesKilled: number,
    buildingsBuilt: number,
    buildings: any[]
  ): boolean {
    try {
      const saveData: SaveData = {
        version: this.VERSION,
        timestamp: Date.now(),
        playerData: {
          x: player.x,
          y: player.y,
          health: player.getHealth(),
          maxHealth: player.getMaxHealth(),
          stamina: player.getStamina(),
          maxStamina: player.getMaxStamina(),
          level: player.getLevel(),
          experience: player.getExperience()
        },
        resources: resourceManager.getAllResources(),
        gameState: {
          currentDay,
          zombiesKilled,
          buildingsBuilt
        },
        inventory: [],
        buildings: buildings.map(b => ({
          type: b.getBuildingType ? b.getBuildingType() : 'unknown',
          x: b.x,
          y: b.y,
          health: b.getHealth ? b.getHealth() : 100
        }))
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  static load(): SaveData | null {
    try {
      const data = localStorage.getItem(this.SAVE_KEY);
      if (!data) return null;

      const saveData: SaveData = JSON.parse(data);

      // Version check
      if (saveData.version !== this.VERSION) {
        console.warn('Save file version mismatch');
      }

      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  static deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  static getSaveInfo(): { exists: boolean; timestamp?: number; day?: number } {
    const data = this.load();
    if (!data) {
      return { exists: false };
    }

    return {
      exists: true,
      timestamp: data.timestamp,
      day: data.gameState.currentDay
    };
  }
}
