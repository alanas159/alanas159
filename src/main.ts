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
    this.uiManager.setBuildCityCallback(() => this.handleBuildCity());
    this.uiManager.setRecruitUnitCallback(() => this.handleRecruitUnit());
    this.uiManager.setResearchCallback(() => this.handleResearch());

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

    // Start tutorial if not completed
    this.uiManager.startTutorialIfNeeded();
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

  private handleBuildCity() {
    if (!this.gameState) return;

    const state = this.gameState.getState();
    const currentPlayer = this.gameState.getCurrentPlayer();

    // Get selected unit
    let selectedUnit = null;
    if (state.selectedTile) {
      const tile = this.gameState.getTile(state.selectedTile.x, state.selectedTile.y);
      if (tile?.unitId) {
        selectedUnit = currentPlayer.units.find(u => u.id === tile.unitId);
      }
    }

    // Check if we can found a city
    const canFound = selectedUnit && selectedUnit.type === 'settler' && selectedUnit.ownerId === currentPlayer.id;

    if (!canFound) {
      // Show requirements modal
      this.uiManager.showFoundCityRequirements(currentPlayer, selectedUnit);
      return;
    }

    // Attempt to found city with settler
    const success = this.gameState.foundCityWithSettler(selectedUnit);
    if (!success) {
      // Error notifications are handled inside foundCityWithSettler
    }
  }

  private handleRecruitUnit() {
    if (!this.gameState) return;

    const state = this.gameState.getState();
    const currentPlayer = this.gameState.getCurrentPlayer();

    // Get selected city
    let selectedCity = null;
    if (state.selectedTile) {
      const tile = this.gameState.getTile(state.selectedTile.x, state.selectedTile.y);
      if (tile?.cityId) {
        selectedCity = currentPlayer.cities.find(c => c.id === tile.cityId);
      }
    }

    if (!selectedCity) {
      this.gameState.addNotification('Select a city to recruit units', 'warning');
      return;
    }

    // Ask which unit to recruit
    const unitType = prompt('Recruit: warrior, archer, spearman, cavalry, swordsman, siege');
    if (unitType && ['warrior', 'archer', 'spearman', 'cavalry', 'swordsman', 'siege'].includes(unitType)) {
      const success = this.gameState.recruitUnit(selectedCity, unitType as any);

      // If recruitment failed, show requirements
      if (!success) {
        this.uiManager.showRecruitUnitRequirements(currentPlayer, selectedCity, unitType as any);
      }
    }
  }

  private handleResearch() {
    if (!this.gameState) return;

    const currentPlayer = this.gameState.getCurrentPlayer();

    if (currentPlayer.currentResearch) {
      this.gameState.addNotification('Already researching a technology', 'info');
      return;
    }

    const tech = prompt('Research tech ID (e.g., agriculture, mining, writing, archery, bronze_working, animal_husbandry, pottery, sailing, masonry, calendars, etc.)');

    if (tech) {
      const success = this.gameState.startResearch(currentPlayer, tech);

      // If research failed, show requirements
      if (!success) {
        this.uiManager.showResearchRequirements(currentPlayer, tech);
      }
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
