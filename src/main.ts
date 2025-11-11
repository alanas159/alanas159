import { GameStateManager } from './core/GameState';
import { Renderer } from './core/Renderer';
import { UIManager } from './ui/UIManager';
import { GameConfig, City, Player } from './types';

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
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));

    window.addEventListener('resize', () => this.handleResize());

    // ESC key to cancel city founding mode
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.renderer.isCityFoundingMode()) {
        this.renderer.disableCityFoundingMode();
        if (this.gameState) {
          this.gameState.addNotification('City founding cancelled', 'info');
        }
      }
    });
  }

  private startGame(civId: string) {
    const config: GameConfig = {
      mapWidth: 80,
      mapHeight: 50,
      seed: Date.now(),
      numberOfAIPlayers: 3
    };

    this.gameState = new GameStateManager(config);

    // Connect renderer to game state for animations
    this.gameState.setRenderer(this.renderer);

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

      // Check if in city founding mode
      if (this.renderer.isCityFoundingMode()) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const selectedUnit = state.selectedUnit;

        if (selectedUnit && selectedUnit.type === 'settler' && selectedUnit.ownerId === currentPlayer.id) {
          // Attempt to found city at clicked location
          const tile = this.gameState.getTile(tilePos.x, tilePos.y);

          // Move settler to location first if not already there
          if (selectedUnit.x !== tilePos.x || selectedUnit.y !== tilePos.y) {
            this.gameState.moveUnit(selectedUnit, tilePos.x, tilePos.y);
          }

          // Try to found city
          const success = this.gameState.foundCityWithSettler(selectedUnit);
          if (success) {
            this.renderer.disableCityFoundingMode();
          }
        } else {
          this.renderer.disableCityFoundingMode();
        }
        return;
      }

      this.gameState.selectTile(tilePos.x, tilePos.y);

      const tile = this.gameState.getTile(tilePos.x, tilePos.y);
      this.uiManager.updateTileInfo(tile, state);

      // Check if selected a settler to enable city founding preview
      const currentPlayer = this.gameState.getCurrentPlayer();
      if (tile.unitId) {
        const selectedUnit = currentPlayer.units.find(u => u.id === tile.unitId);
        if (selectedUnit && selectedUnit.type === 'settler' && selectedUnit.ownerId === currentPlayer.id) {
          // Auto-enable city founding mode when settler selected
          // (user can cancel by pressing ESC or clicking elsewhere)
        }
      }
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

    // Enable city founding preview mode
    this.renderer.enableCityFoundingMode();
    this.gameState.addNotification('Click on a tile to found a city (ESC to cancel)', 'info');

    // Set initial preview at settler location
    const isValid = this.checkCityFoundingValid(selectedUnit.x, selectedUnit.y);
    this.renderer.setCityFoundingPreview(selectedUnit.x, selectedUnit.y, isValid);
  }

  private checkCityFoundingValid(x: number, y: number): boolean {
    if (!this.gameState) return false;

    const state = this.gameState.getState();
    const tile = state.map[y][x];

    // Can't build on ocean or mountains
    if (tile.terrain === 'ocean' || tile.terrain === 'mountains') {
      return false;
    }

    // Can't build on existing city
    if (tile.cityId) {
      return false;
    }

    // Check minimum distance from other cities (3 tiles)
    for (const player of state.players) {
      for (const city of player.cities) {
        const distance = Math.sqrt(Math.pow(city.x - x, 2) + Math.pow(city.y - y, 2));
        if (distance < 3) {
          return false;
        }
      }
    }

    return true;
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

    // If no city selected but player has cities, show city picker
    if (!selectedCity) {
      if (currentPlayer.cities.length === 0) {
        this.gameState.addNotification('You need a city to recruit units', 'warning');
        return;
      } else if (currentPlayer.cities.length === 1) {
        // Auto-select the only city
        selectedCity = currentPlayer.cities[0];
      } else {
        // Show city picker
        this.uiManager.showCitySelection(
          currentPlayer.cities,
          'Select City for Recruitment',
          'Choose which city will recruit the unit',
          (city) => {
            if (city) {
              this.showRecruitmentUIForCity(city, currentPlayer);
            }
          }
        );
        return;
      }
    }

    this.showRecruitmentUIForCity(selectedCity, currentPlayer);
  }

  private showRecruitmentUIForCity(city: City, player: Player) {
    // Show unit recruitment UI
    this.uiManager.showUnitRecruitment(city, player, (unitType) => {
      const success = this.gameState!.recruitUnit(city, unitType);

      // If recruitment failed, show requirements
      if (!success) {
        this.uiManager.showRecruitUnitRequirements(player, city, unitType);
      } else {
        this.gameState!.addNotification(`${city.name} is recruiting a new unit!`, 'success');
      }
    });
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
          // Show trade negotiation UI
          const otherPlayer = state.players.find(p => p.id === targetId);
          if (otherPlayer) {
            this.uiManager.showTradeNegotiation(currentPlayer, otherPlayer, (offer: any) => {
              // Evaluate AI response to trade offer
              const aiResponse = this.evaluateTradeOffer(offer, currentPlayer, otherPlayer);

              if (aiResponse === 'accept') {
                // Apply the trade
                this.applyTrade(offer, currentPlayer, otherPlayer);
                this.gameState!.addNotification(
                  `${otherPlayer.civilizationId} accepted your trade offer!`,
                  'success'
                );
              } else {
                // Reject the trade
                this.gameState!.addNotification(
                  `${otherPlayer.civilizationId} rejected your trade offer. Offer more or request less.`,
                  'warning'
                );
              }
            });
          }
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
      // If no city specified but ability requires a city, show city selection
      if (!cityId && currentPlayer.cities.length > 1) {
        this.uiManager.showCitySelection(
          currentPlayer.cities,
          'Select City',
          'Choose a city to activate this great person ability',
          (selectedCity) => {
            if (selectedCity) {
              greatPeopleManager.useGreatPerson(personId, currentPlayer, selectedCity);
              const personIndex = earnedPeople.findIndex(p => p.id === personId);
              if (personIndex >= 0) {
                const person = earnedPeople[personIndex];
                this.gameState!.addNotification(`${person.name} activated: ${person.ability.name}!`, 'success');
              }
            }
          }
        );
        return;
      }

      // Use first city or specified city
      const city = cityId ? currentPlayer.cities.find(c => c.id === cityId) : currentPlayer.cities[0];

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

  private handleCanvasMouseMove(e: MouseEvent) {
    if (!this.gameState || !this.renderer.isCityFoundingMode()) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tilePos = this.renderer.screenToTile(x, y);
    const state = this.gameState.getState();

    if (tilePos.x >= 0 && tilePos.x < state.config.mapWidth &&
        tilePos.y >= 0 && tilePos.y < state.config.mapHeight) {
      const isValid = this.checkCityFoundingValid(tilePos.x, tilePos.y);
      this.renderer.setCityFoundingPreview(tilePos.x, tilePos.y, isValid);
    }
  }

  /**
   * Evaluate trade offer and decide AI response
   * Returns: 'accept', 'reject', or 'counter'
   */
  private evaluateTradeOffer(offer: any, fromPlayer: any, toPlayer: any): 'accept' | 'reject' {
    // Calculate value of what's being offered
    let offerValue = 0;
    if (offer.offering.gold) offerValue += offer.offering.gold;
    if (offer.offering.goldPerTurn) offerValue += offer.offering.goldPerTurn * 20; // 20 turns worth
    if (offer.offering.resources) {
      offerValue += (offer.offering.resources.food || 0) * 10;
      offerValue += (offer.offering.resources.production || 0) * 15;
      offerValue += (offer.offering.resources.science || 0) * 20;
      offerValue += (offer.offering.resources.culture || 0) * 15;
    }
    if (offer.offering.technologies) {
      offerValue += offer.offering.technologies.length * 200; // Technologies are very valuable
    }

    // Calculate value of what's being requested
    let requestValue = 0;
    if (offer.requesting.gold) requestValue += offer.requesting.gold;
    if (offer.requesting.goldPerTurn) requestValue += offer.requesting.goldPerTurn * 20;
    if (offer.requesting.resources) {
      requestValue += (offer.requesting.resources.food || 0) * 10;
      requestValue += (offer.requesting.resources.production || 0) * 15;
      requestValue += (offer.requesting.resources.science || 0) * 20;
      requestValue += (offer.requesting.resources.culture || 0) * 15;
    }
    if (offer.requesting.technologies) {
      requestValue += offer.requesting.technologies.length * 200;
    }

    // Check if AI can afford what's being requested
    const canAfford =
      (!offer.requesting.gold || toPlayer.resources.gold >= offer.requesting.gold) &&
      (!offer.requesting.goldPerTurn || toPlayer.resources.gold >= offer.requesting.goldPerTurn * 5);

    if (!canAfford) {
      return 'reject';
    }

    // AI accepts if offered value is >= 80% of requested value (somewhat generous)
    const fairValue = requestValue * 0.8;
    return offerValue >= fairValue ? 'accept' : 'reject';
  }

  /**
   * Apply trade agreement between players
   */
  private applyTrade(offer: any, fromPlayer: any, toPlayer: any) {
    // Apply gold transfers
    if (offer.offering.gold) {
      fromPlayer.resources.gold -= offer.offering.gold;
      toPlayer.resources.gold += offer.offering.gold;
    }
    if (offer.requesting.gold) {
      toPlayer.resources.gold -= offer.requesting.gold;
      fromPlayer.resources.gold += offer.requesting.gold;
    }

    // Apply technology transfers
    if (offer.offering.technologies) {
      offer.offering.technologies.forEach((techId: string) => {
        if (!toPlayer.technologies.includes(techId)) {
          toPlayer.technologies.push(techId);
        }
      });
    }
    if (offer.requesting.technologies) {
      offer.requesting.technologies.forEach((techId: string) => {
        if (!fromPlayer.technologies.includes(techId)) {
          fromPlayer.technologies.push(techId);
        }
      });
    }

    // TODO: Add per-turn deals tracking (gold/resources per turn)
    // Would require a trade agreements system
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
