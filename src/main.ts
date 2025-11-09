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
    this.uiManager.setDiplomacyCallback(() => this.handleDiplomacy());
    this.uiManager.setGreatPeopleCallback(() => this.handleGreatPeople());
    this.uiManager.setWorldWondersCallback(() => this.handleWorldWonders());

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

    // Auto-process AI turns with a delay for visual feedback
    const currentPlayer = this.gameState.getCurrentPlayer();
    if (currentPlayer.isAI) {
      this.processAITurns();
    }
  }

  private processAITurns() {
    setTimeout(() => {
      if (!this.gameState) return;

      const currentPlayer = this.gameState.getCurrentPlayer();

      // Keep cycling through AI turns until we reach a human player
      if (currentPlayer.isAI) {
        this.gameState.endTurn();
        this.processAITurns(); // Continue processing AI turns
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

    // Show technology tree UI
    this.uiManager.showTechnologyTree(currentPlayer, (techId: string) => {
      const success = this.gameState!.startResearch(currentPlayer, techId);

      // If research failed, show requirements
      if (!success) {
        this.uiManager.showResearchRequirements(currentPlayer, techId);
      }
    });
  }

  private handleDiplomacy() {
    if (!this.gameState) return;

    const currentPlayer = this.gameState.getCurrentPlayer();
    const state = this.gameState.getState();

    // Show diplomacy UI
    this.uiManager.showDiplomacy(currentPlayer, state.players, (action: string, targetId: string, data?: any) => {
      const diplomacyManager = state.diplomacyManager;

      switch (action) {
        case 'declare_war':
          if (diplomacyManager.declareWar(currentPlayer.id, targetId)) {
            this.gameState!.addNotification(`War declared on ${state.players.find(p => p.id === targetId)?.civilizationId}!`, 'warning');
          }
          break;

        case 'make_peace':
          if (diplomacyManager.makePeace(currentPlayer.id, targetId)) {
            this.gameState!.addNotification(`Peace made with ${state.players.find(p => p.id === targetId)?.civilizationId}`, 'success');
          }
          break;

        case 'form_alliance':
          if (diplomacyManager.formAlliance(currentPlayer.id, targetId, state.turn)) {
            this.gameState!.addNotification(`Alliance formed with ${state.players.find(p => p.id === targetId)?.civilizationId}!`, 'success');
          }
          break;

        case 'break_alliance':
          if (diplomacyManager.breakAlliance(currentPlayer.id, targetId)) {
            this.gameState!.addNotification(`Alliance broken with ${state.players.find(p => p.id === targetId)?.civilizationId}`, 'warning');
          }
          break;

        case 'propose_trade':
          // TODO: Open trade dialog
          this.gameState!.addNotification('Trade system coming soon!', 'info');
          break;
      }
    });
  }

  private handleGreatPeople() {
    if (!this.gameState) return;

    const currentPlayer = this.gameState.getCurrentPlayer();
    const state = this.gameState.getState();
    const greatPeopleManager = state.greatPeopleManager;

    // Get progress and earned great people
    const pointsProgress = greatPeopleManager.getProgress(currentPlayer.id);
    const earnedPeople = greatPeopleManager.getPlayerGreatPeople(currentPlayer.id);

    // Show great people UI
    this.uiManager.showGreatPeople(currentPlayer, pointsProgress, earnedPeople, (personId: string, cityId?: string) => {
      const city = cityId ? currentPlayer.cities.find(c => c.id === cityId) : undefined;

      // Use the great person's ability
      greatPeopleManager.useGreatPerson(personId, currentPlayer, city);

      // Remove from earned list (great people can only be used once)
      const personIndex = earnedPeople.findIndex(p => p.id === personId);
      if (personIndex >= 0) {
        const person = earnedPeople[personIndex];
        this.gameState!.addNotification(`${person.name} activated: ${person.ability.name}!`, 'success');
      }
    });
  }

  private handleWorldWonders() {
    if (!this.gameState) return;

    const currentPlayer = this.gameState.getCurrentPlayer();
    const state = this.gameState.getState();
    const wondersManager = state.worldWondersManager;

    // Show world wonders UI
    this.uiManager.showWorldWonders(currentPlayer, wondersManager, state.era, (wonderId: string, cityId: string) => {
      const city = currentPlayer.cities.find(c => c.id === cityId);
      if (!city) {
        this.gameState!.addNotification('City not found!', 'error');
        return;
      }

      // Check if wonder is available
      if (!wondersManager.isAvailable(wonderId)) {
        this.gameState!.addNotification('This wonder has already been built by another civilization!', 'warning');
        return;
      }

      // Build the wonder
      const success = wondersManager.buildWonder(wonderId, currentPlayer.id, cityId, state.turn);
      if (success) {
        const wonder = wondersManager.getWonder(wonderId);
        if (wonder) {
          this.gameState!.addNotification(`Started building ${wonder.name} in ${city.name}!`, 'success');

          // Execute onComplete callback if exists
          if (wonder.onComplete) {
            wonder.onComplete(currentPlayer, city);
          }
        }
      } else {
        this.gameState!.addNotification('Failed to build wonder!', 'error');
      }
    });
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
