import { GameStateManager } from './core/GameState';
import { Renderer } from './core/Renderer';
import { UIManager } from './ui/UIManager';
import { GameConfig } from './types';

class EmpiresEternalGame {
  private gameState: GameStateManager | null = null;
  private renderer: Renderer;
  private uiManager: UIManager;
  private canvas: HTMLCanvasElement;
  private animationFrameId: number | null = null;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new Renderer(this.canvas);
    this.uiManager = new UIManager();

    this.init();
  }

  private init() {
    this.uiManager.showCivilizationSelection((civId) => {
      this.startGame(civId);
    });

    this.uiManager.setEndTurnCallback(() => this.endTurn());
    this.uiManager.setBuildCityCallback(() => this.buildCity());
    this.uiManager.setRecruitUnitCallback(() => this.recruitUnit());
    this.uiManager.setResearchCallback(() => this.openResearchMenu());

    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    window.addEventListener('resize', () => this.handleResize());
  }

  private startGame(civId: string) {
    const config: GameConfig = {
      mapWidth: 80,
      mapHeight: 50,
      seed: Date.now(),
      numberOfAIPlayers: 3
    };

    this.gameState = new GameStateManager(config);
    const state = this.gameState.initializeGame(civId);

    const player = this.gameState.getCurrentPlayer();
    if (player.cities.length > 0) {
      const startCity = player.cities[0];
      this.renderer.centerOn(startCity.x, startCity.y);
    }

    this.startGameLoop();
  }

  private startGameLoop() {
    const gameLoop = () => {
      if (this.gameState) {
        const state = this.gameState.getState();
        const currentPlayer = this.gameState.getCurrentPlayer();

        this.renderer.render(state);

        this.uiManager.updateUI(state, currentPlayer);

        if (state.selectedTile) {
          const tile = this.gameState.getTile(state.selectedTile.x, state.selectedTile.y);
          this.uiManager.updateTileInfo(tile, state);
        }
      }

      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  private handleCanvasClick(e: MouseEvent) {
    if (!this.gameState) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tilePos = this.renderer.screenToTile(x, y);
    const state = this.gameState.getState();

    if (tilePos.x >= 0 && tilePos.x < state.config.mapWidth &&
        tilePos.y >= 0 && tilePos.y < state.config.mapHeight) {

      this.gameState.selectTile(tilePos.x, tilePos.y);

      const tile = this.gameState.getTile(tilePos.x, tilePos.y);
      this.uiManager.updateTileInfo(tile, state);
    }
  }

  private endTurn() {
    if (!this.gameState) return;

    this.gameState.endTurn();

    const currentPlayer = this.gameState.getCurrentPlayer();
    if (currentPlayer.isAI) {
      this.processAITurn(currentPlayer);
    }
  }

  private processAITurn(player: any) {
    setTimeout(() => {
      if (this.gameState) {
        this.gameState.endTurn();

        const nextPlayer = this.gameState.getCurrentPlayer();
        if (nextPlayer.isAI) {
          this.processAITurn(nextPlayer);
        }
      }
    }, 500);
  }

  private buildCity() {
    if (!this.gameState) return;

    const state = this.gameState.getState();
    const currentPlayer = this.gameState.getCurrentPlayer();

    if (state.selectedTile) {
      const tile = this.gameState.getTile(state.selectedTile.x, state.selectedTile.y);

      if (tile?.unitId) {
        const unit = currentPlayer.units.find(u => u.id === tile.unitId);

        if (unit && unit.type === 'settler' && unit.ownerId === currentPlayer.id) {
          this.gameState.addNotification('City founding: Click settler then build city button', 'info');
        } else {
          this.gameState.addNotification('Select your settler unit to found a city', 'warning');
        }
      }
    }
  }

  private recruitUnit() {
    if (!this.gameState) return;

    const state = this.gameState.getState();
    const currentPlayer = this.gameState.getCurrentPlayer();

    if (state.selectedTile) {
      const tile = this.gameState.getTile(state.selectedTile.x, state.selectedTile.y);

      if (tile?.cityId) {
        const city = currentPlayer.cities.find(c => c.id === tile.cityId);

        if (city) {
          const unitType = prompt('Recruit: warrior, archer, spearman, cavalry, swordsman');
          if (unitType && ['warrior', 'archer', 'spearman', 'cavalry', 'swordsman', 'siege'].includes(unitType)) {
            this.gameState.recruitUnit(city, unitType as any);
          }
        }
      } else {
        this.gameState.addNotification('Select a city to recruit units', 'warning');
      }
    }
  }

  private openResearchMenu() {
    if (!this.gameState) return;

    const currentPlayer = this.gameState.getCurrentPlayer();

    if (currentPlayer.currentResearch) {
      this.gameState.addNotification('Already researching a technology', 'info');
      return;
    }

    const tech = prompt('Research: agriculture, mining, writing, archery, bronze_working, animal_husbandry');

    if (tech) {
      this.gameState.startResearch(currentPlayer, tech);
    }
  }

  private handleResize() {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new EmpiresEternalGame();
});
