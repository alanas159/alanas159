import { GameState } from '../types';

export class SaveLoadManager {
  private static readonly SAVE_KEY = 'empires_eternal_save';
  private static readonly MAX_SAVES = 5;

  /**
   * Save current game state
   */
  static saveGame(state: GameState, saveName: string = 'autosave'): boolean {
    try {
      const saveData = {
        name: saveName,
        timestamp: Date.now(),
        turn: state.turn,
        state: this.serializeState(state)
      };

      // Get existing saves
      const saves = this.getAllSaves();

      // Add or update save
      const existingIndex = saves.findIndex(s => s.name === saveName);
      if (existingIndex >= 0) {
        saves[existingIndex] = saveData;
      } else {
        saves.push(saveData);
      }

      // Keep only last MAX_SAVES
      if (saves.length > this.MAX_SAVES) {
        saves.sort((a, b) => b.timestamp - a.timestamp);
        saves.splice(this.MAX_SAVES);
      }

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state
   */
  static loadGame(saveName: string): GameState | null {
    try {
      const saves = this.getAllSaves();
      const save = saves.find(s => s.name === saveName);

      if (!save) {
        return null;
      }

      return this.deserializeState(save.state);
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Get all saves
   */
  static getAllSaves(): Array<{name: string; timestamp: number; turn: number; state: any}> {
    try {
      const data = localStorage.getItem(this.SAVE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete a save
   */
  static deleteSave(saveName: string): boolean {
    try {
      const saves = this.getAllSaves();
      const filtered = saves.filter(s => s.name !== saveName);
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Auto-save (called each turn)
   */
  static autoSave(state: GameState): void {
    this.saveGame(state, `autosave_turn_${state.turn}`);
  }

  /**
   * Serialize game state for storage
   */
  private static serializeState(state: GameState): string {
    return JSON.stringify(state);
  }

  /**
   * Deserialize game state from storage
   */
  private static deserializeState(data: string): GameState {
    return JSON.parse(data) as GameState;
  }

  /**
   * Export save to file
   */
  static exportSave(saveName: string): void {
    const save = this.getAllSaves().find(s => s.name === saveName);
    if (!save) return;

    const dataStr = JSON.stringify(save, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${saveName}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import save from file
   */
  static importSave(file: File, callback: (success: boolean) => void): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const saves = this.getAllSaves();
        saves.push(data);
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
        callback(true);
      } catch {
        callback(false);
      }
    };

    reader.readAsText(file);
  }
}
