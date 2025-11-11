import { GameState, Player, Resources, GameConfig, City, Unit, Tile, BuildingType, UnitType } from '../types';
import { MapGenerator } from '../map/MapGenerator';
import { CIVILIZATIONS } from '../civilizations/CivilizationData';
import { Pathfinding } from './Pathfinding';
import { CombatSystem } from './CombatSystem';
import { getTechnologyById, canResearch, TECHNOLOGIES } from './TechnologyData';
import { getBuildingByType, canBuildBuilding } from './BuildingData';
import { getUnitData, canRecruitUnit, getUnitCostWithBonuses } from './UnitData';
import { AIManager } from './AIManager';
import { VictoryManager } from './VictoryManager';
import { SaveLoadManager } from './SaveLoadManager';
import { DiplomacyManager } from './DiplomacyManager';
import { RandomEventsManager, RANDOM_EVENTS } from './RandomEvents';
import { GreatPeopleManager } from '../data/GreatPeopleData';
import { WorldWondersManager } from '../data/WorldWondersData';
import { soundManager } from './SoundManager';
import { Renderer } from './Renderer';

export class GameStateManager {
  private state: GameState;
  private mapGenerator: MapGenerator;
  private aiManager: AIManager;
  public diplomacyManager: DiplomacyManager;
  public randomEventsManager: RandomEventsManager;
  public greatPeopleManager: GreatPeopleManager;
  public worldWondersManager: WorldWondersManager;
  private renderer: Renderer | null = null;

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
      selectedUnit: null,
      selectedCity: null,
      notifications: [],
      builtWonders: [],
      eventsHistory: []
    };

    // Initialize AI Manager
    this.aiManager = new AIManager(this);

    // Initialize Phase 3 managers
    this.diplomacyManager = new DiplomacyManager();
    this.randomEventsManager = new RandomEventsManager();
    this.greatPeopleManager = new GreatPeopleManager();
    this.worldWondersManager = new WorldWondersManager();
  }

  /**
   * Set the renderer for animations
   */
  setRenderer(renderer: Renderer) {
    this.renderer = renderer;
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

    // Initialize diplomacy between all players
    this.diplomacyManager.initializeDiplomacy(this.state.players);

    soundManager.click();

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
      isAI,
      technologies: [...civ.startingTechnologies], // Copy starting technologies
      currentResearch: undefined
    };
  }

  /**
   * Place starting units and cities for all players
   */
  private placeStartingUnits() {
    const startingLocations: Array<{x: number; y: number}> = [];

    this.state.players.forEach(player => {
      // Find starting location
      const start = this.mapGenerator.findStartingLocation(this.state.map, startingLocations);
      startingLocations.push(start);

      // Reveal fog of war around starting location
      this.revealArea(start.x, start.y, 3);

      // Create starting city (capital)
      const city = this.foundCity(player.id, start.x, start.y, true);
      if (city) {
        player.cities.push(city);
      }

      // Create starting units using UnitData
      const civ = CIVILIZATIONS.find(c => c.id === player.civilizationId)!;
      civ.startingUnits.forEach((unitType, index) => {
        const unitData = getUnitData(unitType);
        if (!unitData) return;

        // Place units around the starting city
        const offset = index * 2;
        const unitX = start.x + offset;
        const unitY = start.y;

        // Ensure the tile is valid
        if (unitX >= 0 && unitX < this.state.config.mapWidth &&
            unitY >= 0 && unitY < this.state.config.mapHeight) {

          const unit: Unit = {
            id: `unit-${Date.now()}-${index}-${Math.random()}`,
            type: unitType,
            ownerId: player.id,
            x: unitX,
            y: unitY,
            health: unitData.stats.health,
            maxHealth: unitData.stats.health,
            movement: this.getUnitMovementWithBonus(unitType, player.civilizationId),
            maxMovement: this.getUnitMovementWithBonus(unitType, player.civilizationId),
            attack: unitData.stats.attack,
            defense: unitData.stats.defense,
            hasActed: false
          };

          player.units.push(unit);
          this.state.map[unitY][unitX].unitId = unit.id;
        }
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

  /**
   * Found a new city at the specified location
   * @param playerId - The player founding the city
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param isCapital - Whether this is the capital city
   * @param settlerUnit - Optional settler unit to consume
   * @returns The founded city or null if unable to found
   */
  private foundCity(playerId: string, x: number, y: number, isCapital: boolean, settlerUnit?: Unit): City | null {
    const tile = this.state.map[y][x];

    // Validate terrain
    if (tile.cityId || tile.terrain === 'ocean' || tile.terrain === 'mountains') {
      return null;
    }

    // Check minimum distance from other cities (at least 3 tiles apart)
    if (!isCapital && !this.isValidCityLocation(x, y, 3)) {
      this.addNotification('Cities must be at least 3 tiles apart', 'warning');
      return null;
    }

    const player = this.state.players.find(p => p.id === playerId)!;
    const civ = CIVILIZATIONS.find(c => c.id === player.civilizationId)!;

    // Use civilization's capital name for first city, generic names for others
    let cityName: string;
    if (isCapital) {
      cityName = civ.capitalName;
    } else {
      const cityNames = ['Secondus', 'Tertius', 'Quartus', 'Quintus', 'Sextus', 'Septimus'];
      cityName = cityNames[player.cities.length - 1] || `City ${player.cities.length + 1}`;
    }

    // Base production values
    let baseProduction = {
      food: 2,
      production: 1,
      gold: 1,
      science: 1,
      culture: 1
    };

    // Capital cities get bonuses
    if (isCapital) {
      baseProduction = {
        food: 3,
        production: 2,
        gold: 2,
        science: 2,
        culture: 3
      };
    }

    // Add terrain bonuses
    const terrainBonus = this.getTerrainProduction(tile);
    Object.entries(terrainBonus).forEach(([resource, amount]) => {
      baseProduction[resource as keyof Resources] += amount;
    });

    const city: City = {
      id: `city-${Date.now()}`,
      name: cityName,
      ownerId: playerId,
      x,
      y,
      population: 1,
      territories: [{x, y}],
      production: baseProduction,
      isCapital,
      buildings: [],
      currentProduction: undefined
    };

    tile.cityId = city.id;
    tile.ownerId = playerId;
    player.territories.push({x, y});

    // Consume settler unit if provided
    if (settlerUnit) {
      this.removeUnit(settlerUnit);
    }

    this.addNotification(`Founded ${cityName}${isCapital ? ' (Capital)' : ''}!`, 'success');
    return city;
  }

  /**
   * Check if a location is valid for founding a city
   */
  private isValidCityLocation(x: number, y: number, minDistance: number): boolean {
    // Check distance from all existing cities
    for (const player of this.state.players) {
      for (const city of player.cities) {
        const distance = Math.sqrt(Math.pow(city.x - x, 2) + Math.pow(city.y - y, 2));
        if (distance < minDistance) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get base production from terrain
   */
  private getTerrainProduction(tile: Tile): Partial<Record<keyof Resources, number>> {
    const production: Partial<Record<keyof Resources, number>> = {};

    switch (tile.terrain) {
      case 'grassland':
        production.food = 2;
        break;
      case 'plains':
        production.food = 1;
        production.production = 1;
        break;
      case 'hills':
        production.production = 2;
        break;
      case 'forest':
        production.production = 1;
        production.food = 1;
        break;
      case 'jungle':
        production.food = 1;
        production.science = 1;
        break;
      case 'desert':
        production.gold = 1;
        break;
    }

    // River bonus
    if (tile.hasRiver) {
      production.food = (production.food || 0) + 1;
      production.gold = (production.gold || 0) + 1;
    }

    return production;
  }

  /**
   * Public method to found a city with a settler
   */
  foundCityWithSettler(settlerUnit: Unit): boolean {
    const player = this.state.players.find(p => p.id === settlerUnit.ownerId)!;

    // Validate settler unit
    const unitData = getUnitData(settlerUnit.type);
    if (!unitData?.canFoundCity) {
      this.addNotification('Only settlers can found cities', 'warning');
      return false;
    }

    const city = this.foundCity(player.id, settlerUnit.x, settlerUnit.y, false, settlerUnit);
    if (city) {
      player.cities.push(city);

      // Reveal area around new city
      this.revealArea(city.x, city.y, 2);

      return true;
    }

    return false;
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
        this.processTerritoryOccupation(player);
      });

      // Process Phase 3 systems
      this.diplomacyManager.processTrades(this.state.turn, this.state.players);
      this.randomEventsManager.processEvents(this.state.turn, this.state.players, this.state);

      // Process random events notifications
      RANDOM_EVENTS.forEach(event => {
        const triggered = this.state.eventsHistory?.find(
          e => e.turn === this.state.turn && e.eventId === event.id
        );
        if (triggered) {
          soundManager.eventTriggered();
          this.addNotification(`${event.icon} ${event.name}: ${event.description}`, 'info');
        }
      });

      // Add Great People points based on buildings and wonders
      this.state.players.forEach(player => {
        player.cities.forEach(city => {
          // +1 scientist point per Library
          if (city.buildings.includes('library')) {
            this.greatPeopleManager.addPoints(player.id, 'scientist', 1);
          }
          // +1 engineer point per Workshop
          if (city.buildings.includes('workshop')) {
            this.greatPeopleManager.addPoints(player.id, 'engineer', 1);
          }
          // +1 artist point per Temple
          if (city.buildings.includes('temple')) {
            this.greatPeopleManager.addPoints(player.id, 'artist', 1);
          }
          // +1 merchant point per Market
          if (city.buildings.includes('market')) {
            this.greatPeopleManager.addPoints(player.id, 'merchant', 1);
          }
        });
      });

      // Check victory conditions every turn
      const victoryResult = VictoryManager.checkVictory(this.state);
      if (victoryResult) {
        this.state.gameEnded = true;
        this.state.winner = victoryResult.winner;
        this.state.victoryType = victoryResult.type as any;

        const winningPlayer = this.state.players.find(p => p.id === victoryResult.winner);
        const civName = CIVILIZATIONS.find(c => c.id === winningPlayer?.civilizationId)?.name || 'Unknown';

        this.addNotification(
          `🏆 ${civName} has achieved a ${victoryResult.type} victory!`,
          'success'
        );
      }

      // Auto-save every 10 turns
      if (this.state.turn % 10 === 0) {
        SaveLoadManager.autoSave(this.state);
      }
    }

    // Reset units for the new current player
    const currentPlayer = this.state.players[nextPlayerIndex];
    currentPlayer.units.forEach(unit => {
      unit.hasActed = false;
      unit.movement = unit.maxMovement;
    });

    // Process AI turn if current player is AI
    if (currentPlayer.isAI) {
      this.aiManager.processTurn(currentPlayer);
    }
  }

  /**
   * Process turn for a player - collect resources, research, city growth, etc.
   */
  private processTurn(player: Player) {
    const civ = CIVILIZATIONS.find(c => c.id === player.civilizationId)!;

    // Collect resources from cities
    player.cities.forEach(city => {
      // Base city production
      Object.entries(city.production).forEach(([resource, amount]) => {
        player.resources[resource as keyof Resources] += amount;
      });

      // Capital bonus: +50% to all yields
      if (city.isCapital) {
        Object.entries(city.production).forEach(([resource, amount]) => {
          player.resources[resource as keyof Resources] += Math.floor(amount * 0.5);
        });
      }

      // Add bonuses from buildings
      city.buildings.forEach(buildingType => {
        const building = getBuildingByType(buildingType);
        Object.entries(building.effects).forEach(([resource, amount]) => {
          player.resources[resource as keyof Resources] += amount;
        });
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

      // Process city production queue
      if (city.currentProduction) {
        const productionPerTurn = city.production.production || 1;
        city.currentProduction.progress += productionPerTurn;

        if (city.currentProduction.progress >= city.currentProduction.required) {
          // Production complete!
          if (city.currentProduction.type === 'building') {
            const buildingType = Object.keys(getBuildingByType).find(
              key => getBuildingByType(key as any).name === city.currentProduction!.name
            ) as BuildingType;

            if (buildingType) {
              city.buildings.push(buildingType);
              this.addNotification(`${city.name} completed ${city.currentProduction.name}!`, 'success');
            }
          }
          city.currentProduction = undefined;
        }
      }

      // City growth
      this.processCityGrowth(city, player);
    });

    // Process technology research
    if (player.currentResearch) {
      const sciencePerTurn = Math.max(1, Math.floor(player.resources.science / 2));
      player.currentResearch.progress += sciencePerTurn;

      const tech = getTechnologyById(player.currentResearch.techId);
      if (tech && player.currentResearch.progress >= tech.cost) {
        // Research complete!
        player.technologies.push(tech.id);
        soundManager.techResearched();
        this.addNotification(`Researched ${tech.name}!`, 'success');
        player.currentResearch = undefined;

        // Check for era advancement
        this.checkEraAdvancement(player);
      }
    }
  }

  /**
   * Process city population growth
   */
  private processCityGrowth(city: City, player: Player) {
    // Food required for next population = current population * 15
    const foodRequired = city.population * 15;
    const foodPerTurn = city.production.food || 0;

    // Track food accumulation (simplified - using player resources as temporary storage)
    const cityFoodKey = `city_${city.id}_food`;

    // Simple growth: every few turns based on food production
    if (foodPerTurn >= 3 && this.state.turn % 10 === 0) {
      city.population++;

      // Expand territory when population grows
      if (city.population % 3 === 0) {
        this.expandCityTerritory(city);
      }

      // Update city production based on new population
      city.production.food = (city.production.food || 0) + 0.5;
      city.production.production = (city.production.production || 0) + 0.5;

      this.addNotification(`${city.name} grew to population ${city.population}!`, 'success');
    }
  }

  /**
   * Expand city territory to adjacent tiles
   */
  private expandCityTerritory(city: City) {
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1],
      [0, 1], [-1, 1], [-1, 0], [-1, -1]
    ];

    for (const [dx, dy] of directions) {
      const x = city.x + dx;
      const y = city.y + dy;

      if (x >= 0 && x < this.state.config.mapWidth && y >= 0 && y < this.state.config.mapHeight) {
        const tile = this.state.map[y][x];

        // Check if tile is not already owned and is valid terrain
        if (!tile.ownerId && tile.terrain !== 'ocean' && tile.terrain !== 'mountains') {
          // Check if not already in city territories
          const alreadyOwned = city.territories.some(t => t.x === x && t.y === y);
          if (!alreadyOwned) {
            city.territories.push({x, y});
            tile.ownerId = city.ownerId;

            // Add terrain production to city
            const terrainBonus = this.getTerrainProduction(tile);
            Object.entries(terrainBonus).forEach(([resource, amount]) => {
              city.production[resource as keyof Resources] =
                (city.production[resource as keyof Resources] || 0) + amount;
            });

            return; // Expand one tile at a time
          }
        }
      }
    }
  }

  /**
   * Check if player should advance to next era
   */
  private checkEraAdvancement(player: Player) {
    const techCount = player.technologies.length;

    // Count technologies by era
    const antiquityTechs = player.technologies.filter(techId => {
      const tech = getTechnologyById(techId);
      return tech?.era === 'antiquity';
    }).length;

    const medievalTechs = player.technologies.filter(techId => {
      const tech = getTechnologyById(techId);
      return tech?.era === 'medieval';
    }).length;

    // Advance to Medieval era if 6+ antiquity techs researched
    if (player.era === 'antiquity' && antiquityTechs >= 6) {
      player.era = 'medieval';
      this.addNotification('Advanced to Medieval Era!', 'success');
    }

    // Advance to Modern era if 6+ medieval techs researched
    if (player.era === 'medieval' && medievalTechs >= 6) {
      player.era = 'modern';
      this.addNotification('Advanced to Modern Era!', 'success');
    }

    // Update game state era based on most advanced player
    const mostAdvancedEra = this.getMostAdvancedEra();
    if (mostAdvancedEra !== this.state.era) {
      this.state.era = mostAdvancedEra;
    }
  }

  /**
   * Get the most advanced era among all players
   */
  private getMostAdvancedEra(): 'antiquity' | 'medieval' | 'modern' {
    const eraOrder = { 'antiquity': 0, 'medieval': 1, 'modern': 2 };
    let maxEra: 'antiquity' | 'medieval' | 'modern' = 'antiquity';
    let maxValue = 0;

    for (const player of this.state.players) {
      const eraValue = eraOrder[player.era];
      if (eraValue > maxValue) {
        maxValue = eraValue;
        maxEra = player.era;
      }
    }

    return maxEra;
  }

  /**
   * Process territory occupation by units
   * Units staying on neutral/enemy tiles can capture them over time
   */
  private processTerritoryOccupation(player: Player) {
    player.units.forEach(unit => {
      const tile = this.state.map[unit.y][unit.x];

      // Skip if tile already owned by this player or has a city
      if (tile.ownerId === player.id || tile.cityId) {
        return;
      }

      // Military units can capture territory
      const isMilitaryUnit = unit.type !== 'settler';

      if (isMilitaryUnit) {
        // Check if unit is occupying this tile
        if (tile.occupyingUnitId === unit.id) {
          // Increment occupation progress
          // Military units capture 2x faster (1.5 turns vs 3 turns)
          const progressIncrement = isMilitaryUnit ? 2 : 1;
          tile.occupationProgress = (tile.occupationProgress || 0) + progressIncrement;

          // Capture threshold: 3 points (military units: 1.5 turns, civilian: 3 turns)
          if (tile.occupationProgress >= 3) {
            this.captureTile(tile, player);
          }
        } else {
          // Unit just arrived, start occupation
          tile.occupyingUnitId = unit.id;
          tile.occupationProgress = 1;
        }
      }
    });

    // Clean up occupation data for tiles no longer occupied
    for (let y = 0; y < this.state.config.mapHeight; y++) {
      for (let x = 0; x < this.state.config.mapWidth; x++) {
        const tile = this.state.map[y][x];

        if (tile.occupyingUnitId) {
          // Check if the occupying unit still exists and is on this tile
          const unit = player.units.find(u => u.id === tile.occupyingUnitId);

          if (!unit || unit.x !== x || unit.y !== y) {
            // Unit moved away or was destroyed, reset occupation
            tile.occupyingUnitId = undefined;
            tile.occupationProgress = 0;
          }
        }
      }
    }
  }

  /**
   * Capture a tile and assign it to nearest friendly city
   */
  private captureTile(tile: Tile, player: Player) {
    // Find nearest city
    let nearestCity: City | null = null;
    let minDistance = Infinity;

    for (const city of player.cities) {
      const distance = Math.sqrt(
        Math.pow(city.x - tile.x, 2) + Math.pow(city.y - tile.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    if (nearestCity && minDistance <= 5) {
      // Only capture if within 5 tiles of a city
      const oldOwnerId = tile.ownerId;

      // Update tile ownership
      tile.ownerId = player.id;
      tile.occupyingUnitId = undefined;
      tile.occupationProgress = 0;

      // Add to city territories
      nearestCity.territories.push({ x: tile.x, y: tile.y });
      player.territories.push({ x: tile.x, y: tile.y });

      // Add terrain production to city
      const terrainBonus = this.getTerrainProduction(tile);
      Object.entries(terrainBonus).forEach(([resource, amount]) => {
        nearestCity!.production[resource as keyof Resources] =
          (nearestCity!.production[resource as keyof Resources] || 0) + amount;
      });

      // Remove from old owner's territories if applicable
      if (oldOwnerId) {
        const oldOwner = this.state.players.find(p => p.id === oldOwnerId);
        if (oldOwner) {
          oldOwner.territories = oldOwner.territories.filter(
            t => !(t.x === tile.x && t.y === tile.y)
          );

          // Remove from old city territories
          for (const city of oldOwner.cities) {
            city.territories = city.territories.filter(
              t => !(t.x === tile.x && t.y === tile.y)
            );
          }
        }
      }

      this.addNotification(
        `Captured territory near ${nearestCity.name}!`,
        'success'
      );
    }
  }

  getState(): GameState {
    return this.state;
  }

  getCurrentPlayer(): Player {
    return this.state.players.find(p => p.id === this.state.currentPlayerId)!;
  }

  selectTile(x: number, y: number) {
    this.state.selectedTile = { x, y };

    const tile = this.getTile(x, y);
    const currentPlayer = this.getCurrentPlayer();

    // Check if there's a unit on this tile
    if (tile?.unitId) {
      // First check if it's an enemy unit and we have a unit selected
      const allPlayers = this.state.players;
      let enemyUnit: Unit | null = null;

      for (const player of allPlayers) {
        if (player.id !== currentPlayer.id) {
          const unit = player.units.find(u => u.id === tile.unitId);
          if (unit) {
            enemyUnit = unit;
            break;
          }
        }
      }

      if (enemyUnit && this.state.selectedUnit &&
          this.state.selectedUnit.ownerId === currentPlayer.id &&
          !this.state.selectedUnit.hasActed) {
        // Try to attack the enemy unit
        const defenderOwner = this.state.players.find(p => p.id === enemyUnit.ownerId);

        // Auto-declare war if not already at war
        if (defenderOwner) {
          const diplomacyManager = this.state.diplomacyManager;
          const relation = diplomacyManager.getRelation(currentPlayer.id, defenderOwner.id);

          if (relation !== 'war') {
            diplomacyManager.declareWar(currentPlayer.id, defenderOwner.id);
            this.addNotification(`War declared on ${defenderOwner.civilizationId}!`, 'warning');
          }
        }

        // Attempt attack
        this.attackUnit(this.state.selectedUnit, enemyUnit);
        return; // Don't proceed with selection logic
      }

      // If it's our own unit, select it
      const unit = currentPlayer.units.find(u => u.id === tile.unitId);
      if (unit) {
        this.state.selectedUnit = unit;
      } else {
        this.state.selectedUnit = null;
      }
    } else {
      // Check if we should move selected unit to this tile
      if (this.state.selectedUnit) {
        if (this.state.selectedUnit.ownerId === currentPlayer.id &&
            !this.state.selectedUnit.hasActed) {
          // Try to move the unit
          this.moveUnit(this.state.selectedUnit, x, y);
        }
      }
      this.state.selectedUnit = null;
    }

    // Set selected city if there's a city on this tile
    if (tile?.cityId) {
      const city = currentPlayer.cities.find(c => c.id === tile.cityId);
      if (city) {
        this.state.selectedCity = city;
      } else {
        this.state.selectedCity = null;
      }
    } else {
      this.state.selectedCity = null;
    }
  }

  getTile(x: number, y: number): Tile | null {
    if (x >= 0 && x < this.state.config.mapWidth && y >= 0 && y < this.state.config.mapHeight) {
      return this.state.map[y][x];
    }
    return null;
  }

  // ========== TECHNOLOGY SYSTEM ==========

  /**
   * Start researching a technology
   * Validates prerequisites and current research status
   */
  startResearch(player: Player, techId: string): boolean {
    // Check if already researching
    if (player.currentResearch) {
      this.addNotification('Already researching a technology', 'warning');
      return false;
    }

    // Validate technology exists
    const tech = getTechnologyById(techId);
    if (!tech) {
      this.addNotification('Unknown technology', 'error');
      return false;
    }

    // Check if already researched
    if (player.technologies.includes(techId)) {
      this.addNotification(`Already researched ${tech.name}`, 'warning');
      return false;
    }

    // Check prerequisites
    if (!canResearch(techId, player.technologies)) {
      const missingPrereqs = tech.prerequisites
        .filter(prereq => !player.technologies.includes(prereq))
        .map(prereq => getTechnologyById(prereq)?.name || prereq);

      this.addNotification(
        `Requires: ${missingPrereqs.join(', ')}`,
        'warning'
      );
      return false;
    }

    // Start research
    player.currentResearch = {
      techId,
      progress: 0
    };

    this.addNotification(`Researching ${tech.name} (Cost: ${tech.cost})`, 'info');
    return true;
  }

  /**
   * Get available technologies to research
   */
  getAvailableTechnologies(player: Player): string[] {
    return TECHNOLOGIES
      .filter(tech => canResearch(tech.id, player.technologies))
      .map(tech => tech.id);
  }

  // ========== BUILDING SYSTEM ==========

  startBuildingConstruction(city: City, buildingType: BuildingType): boolean {
    const player = this.state.players.find(p => p.id === city.ownerId)!;

    if (!canBuildBuilding(buildingType, city.buildings, player.technologies)) {
      this.addNotification('Cannot build this yet', 'warning');
      return false;
    }

    const building = getBuildingByType(buildingType);
    const productionCost = building.cost.production || 0;

    city.currentProduction = {
      type: 'building',
      name: building.name,
      progress: 0,
      required: productionCost
    };

    this.addNotification(`${city.name} is building ${building.name}`, 'info');
    return true;
  }

  // ========== UNIT SYSTEM ==========

  /**
   * Recruit a unit in a city
   * Checks technology requirements, resources, and civilization bonuses
   */
  recruitUnit(city: City, unitType: UnitType): boolean {
    const player = this.state.players.find(p => p.id === city.ownerId)!;
    const unitData = getUnitData(unitType);

    // Validate unit type
    if (!unitData) {
      this.addNotification('Invalid unit type', 'error');
      return false;
    }

    // Check technology requirements
    if (!canRecruitUnit(unitType, player.technologies)) {
      const techName = unitData.requiredTech
        ? getTechnologyById(unitData.requiredTech)?.name
        : 'Unknown';
      this.addNotification(
        `Requires ${techName} technology`,
        'warning'
      );
      return false;
    }

    // Get costs with civilization bonuses
    const costs = getUnitCostWithBonuses(unitType, player.civilizationId);

    // Check if can afford
    if (player.resources.production < costs.production) {
      this.addNotification(
        `Need ${costs.production} production (have ${Math.floor(player.resources.production)})`,
        'warning'
      );
      return false;
    }

    if (costs.gold && player.resources.gold < costs.gold) {
      this.addNotification(
        `Need ${costs.gold} gold (have ${Math.floor(player.resources.gold)})`,
        'warning'
      );
      return false;
    }

    // Find empty adjacent tile
    const spawnTile = this.findEmptyAdjacentTile(city.x, city.y);
    if (!spawnTile) {
      this.addNotification('No space to recruit unit - city surrounded', 'warning');
      return false;
    }

    // Deduct costs
    player.resources.production -= costs.production;
    if (costs.gold) {
      player.resources.gold -= costs.gold;
    }

    // Create unit with stats from UnitData
    const unit: Unit = {
      id: `unit-${Date.now()}-${Math.random()}`,
      type: unitType,
      ownerId: player.id,
      x: spawnTile.x,
      y: spawnTile.y,
      health: unitData.stats.health,
      maxHealth: unitData.stats.health,
      movement: this.getUnitMovementWithBonus(unitType, player.civilizationId),
      maxMovement: this.getUnitMovementWithBonus(unitType, player.civilizationId),
      attack: unitData.stats.attack,
      defense: unitData.stats.defense,
      hasActed: false
    };

    player.units.push(unit);
    this.state.map[spawnTile.y][spawnTile.x].unitId = unit.id;

    soundManager.unitRecruited();
    this.addNotification(`${city.name} recruited ${unitData.name}!`, 'success');
    return true;
  }

  /**
   * Find an empty adjacent tile for unit spawning
   */
  private findEmptyAdjacentTile(x: number, y: number): {x: number; y: number} | null {
    const adjacentTiles = [
      {x: x + 1, y: y},
      {x: x - 1, y: y},
      {x: x, y: y + 1},
      {x: x, y: y - 1},
      {x: x + 1, y: y + 1},
      {x: x - 1, y: y - 1},
      {x: x + 1, y: y - 1},
      {x: x - 1, y: y + 1}
    ];

    for (const pos of adjacentTiles) {
      const tile = this.getTile(pos.x, pos.y);
      if (tile && !tile.unitId && tile.terrain !== 'ocean' && tile.terrain !== 'mountains') {
        return pos;
      }
    }

    return null;
  }

  /**
   * Get unit movement with civilization bonuses
   */
  private getUnitMovementWithBonus(unitType: UnitType, civilizationId: string): number {
    const unitData = getUnitData(unitType);
    if (!unitData) return 2;

    let movement = unitData.stats.movement;

    // Mongols: Cavalry moves +2 spaces
    if (civilizationId === 'mongols' && unitType === 'cavalry') {
      movement += 2;
    }

    return movement;
  }

  // ========== MOVEMENT & COMBAT ==========

  moveUnit(unit: Unit, targetX: number, targetY: number): boolean {
    const path = Pathfinding.findPath(
      {x: unit.x, y: unit.y},
      {x: targetX, y: targetY},
      unit,
      this.state
    );

    if (path.length === 0) {
      return false;
    }

    const startX = unit.x;
    const startY = unit.y;

    // Move along path up to movement points
    let movesUsed = 0;
    for (const step of path) {
      const tile = this.state.map[step.y][step.x];
      const moveCost = this.getMoveCost(tile, unit);

      if (movesUsed + moveCost > unit.movement) {
        break;
      }

      // Clear old position
      this.state.map[unit.y][unit.x].unitId = undefined;

      // Move to new position
      unit.x = step.x;
      unit.y = step.y;
      movesUsed += moveCost;

      // Set new position
      this.state.map[step.y][step.x].unitId = unit.id;

      // Reveal fog of war
      this.revealArea(unit.x, unit.y, 2);
    }

    unit.movement -= movesUsed;

    // Trigger animation if renderer is available
    if (this.renderer && (unit.x !== startX || unit.y !== startY)) {
      this.renderer.animateUnitMove(unit.id, startX, startY, unit.x, unit.y);
    }

    return true;
  }

  private getMoveCost(tile: Tile, unit: Unit): number {
    let cost = 1;

    switch (tile.terrain) {
      case 'hills':
      case 'forest':
      case 'jungle':
        cost = 2;
        break;
      case 'desert':
      case 'tundra':
        cost = 1.5;
        break;
    }

    if (tile.hasRiver) cost += 0.5;

    return cost;
  }

  attackUnit(attacker: Unit, defender: Unit): boolean {
    if (!CombatSystem.canAttack(attacker, defender, this.state)) {
      this.addNotification('Cannot attack this target', 'warning');
      return false;
    }

    // Trigger attack animation if renderer is available
    if (this.renderer) {
      this.renderer.animateUnitAttack(attacker.id, attacker.x, attacker.y);
      this.renderer.animateUnitAttack(defender.id, defender.x, defender.y);
    }

    const defenderTile = this.state.map[defender.y][defender.x];
    const result = CombatSystem.resolveCombat(attacker, defender, defenderTile, this.state);

    // Show damage numbers if renderer is available
    if (this.renderer) {
      // Show damage dealt to defender
      if (result.defenderDamage > 0) {
        this.renderer.showDamageNumber(defender.x, defender.y, result.defenderDamage, false);
      }
      // Show damage dealt to attacker (counter-attack)
      if (result.attackerDamage > 0) {
        this.renderer.showDamageNumber(attacker.x, attacker.y, result.attackerDamage, true);
      }
    }

    this.addNotification(result.message, 'info');

    // Remove destroyed units
    if (result.defenderDestroyed) {
      this.removeUnit(defender);
    }
    if (result.attackerDestroyed) {
      this.removeUnit(attacker);
    }

    attacker.hasActed = true;
    return true;
  }

  private removeUnit(unit: Unit) {
    const player = this.state.players.find(p => p.id === unit.ownerId)!;
    const index = player.units.findIndex(u => u.id === unit.id);
    if (index >= 0) {
      player.units.splice(index, 1);
    }

    // Clear from map
    this.state.map[unit.y][unit.x].unitId = undefined;
  }

  // ========== NOTIFICATIONS ==========

  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error') {
    this.state.notifications.push({
      message,
      type,
      timestamp: Date.now()
    });

    // Keep only last 10 notifications
    if (this.state.notifications.length > 10) {
      this.state.notifications.shift();
    }
  }
}
