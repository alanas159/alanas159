import { GameState, Player, Resources, GameConfig, City, Unit, Tile } from '../types';
import { MapGenerator } from '../map/MapGenerator';
import { CIVILIZATIONS } from '../civilizations/CivilizationData';

export class GameStateManager {
  private state: GameState;
  private mapGenerator: MapGenerator;

  constructor(config: GameConfig) {
    this.mapGenerator = new MapGenerator(config);

    this.state = {
      turn: 1,
      era: 'antiquity',
      players: [],
      currentPlayerId: '',
      map: [],
      config,
      selectedTile: null,
      selectedUnit: null
    };
  }

  // Initialize the game with a player's chosen civilization
  initializeGame(playerCivId: string): GameState {
    // Generate the map
    this.state.map = this.mapGenerator.generateMap();

    // Create human player
    const humanPlayer = this.createPlayer(playerCivId, false);
    this.state.players.push(humanPlayer);

    // Create AI players
    const availableCivs = CIVILIZATIONS.filter(civ => civ.id !== playerCivId);
    for (let i = 0; i < Math.min(this.state.config.numberOfAIPlayers, availableCivs.length); i++) {
      const aiCiv = availableCivs[i];
      const aiPlayer = this.createPlayer(aiCiv.id, true);
      this.state.players.push(aiPlayer);
    }

    // Set current player
    this.state.currentPlayerId = humanPlayer.id;

    // Place starting units and cities for all players
    this.placeStartingUnits();

    return this.state;
  }

  private createPlayer(civId: string, isAI: boolean): Player {
    const civ = CIVILIZATIONS.find(c => c.id === civId)!;

    return {
      id: `player-${civId}-${Date.now()}`,
      civilizationId: civId,
      resources: {
        food: 10,
        production: 10,
        gold: 50,
        science: 5,
        culture: 5
      },
      cities: [],
      units: [],
      territories: [],
      era: 'antiquity',
      isAI
    };
  }

  private placeStartingUnits() {
    const startingLocations: Array<{x: number; y: number}> = [];

    this.state.players.forEach(player => {
      // Find starting location
      const start = this.mapGenerator.findStartingLocation(this.state.map, startingLocations);
      startingLocations.push(start);

      // Reveal fog of war around starting location
      this.revealArea(start.x, start.y, 3);

      // Create starting city
      const city = this.foundCity(player.id, start.x, start.y, true);
      if (city) {
        player.cities.push(city);
      }

      // Create starting units
      const civ = CIVILIZATIONS.find(c => c.id === player.civilizationId)!;
      civ.startingUnits.forEach((unitType, index) => {
        const offset = index * 2;
        const unitX = start.x + offset;
        const unitY = start.y;

        const unit: Unit = {
          id: `unit-${Date.now()}-${index}`,
          type: unitType,
          ownerId: player.id,
          x: unitX,
          y: unitY,
          health: 100,
          maxHealth: 100,
          movement: unitType === 'settler' ? 2 : unitType === 'cavalry' ? 4 : 3,
          maxMovement: unitType === 'settler' ? 2 : unitType === 'cavalry' ? 4 : 3,
          attack: unitType === 'warrior' ? 10 : unitType === 'archer' ? 8 : unitType === 'cavalry' ? 12 : 5,
          defense: unitType === 'warrior' ? 8 : unitType === 'archer' ? 5 : unitType === 'cavalry' ? 6 : 10,
          hasActed: false
        };

        player.units.push(unit);
        this.state.map[unitY][unitX].unitId = unit.id;
      });
    });
  }

  private revealArea(centerX: number, centerY: number, radius: number) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x >= 0 && x < this.state.config.mapWidth && y >= 0 && y < this.state.config.mapHeight) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            this.state.map[y][x].explored = true;
            this.state.map[y][x].visible = true;
          }
        }
      }
    }
  }

  private foundCity(playerId: string, x: number, y: number, isCapital: boolean): City | null {
    const tile = this.state.map[y][x];
    if (tile.cityId || tile.terrain === 'ocean' || tile.terrain === 'mountains') {
      return null;
    }

    const cityNames = ['Capital', 'Secondus', 'Tertius', 'Quartus', 'Quintus'];
    const player = this.state.players.find(p => p.id === playerId)!;
    const cityName = cityNames[player.cities.length] || `City ${player.cities.length + 1}`;

    const city: City = {
      id: `city-${Date.now()}`,
      name: cityName,
      ownerId: playerId,
      x,
      y,
      population: 1,
      territories: [{x, y}],
      production: {
        food: 2,
        production: 1,
        gold: 1,
        science: 1,
        culture: 1
      },
      isCapital
    };

    tile.cityId = city.id;
    tile.ownerId = playerId;
    player.territories.push({x, y});

    return city;
  }

  // End current player's turn
  endTurn() {
    const currentPlayerIndex = this.state.players.findIndex(p => p.id === this.state.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.state.players.length;

    this.state.currentPlayerId = this.state.players[nextPlayerIndex].id;

    // If we're back to player 0, increment turn
    if (nextPlayerIndex === 0) {
      this.state.turn++;

      // Process turn for all players
      this.state.players.forEach(player => {
        this.processTurn(player);
      });
    }

    // Reset units for the new current player
    const currentPlayer = this.state.players[nextPlayerIndex];
    currentPlayer.units.forEach(unit => {
      unit.hasActed = false;
      unit.movement = unit.maxMovement;
    });
  }

  private processTurn(player: Player) {
    // Collect resources from cities
    player.cities.forEach(city => {
      const civ = CIVILIZATIONS.find(c => c.id === player.civilizationId)!;

      // Base city production
      Object.entries(city.production).forEach(([resource, amount]) => {
        player.resources[resource as keyof Resources] += amount;
      });

      // Add bonuses from civilization
      civ.bonuses.forEach(bonus => {
        if (!bonus.terrain) {
          player.resources[bonus.type] += bonus.amount;
        } else {
          // Check territories for matching terrain
          city.territories.forEach(territory => {
            const tile = this.state.map[territory.y][territory.x];
            if (tile.terrain === bonus.terrain) {
              player.resources[bonus.type] += bonus.amount;
            }
          });
        }
      });
    });

    // Grow population (simplified)
    player.cities.forEach(city => {
      if (player.resources.food >= city.population * 10) {
        city.population++;
        player.resources.food -= city.population * 10;
      }
    });
  }

  getState(): GameState {
    return this.state;
  }

  getCurrentPlayer(): Player {
    return this.state.players.find(p => p.id === this.state.currentPlayerId)!;
  }

  selectTile(x: number, y: number) {
    this.state.selectedTile = { x, y };
  }

  getTile(x: number, y: number): Tile | null {
    if (x >= 0 && x < this.state.config.mapWidth && y >= 0 && y < this.state.config.mapHeight) {
      return this.state.map[y][x];
    }
    return null;
  }
}
