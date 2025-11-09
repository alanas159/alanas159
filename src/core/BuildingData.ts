import { Building, BuildingType } from '../types';

// All available buildings
export const BUILDINGS: Record<BuildingType, Building> = {
  barracks: {
    type: 'barracks',
    name: 'Barracks',
    cost: { production: 40 },
    effects: { production: 1 }
  },
  granary: {
    type: 'granary',
    name: 'Granary',
    cost: { production: 30 },
    effects: { food: 2 }
  },
  library: {
    type: 'library',
    name: 'Library',
    cost: { production: 35 },
    effects: { science: 2 }
  },
  market: {
    type: 'market',
    name: 'Market',
    cost: { production: 40, gold: 10 },
    effects: { gold: 3 }
  },
  walls: {
    type: 'walls',
    name: 'Walls',
    cost: { production: 50 },
    effects: { production: 1 }
  },
  temple: {
    type: 'temple',
    name: 'Temple',
    cost: { production: 40 },
    effects: { culture: 2 }
  },
  workshop: {
    type: 'workshop',
    name: 'Workshop',
    cost: { production: 45 },
    effects: { production: 3 }
  },
  university: {
    type: 'university',
    name: 'University',
    cost: { production: 80, gold: 20 },
    effects: { science: 4 }
  }
};

export function getBuildingByType(type: BuildingType): Building {
  return BUILDINGS[type];
}

export function canBuildBuilding(type: BuildingType, cityBuildings: BuildingType[], playerTechs: string[]): boolean {
  // Can't build if already exists
  if (cityBuildings.includes(type)) {
    return false;
  }

  // Check tech requirements
  const techRequirements: Record<BuildingType, string> = {
    barracks: 'bronze_working',
    granary: 'agriculture',
    library: 'writing',
    market: 'currency',
    walls: 'masonry',
    temple: 'writing',
    workshop: 'mining',
    university: 'philosophy'
  };

  const requiredTech = techRequirements[type];
  if (requiredTech && !playerTechs.includes(requiredTech)) {
    return false;
  }

  return true;
}

export function getBuildableBuildings(cityBuildings: BuildingType[], playerTechs: string[]): BuildingType[] {
  return Object.keys(BUILDINGS).filter(type =>
    canBuildBuilding(type as BuildingType, cityBuildings, playerTechs)
  ) as BuildingType[];
}
