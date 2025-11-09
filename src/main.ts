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
    // Show civilization selection
    this.uiManager.showCivilizationSelection((civId) => {
      this.startGame(civId);
    });

    // Setup UI callbacks
    this.uiManager.setEndTurnCallback(() => this.endTurn());
    this.uiManager.setBuildCityCallback(() => this.buildCity());
    this.uiManager.setRecruitUnitCallback(() => this.recruitUnit());

    // Setup canvas click handler
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  private startGame(civId: string) {
    // Create game configuration
    const config: GameConfig = {
      mapWidth: 80,
      mapHeight: 50,
      seed: Date.now(),
      numberOfAIPlayers: 3
    };

    // Initialize game state
    this.gameState = new GameStateManager(config);
    const state = this.gameState.initializeGame(civId);

    // Center camera on player's starting position
    const player = this.gameState.getCurrentPlayer();
    if (player.cities.length > 0) {
      const startCity = player.cities[0];
      this.renderer.centerOn(startCity.x, startCity.y);
    }

    // Start game loop
    this.startGameLoop();
  }

  private startGameLoop() {
    const gameLoop = () => {
      if (this.gameState) {
        const state = this.gameState.getState();
        const currentPlayer = this.gameState.getCurrentPlayer();

        // Render the game
        this.renderer.render(state);

        // Update UI
        this.uiManager.updateUI(state, currentPlayer);

        // Update tile info if a tile is selected
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

    // Check if click is within map bounds
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

    // Check if it's an AI's turn and process it
    const currentPlayer = this.gameState.getCurrentPlayer();
    if (currentPlayer.isAI) {
      this.processAITurn(currentPlayer);
    }
  }

  private processAITurn(player: any) {
    // Simple AI: just end turn immediately for now
    // In the future, this would include AI decision making
    setTimeout(() => {
      if (this.gameState) {
        this.gameState.endTurn();

        // Check if next player is also AI
        const nextPlayer = this.gameState.getCurrentPlayer();
        if (nextPlayer.isAI) {
          this.processAITurn(nextPlayer);
        }
      }
    }, 500); // Small delay to show AI turn
  }

  private buildCity() {
    if (!this.gameState) return;

    const state = this.gameState.getState();
    const currentPlayer = this.gameState.getCurrentPlayer();

    // Check if a settler is selected
    if (state.selectedTile) {
      const tile = this.gameState.getTile(state.selectedTile.x, state.selectedTile.y);

      if (tile?.unitId) {
        const unit = currentPlayer.units.find(u => u.id === tile.unitId);

        if (unit && unit.type === 'settler') {
          // TODO: Implement city founding
          console.log('City founding will be implemented');
          alert('City founding feature coming soon!');
        } else {
          alert('Select a settler unit to found a city');
        }
      } else {
        alert('Select a settler unit to found a city');
      }
    }
  }

  private recruitUnit() {
    if (!this.gameState) return;
    alert('Unit recruitment feature coming soon!');
  }

  private handleResize() {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EmpiresEternalGame();
});
