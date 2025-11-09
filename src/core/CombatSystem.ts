import { Unit, Tile, GameState } from '../types';

export interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  message: string;
}

export class CombatSystem {
  // Calculate combat outcome
  static resolveCombat(
    attacker: Unit,
    defender: Unit,
    defenderTile: Tile,
    state: GameState
  ): CombatResult {
    // Get terrain modifiers
    const defenseBonus = this.getTerrainDefenseBonus(defenderTile);
    const attackBonus = this.getTerrainAttackBonus(state.map[attacker.y][attacker.x]);

    // Calculate effective stats
    const attackerStrength = attacker.attack * (1 + attackBonus) * (attacker.health / 100);
    const defenderStrength = defender.defense * (1 + defenseBonus) * (defender.health / 100);

    // Calculate damage
    const attackerDamage = Math.max(5, Math.floor(
      (attackerStrength / (attackerStrength + defenderStrength)) * 50
    ));

    const defenderDamage = Math.max(5, Math.floor(
      (defenderStrength / (attackerStrength + defenderStrength)) * 30
    ));

    // Apply damage
    defender.health -= attackerDamage;
    attacker.health -= defenderDamage;

    const attackerDestroyed = attacker.health <= 0;
    const defenderDestroyed = defender.health <= 0;

    // Generate combat message
    let message = `${attacker.type} attacks ${defender.type}! `;
    message += `Attacker deals ${attackerDamage} damage, `;
    message += `Defender deals ${defenderDamage} damage.`;

    if (defenderDestroyed) {
      message += ` ${defender.type} destroyed!`;
    }
    if (attackerDestroyed) {
      message += ` ${attacker.type} destroyed!`;
    }

    return {
      attackerDamage: defenderDamage,
      defenderDamage: attackerDamage,
      attackerDestroyed,
      defenderDestroyed,
      message
    };
  }

  private static getTerrainDefenseBonus(tile: Tile): number {
    let bonus = 0;

    switch (tile.terrain) {
      case 'hills':
        bonus += 0.25; // +25% defense
        break;
      case 'mountains':
        bonus += 0.50; // +50% defense
        break;
      case 'forest':
      case 'jungle':
        bonus += 0.15; // +15% defense
        break;
    }

    // River provides defense bonus
    if (tile.hasRiver) {
      bonus += 0.10;
    }

    return bonus;
  }

  private static getTerrainAttackBonus(tile: Tile): number {
    let bonus = 0;

    switch (tile.terrain) {
      case 'plains':
        bonus += 0.10; // +10% attack for open terrain
        break;
    }

    return bonus;
  }

  // Check if attacker can attack defender
  static canAttack(attacker: Unit, defender: Unit, state: GameState): boolean {
    // Can't attack own units
    if (attacker.ownerId === defender.ownerId) {
      return false;
    }

    // Must be in range (adjacent for melee, or within range for ranged)
    const distance = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);

    if (attacker.type === 'archer' || attacker.type === 'siege') {
      return distance <= 2 && distance >= 1; // Ranged units attack from distance
    } else {
      return distance === 1; // Melee units must be adjacent
    }
  }

  // Get all enemy units in attack range
  static getEnemiesInRange(unit: Unit, state: GameState): Unit[] {
    const enemies: Unit[] = [];
    const range = (unit.type === 'archer' || unit.type === 'siege') ? 2 : 1;

    for (const player of state.players) {
      if (player.id === unit.ownerId) continue;

      for (const enemy of player.units) {
        const distance = Math.abs(unit.x - enemy.x) + Math.abs(unit.y - enemy.y);

        if (unit.type === 'archer' || unit.type === 'siege') {
          if (distance <= range && distance >= 1) {
            enemies.push(enemy);
          }
        } else {
          if (distance === 1) {
            enemies.push(enemy);
          }
        }
      }
    }

    return enemies;
  }
}
