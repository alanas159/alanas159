import { GameState, Player, Resources, GameConfig, City, Unit, Tile, BuildingType, UnitType } from '../types';
import { MapGenerator } from '../map/MapGenerator';
import { CIVILIZATIONS } from '../civilizations/CivilizationData';
import { Pathfinding } from './Pathfinding';
import { CombatSystem } from './CombatSystem';
import { getTechnologyById, canResearch } from './TechnologyData';
import { getBuildingByType, canBuildBuilding } from './BuildingData';

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
      selectedUnit: null,
      selectedCity: null,
      notifications: []
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
      isAI,
      technologies: [],
      currentResearch: undefined
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
      isCapital,
      buildings: [],
      currentProduction: undefined
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

      // Process city production
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
    });

    // Process technology research
    if (player.currentResearch) {
      const sciencePerTurn = player.resources.science || 1;
      player.currentResearch.progress += sciencePerTurn;

      const tech = getTechnologyById(player.currentResearch.techId);
      if (tech && player.currentResearch.progress >= tech.cost) {
        // Research complete!
        player.technologies.push(tech.id);
        this.addNotification(`Researched ${tech.name}!`, 'success');
        player.currentResearch = undefined;
      }
    }

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

  // ========== TECHNOLOGY SYSTEM ==========

  startResearch(player: Player, techId: string): boolean {
    if (!canResearch(techId, player.technologies)) {
      this.addNotification('Cannot research this technology yet', 'warning');
      return false;
    }

    const tech = getTechnologyById(techId);
    if (!tech) return false;

    player.currentResearch = {
      techId,
      progress: 0
    };

    this.addNotification(`Researching ${tech.name}`, 'info');
    return true;
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

  recruitUnit(city: City, unitType: UnitType): boolean {
    const player = this.state.players.find(p => p.id === city.ownerId)!;
    const costs = this.getUnitCost(unitType);

    // Check if can afford
    if (player.resources.production < costs.production || player.resources.gold < (costs.gold || 0)) {
      this.addNotification('Not enough resources to recruit unit', 'warning');
      return false;
    }

    // Find empty adjacent tile
    const adjacentTiles = [
      {x: city.x + 1, y: city.y},
      {x: city.x - 1, y: city.y},
      {x: city.x, y: city.y + 1},
      {x: city.x, y: city.y - 1}
    ];

    let spawnTile = null;
    for (const pos of adjacentTiles) {
      const tile = this.getTile(pos.x, pos.y);
      if (tile && !tile.unitId && tile.terrain !== 'ocean' && tile.terrain !== 'mountains') {
        spawnTile = pos;
        break;
      }
    }

    if (!spawnTile) {
      this.addNotification('No space to recruit unit', 'warning');
      return false;
    }

    // Deduct costs
    player.resources.production -= costs.production;
    if (costs.gold) player.resources.gold -= costs.gold;

    // Create unit
    const unit: Unit = {
      id: `unit-${Date.now()}`,
      type: unitType,
      ownerId: player.id,
      x: spawnTile.x,
      y: spawnTile.y,
      health: 100,
      maxHealth: 100,
      movement: this.getUnitMovement(unitType),
      maxMovement: this.getUnitMovement(unitType),
      attack: this.getUnitAttack(unitType),
      defense: this.getUnitDefense(unitType),
      hasActed: false
    };

    player.units.push(unit);
    this.state.map[spawnTile.y][spawnTile.x].unitId = unit.id;

    this.addNotification(`${city.name} recruited ${unitType}`, 'success');
    return true;
  }

  private getUnitCost(unitType: UnitType): {production: number; gold?: number} {
    const costs: Record<UnitType, {production: number; gold?: number}> = {
      settler: {production: 50},
      warrior: {production: 20},
      spearman: {production: 30},
      archer: {production: 25},
      swordsman: {production: 40, gold: 10},
      cavalry: {production: 45, gold: 15},
      siege: {production: 60, gold: 20}
    };
    return costs[unitType] || {production: 20};
  }

  private getUnitMovement(unitType: UnitType): number {
    const movements: Record<UnitType, number> = {
      settler: 2,
      warrior: 2,
      spearman: 2,
      archer: 2,
      swordsman: 2,
      cavalry: 4,
      siege: 1
    };
    return movements[unitType] || 2;
  }

  private getUnitAttack(unitType: UnitType): number {
    const attacks: Record<UnitType, number> = {
      settler: 0,
      warrior: 10,
      spearman: 12,
      archer: 8,
      swordsman: 15,
      cavalry: 14,
      siege: 20
    };
    return attacks[unitType] || 10;
  }

  private getUnitDefense(unitType: UnitType): number {
    const defenses: Record<UnitType, number> = {
      settler: 5,
      warrior: 8,
      spearman: 14,
      archer: 5,
      swordsman: 10,
      cavalry: 6,
      siege: 5
    };
    return defenses[unitType] || 8;
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

    const defenderTile = this.state.map[defender.y][defender.x];
    const result = CombatSystem.resolveCombat(attacker, defender, defenderTile, this.state);

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
