import { Player, City, Unit, GameState as GameStateType, UnitType } from '../types';
import { GameStateManager } from './GameState';
import { TECHNOLOGIES, getTechnologyById } from './TechnologyData';
import { getUnitData } from './UnitData';

/**
 * AIManager - Handles AI decision-making for computer players
 */
export class AIManager {
  private gameState: GameStateManager;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  /**
   * Process AI turn - make all decisions for an AI player
   */
  processTurn(player: Player) {
    if (!player.isAI) return;

    // Priority order for AI actions:
    // 1. Expand (found cities if have settlers)
    // 2. Research (choose next technology)
    // 3. Build units (recruit appropriate units)
    // 4. Move units (explore, attack, defend)

    this.handleSettlers(player);
    this.handleResearch(player);
    this.handleUnitRecruitment(player);
    this.handleUnitMovement(player);
  }

  /**
   * Handle settler actions - found cities in good locations
   */
  private handleSettlers(player: Player) {
    const settlers = player.units.filter(u => u.type === 'settler');

    settlers.forEach(settler => {
      if (settler.movement <= 0) return;

      // Try to found city at current location
      const canFound = this.isGoodCityLocation(settler.x, settler.y, player);

      if (canFound) {
        this.gameState.foundCityWithSettler(settler);
      } else {
        // Move towards a better location
        this.moveUnitTowardsBestCityLocation(settler, player);
      }
    });
  }

  /**
   * Check if location is good for a city
   */
  private isGoodCityLocation(x: number, y: number, player: Player): boolean {
    const state = this.gameState.getState();
    const tile = state.map[y]?.[x];

    if (!tile) return false;

    // Don't found on ocean
    if (tile.terrain === 'ocean') return false;

    // Check if too close to other cities (minimum 5 tiles)
    const allCities = state.players.flatMap(p => p.cities);
    const tooClose = allCities.some(city => {
      const distance = Math.abs(city.x - x) + Math.abs(city.y - y);
      return distance < 5;
    });

    if (tooClose) return false;

    // Good location if has resources
    const hasGoodResources =
      (tile.resources.food || 0) >= 2 ||
      (tile.resources.production || 0) >= 2 ||
      tile.strategicResource ||
      tile.hasRiver;

    return hasGoodResources;
  }

  /**
   * Move settler towards best city location
   */
  private moveUnitTowardsBestCityLocation(settler: Unit, player: Player) {
    const state = this.gameState.getState();
    let bestScore = -1;
    let bestTile: { x: number; y: number } | null = null;

    // Search in 10 tile radius
    for (let dy = -10; dy <= 10; dy++) {
      for (let dx = -10; dx <= 10; dx++) {
        const nx = settler.x + dx;
        const ny = settler.y + dy;

        if (ny < 0 || ny >= state.config.mapHeight || nx < 0 || nx >= state.config.mapWidth) continue;

        const tile = state.map[ny][nx];
        if (!tile || tile.terrain === 'ocean') continue;

        if (this.isGoodCityLocation(nx, ny, player)) {
          const score = (tile.resources.food || 0) + (tile.resources.production || 0) * 2 +
                       (tile.hasRiver ? 3 : 0) + (tile.strategicResource ? 5 : 0);

          if (score > bestScore) {
            bestScore = score;
            bestTile = { x: nx, y: ny };
          }
        }
      }
    }

    // Move towards best tile if found
    if (bestTile) {
      this.moveUnitTowards(settler, bestTile.x, bestTile.y);
    }
  }

  /**
   * Handle AI research decisions
   */
  private handleResearch(player: Player) {
    if (player.currentResearch) return;

    // Get available technologies
    const availableTechs = TECHNOLOGIES.filter(tech => {
      if (player.technologies.includes(tech.id)) return false;

      // Check prerequisites
      return tech.prerequisites.every(prereq => player.technologies.includes(prereq));
    });

    if (availableTechs.length === 0) return;

    // AI research strategy: prioritize by era and branch
    // Prefer: economy > military > infrastructure > science_culture > naval
    const branchPriority: Record<string, number> = {
      economy: 5,
      military: 4,
      infrastructure: 3,
      science_culture: 2,
      naval: 1
    };

    // Score each technology
    const scoredTechs = availableTechs.map(tech => {
      let score = branchPriority[tech.branch] || 0;

      // Prefer cheaper techs early
      score += (1000 - tech.cost) / 100;

      // Prefer technologies that unlock more
      score += tech.unlocks.length * 2;

      return { tech, score };
    });

    // Sort by score and pick best
    scoredTechs.sort((a, b) => b.score - a.score);

    if (scoredTechs.length > 0) {
      this.gameState.startResearch(player, scoredTechs[0].tech.id);
    }
  }

