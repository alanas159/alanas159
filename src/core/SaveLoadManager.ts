import { GameState } from '../types';

/**
 * SaveLoadManager - Handles game save/load functionality
 */
export class SaveLoadManager {
  private static SAVE_KEY_PREFIX = 'empires_eternal_save_';
  private static AUTO_SAVE_KEY = 'empires_eternal_autosave';
  private static MAX_MANUAL_SAVES = 10;

  /**
   * Save game to localStorage
   */
  static saveGame(state: GameState, saveName: string): boolean {
    try {
      const saveData = {
        state,
        timestamp: Date.now(),
        version: '1.0.0'
      };

      const saveKey = this.SAVE_KEY_PREFIX + saveName;
      localStorage.setItem(saveKey, JSON.stringify(saveData));

      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Auto-save game
   */
  static autoSave(state: GameState): boolean {
    try {
      const saveData = {
        state,
        timestamp: Date.now(),
        version: '1.0.0'
      };

      localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }

  /**
   * Load game from localStorage
   */
  static loadGame(saveName: string): GameState | null {
    try {
      const saveKey = this.SAVE_KEY_PREFIX + saveName;
      const savedData = localStorage.getItem(saveKey);

      if (!savedData) {
        return null;
      }

      const parsed = JSON.parse(savedData);
      return parsed.state;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Load auto-save
   */
  static loadAutoSave(): GameState | null {
    try {
      const savedData = localStorage.getItem(this.AUTO_SAVE_KEY);

      if (!savedData) {
        return null;
      }

      const parsed = JSON.parse(savedData);
      return parsed.state;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  /**
   * Get list of all saves
   */
  static getAllSaves(): Array<{ name: string; timestamp: number; turn: number }> {
    const saves: Array<{ name: string; timestamp: number; turn: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(this.SAVE_KEY_PREFIX)) {
        try {
          const savedData = localStorage.getItem(key);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            saves.push({
              name: key.replace(this.SAVE_KEY_PREFIX, ''),
              timestamp: parsed.timestamp,
              turn: parsed.state.turn
            });
          }
        } catch (error) {
          console.error('Error parsing save:', error);
        }
      }
    }

    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete a save
   */
  static deleteSave(saveName: string): boolean {
    try {
      const saveKey = this.SAVE_KEY_PREFIX + saveName;
      localStorage.removeItem(saveKey);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Export save to file (download)
   */
  static exportSave(state: GameState, filename: string = 'save.json'): void {
    const saveData = {
      state,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import save from file
   */
  static importSave(file: File): Promise<GameState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          resolve(parsed.state);
        } catch (error) {
          reject(new Error('Failed to parse save file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
