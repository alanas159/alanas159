import { UnitType } from '../types';

export interface UnitData {
  type: UnitType;
  name: string;
  cost: {
    production: number;
    gold?: number;
  };
  requiredTech?: string;
  stats: {
    health: number;
    movement: number;
    attack: number;
    defense: number;
  };
  canFoundCity?: boolean;
}

export const UNITS: Record<UnitType, UnitData> = {
  settler: {
    type: 'settler',
    name: 'Settler',
    cost: { production: 50 },
    requiredTech: 'agriculture',
    stats: {
      health: 100,
      movement: 2,
      attack: 0,
      defense: 5
    },
    canFoundCity: true
  },
  warrior: {
    type: 'warrior',
    name: 'Warrior',
    cost: { production: 20 },
    requiredTech: undefined, // Available from start
    stats: {
      health: 100,
      movement: 2,
      attack: 10,
      defense: 8
    }
  },
  spearman: {
    type: 'spearman',
    name: 'Spearman',
    cost: { production: 30 },
    requiredTech: 'bronze_working',
    stats: {
      health: 100,
      movement: 2,
      attack: 12,
      defense: 14
    }
  },
  archer: {
    type: 'archer',
    name: 'Archer',
    cost: { production: 25 },
    requiredTech: 'archery',
    stats: {
      health: 100,
      movement: 2,
      attack: 8,
      defense: 5
    }
  },
  swordsman: {
    type: 'swordsman',
    name: 'Swordsman',
    cost: { production: 40, gold: 10 },
    requiredTech: 'iron_working',
    stats: {
      health: 100,
      movement: 2,
      attack: 15,
      defense: 10
    }
  },
  cavalry: {
    type: 'cavalry',
    name: 'Cavalry',
    cost: { production: 45, gold: 15 },
    requiredTech: 'animal_husbandry',
    stats: {
      health: 100,
      movement: 4,
      attack: 14,
      defense: 6
    }
  },
  siege: {
    type: 'siege',
    name: 'Siege Engine',
    cost: { production: 60, gold: 20 },
    requiredTech: 'engineering',
    stats: {
      health: 100,
      movement: 1,
      attack: 20,
      defense: 5
    }
  }
};

/**
 * Get unit data by type
 */
export function getUnitData(type: UnitType): UnitData | undefined {
  return UNITS[type];
}

/**
 * Check if player can recruit this unit type
 */
export function canRecruitUnit(
  type: UnitType,
  playerTechs: string[]
): boolean {
  const unitData = getUnitData(type);
  if (!unitData) return false;

  // Check tech requirement
  if (unitData.requiredTech && !playerTechs.includes(unitData.requiredTech)) {
    return false;
  }

  return true;
}

/**
 * Calculate unit cost with civilization bonuses
 */
export function getUnitCostWithBonuses(
  type: UnitType,
  civilizationId: string
): { production: number; gold?: number } {
  const unitData = getUnitData(type);
  if (!unitData) return { production: 20 };

  let { production, gold } = unitData.cost;

  // Apply civilization-specific bonuses
  if (civilizationId === 'zulus') {
    // Zulus: Melee units cost -25%
    const meleeUnits: UnitType[] = ['warrior', 'spearman', 'swordsman'];
    if (meleeUnits.includes(type)) {
      production = Math.floor(production * 0.75);
    }
  }

  return { production, gold };
}

/**
 * Get list of units available to recruit based on technologies
 */
export function getAvailableUnits(playerTechs: string[]): UnitType[] {
  const available: UnitType[] = [];

  for (const [typeKey, unitData] of Object.entries(UNITS)) {
    const type = typeKey as UnitType;
    if (canRecruitUnit(type, playerTechs)) {
      available.push(type);
    }
  }

  return available;
}