  /**
   * Handle unit recruitment
   */
  private handleUnitRecruitment(player: Player) {
    // AI recruitment strategy: maintain 2-3 units per city
    const targetUnitsPerCity = 2.5;
    const currentRatio = player.units.length / Math.max(1, player.cities.length);

    if (currentRatio >= targetUnitsPerCity) return;

    // Recruit from largest cities
    const cities = [...player.cities].sort((a, b) => b.population - a.population);

    for (const city of cities) {
      if (player.resources.production < 20) break;

      // Decide which unit to recruit
      const unitType = this.chooseUnitToRecruit(player);

      if (unitType) {
        const success = this.gameState.recruitUnit(city, unitType);
        if (success) {
          // Only recruit one unit per turn
          break;
        }
      }
    }
  }

  /**
   * Choose which unit type to recruit
   */
  private chooseUnitToRecruit(player: Player): UnitType | null {
    // Priority: settler (if < 3 cities) > warrior > archer > cavalry

    if (player.cities.length < 3 && player.technologies.includes('agriculture')) {
      if (player.resources.production >= 50) {
        return 'settler';
      }
    }

    // Check available unit types
    if (player.technologies.includes('horseback_riding') && player.resources.production >= 40) {
      return 'cavalry';
    }

    if (player.technologies.includes('archery') && player.resources.production >= 25) {
      return 'archer';
    }

    if (player.resources.production >= 20) {
      return 'warrior';
    }

    return null;
  }

  /**
   * Handle unit movement and combat
   */
  private handleUnitMovement(player: Player) {
    const militaryUnits = player.units.filter(u => u.type !== 'settler');

    militaryUnits.forEach(unit => {
      if (unit.movement <= 0 || unit.hasActed) return;

      // AI unit behavior:
      // 1. If near enemy, attack
      // 2. If defending city, stay near city
      // 3. Else explore/expand territory

      const nearbyEnemy = this.findNearbyEnemy(unit, player);

      if (nearbyEnemy) {
        this.moveUnitTowards(unit, nearbyEnemy.x, nearbyEnemy.y);
      } else {
        // Explore - move towards unexplored territory
        this.exploreWithUnit(unit, player);
      }
    });
  }

  /**
   * Find nearby enemy unit or city
   */
  private findNearbyEnemy(unit: Unit, player: Player): { x: number; y: number } | null {
    const state = this.gameState.getState();
    const searchRadius = 5;

    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const nx = unit.x + dx;
        const ny = unit.y + dy;

        if (ny < 0 || ny >= state.config.mapHeight || nx < 0 || nx >= state.config.mapWidth) continue;

        const tile = state.map[ny][nx];

        // Check for enemy unit
        if (tile.unitId) {
          const otherUnit = state.players
            .flatMap(p => p.units)
            .find(u => u.id === tile.unitId);

          if (otherUnit && otherUnit.ownerId !== player.id) {
            return { x: nx, y: ny };
          }
        }

        // Check for enemy city
        if (tile.cityId) {
          const city = state.players
            .flatMap(p => p.cities)
            .find(c => c.id === tile.cityId);

          if (city && city.ownerId !== player.id) {
            return { x: nx, y: ny };
          }
        }
      }
    }

    return null;
  }

  /**
   * Move unit towards exploration
   */
  private exploreWithUnit(unit: Unit, player: Player) {
    const state = this.gameState.getState();

    // Move towards nearest unexplored territory or neutral land
    let bestTile: { x: number; y: number } | null = null;
    let bestScore = -1;

    for (let dy = -8; dy <= 8; dy++) {
      for (let dx = -8; dx <= 8; dx++) {
        const nx = unit.x + dx;
        const ny = unit.y + dy;

        if (ny < 0 || ny >= state.config.mapHeight || nx < 0 || nx >= state.config.mapWidth) continue;

        const tile = state.map[ny][nx];

        // Skip ocean for land units
        if (tile.terrain === 'ocean' && unit.type !== 'galley') continue;

        // Prefer unexplored or neutral tiles
        const score = (!tile.explored ? 10 : 0) +
                     (!tile.ownerId ? 5 : 0) +
                     (tile.strategicResource ? 3 : 0);

        if (score > bestScore) {
          bestScore = score;
          bestTile = { x: nx, y: ny };
        }
      }
    }

    if (bestTile) {
      this.moveUnitTowards(unit, bestTile.x, bestTile.y);
    }
  }

  /**
   * Move unit towards target coordinates
   */
  private moveUnitTowards(unit: Unit, targetX: number, targetY: number) {
    const dx = targetX - unit.x;
    const dy = targetY - unit.y;

    // Simple movement: move one step towards target
    let moveX = unit.x;
    let moveY = unit.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveX += dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
      moveY += dy > 0 ? 1 : -1;
    }

    // Validate move
    const state = this.gameState.getState();
    if (moveY >= 0 && moveY < state.config.mapHeight &&
        moveX >= 0 && moveX < state.config.mapWidth) {

      const targetTile = state.map[moveY][moveX];

      // Don't move onto tiles with units or cities (unless attacking)
      if (!targetTile.unitId && !targetTile.cityId) {
        this.gameState.moveUnit(unit, moveX, moveY);
      }
    }
  }
}
