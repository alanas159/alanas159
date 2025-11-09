import { Player, City } from '../types';

export interface WorldWonder {
  id: string;
  name: string;
  icon: string;
  description: string;
  era: 'antiquity' | 'medieval' | 'modern';
  cost: {
    production: number;
    turns: number; // Minimum turns to complete
  };
  requiredTech: string;
  effects: {
    global?: Partial<Record<'food' | 'production' | 'gold' | 'science' | 'culture', number>>;
    city?: Partial<Record<'food' | 'production' | 'gold' | 'science' | 'culture', number>>;
    unique?: string;
  };
  onComplete?: (player: Player, city: City) => void;
}

export const WORLD_WONDERS: WorldWonder[] = [
  // ANTIQUITY WONDERS
  {
    id: 'pyramids',
    name: '🔺 Great Pyramids',
    icon: '🔺',
    description: 'Magnificent tombs that stand the test of time',
    era: 'antiquity',
    cost: {
      production: 500,
      turns: 15
    },
    requiredTech: 'masonry',
    effects: {
      city: { production: 5, culture: 3 },
      unique: 'Workers build improvements 25% faster'
    },
    onComplete: (player, city) => {
      player.resources.culture += 100;
    }
  },
  {
    id: 'hanging_gardens',
    name: '🌺 Hanging Gardens',
    icon: '🌺',
    description: 'Terraced gardens of unparalleled beauty',
    era: 'antiquity',
    cost: {
      production: 400,
      turns: 12
    },
    requiredTech: 'agriculture',
    effects: {
      global: { food: 2 },
      city: { food: 10 },
      unique: '+15% food in all cities'
    },
    onComplete: (player) => {
      player.cities.forEach(city => {
        city.production.food = (city.production.food || 0) * 1.15;
      });
    }
  },
  {
    id: 'colossus',
    name: '🗿 Colossus of Rhodes',
    icon: '🗿',
    description: 'A massive bronze statue guarding the harbor',
    era: 'antiquity',
    cost: {
      production: 350,
      turns: 10
    },
    requiredTech: 'bronze_working',
    effects: {
      city: { gold: 8, production: 3 },
      unique: '+2 gold from all ocean tiles'
    },
    onComplete: (player) => {
      player.resources.gold += 150;
    }
  },
  {
    id: 'stonehenge',
    name: '⭕ Stonehenge',
    icon: '⭕',
    description: 'Mysterious stone circle of ancient power',
    era: 'antiquity',
    cost: {
      production: 300,
      turns: 8
    },
    requiredTech: 'mysticism',
    effects: {
      global: { culture: 2 },
      city: { culture: 5, science: 3 },
      unique: '+1 Great Prophet point per turn'
    }
  },
  {
    id: 'oracle',
    name: '🏛️ Oracle',
    icon: '🏛️',
    description: 'Sacred temple of prophecy and wisdom',
    era: 'antiquity',
    cost: {
      production: 400,
      turns: 10
    },
    requiredTech: 'philosophy',
    effects: {
      city: { science: 6, culture: 4 },
      unique: 'Free technology upon completion'
    },
    onComplete: (player) => {
      player.resources.science += 200;
    }
  },

  // MEDIEVAL WONDERS
  {
    id: 'great_library',
    name: '📚 Great Library',
    icon: '📚',
    description: 'Repository of all human knowledge',
    era: 'medieval',
    cost: {
      production: 600,
      turns: 18
    },
    requiredTech: 'writing',
    effects: {
      global: { science: 3 },
      city: { science: 12 },
      unique: '+2 Great Scientist points per turn'
    },
    onComplete: (player) => {
      player.resources.science += 300;
    }
  },
  {
    id: 'hagia_sophia',
    name: '⛪ Hagia Sophia',
    icon: '⛪',
    description: 'Magnificent cathedral of divine architecture',
    era: 'medieval',
    cost: {
      production: 550,
      turns: 16
    },
    requiredTech: 'theology',
    effects: {
      city: { culture: 8, gold: 5 },
      unique: '+1 Great Artist point per turn'
    },
    onComplete: (player, city) => {
      player.resources.culture += 250;
      city.population += 2;
    }
  },
  {
    id: 'forbidden_palace',
    name: '🏯 Forbidden Palace',
    icon: '🏯',
    description: 'Imperial palace of unmatched splendor',
    era: 'medieval',
    cost: {
      production: 700,
      turns: 20
    },
    requiredTech: 'civil_service',
    effects: {
      global: { culture: 2, gold: 2 },
      city: { culture: 10, gold: 8 },
      unique: '-15% maintenance costs'
    }
  },
  {
    id: 'chichen_itza',
    name: '🌅 Chichen Itza',
    icon: '🌅',
    description: 'Sacred Mayan astronomical observatory',
    era: 'medieval',
    cost: {
      production: 500,
      turns: 14
    },
    requiredTech: 'astronomy',
    effects: {
      city: { science: 8, culture: 6 },
      unique: '+50% gold from trade routes'
    },
    onComplete: (player) => {
      player.resources.gold += 200;
    }
  },

  // MODERN WONDERS
  {
    id: 'eiffel_tower',
    name: '🗼 Eiffel Tower',
    icon: '🗼',
    description: 'Iron lattice tower of engineering marvel',
    era: 'modern',
    cost: {
      production: 800,
      turns: 22
    },
    requiredTech: 'steel',
    effects: {
      global: { culture: 4 },
      city: { culture: 15, gold: 10 },
      unique: '+50% tourism from cultural improvements'
    },
    onComplete: (player) => {
      player.resources.culture += 400;
    }
  },
  {
    id: 'statue_of_liberty',
    name: '🗽 Statue of Liberty',
    icon: '🗽',
    description: 'Monument to freedom and democracy',
    era: 'modern',
    cost: {
      production: 750,
      turns: 20
    },
    requiredTech: 'democracy',
    effects: {
      global: { culture: 3, production: 2 },
      city: { culture: 12 },
      unique: '+1 population per turn in this city'
    },
    onComplete: (player, city) => {
      city.population += 3;
    }
  },
  {
    id: 'cristo_redentor',
    name: '✝️ Cristo Redentor',
    icon: '✝️',
    description: 'Towering statue overlooking the city',
    era: 'modern',
    cost: {
      production: 650,
      turns: 18
    },
    requiredTech: 'radio',
    effects: {
      global: { culture: 5 },
      city: { culture: 20 },
      unique: 'Culture victory threshold reduced by 10%'
    }
  },
  {
    id: 'pentagon',
    name: '🏢 Pentagon',
    icon: '🏢',
    description: 'Massive military headquarters',
    era: 'modern',
    cost: {
      production: 900,
      turns: 25
    },
    requiredTech: 'military_science',
    effects: {
      global: { production: 3 },
      city: { production: 12 },
      unique: '+2 Great General points per turn, -20% unit production cost'
    },
    onComplete: (player) => {
      // Reduce all unit costs by 20%
      player.units.forEach(unit => {
        unit.maxHealth += 10;
      });
    }
  },
  {
    id: 'sydney_opera_house',
    name: '🎪 Sydney Opera House',
    icon: '🎪',
    description: 'Architectural masterpiece of performing arts',
    era: 'modern',
    cost: {
      production: 700,
      turns: 19
    },
    requiredTech: 'modern_architecture',
    effects: {
      global: { culture: 6 },
      city: { culture: 18, gold: 8 },
      unique: '+2 Great Artist points per turn'
    },
    onComplete: (player) => {
      player.resources.culture += 500;
    }
  }
];

/**
 * World Wonders Manager
 */
export class WorldWondersManager {
  private builtWonders: Map<string, { ownerId: string; cityId: string; turnCompleted: number }> = new Map();

  /**
   * Check if wonder is available to build
   */
  isAvailable(wonderId: string): boolean {
    return !this.builtWonders.has(wonderId);
  }

  /**
   * Start building a wonder
   */
  buildWonder(wonderId: string, ownerId: string, cityId: string, turn: number): boolean {
    if (!this.isAvailable(wonderId)) {
      return false; // Already built by someone
    }

    const wonder = WORLD_WONDERS.find(w => w.id === wonderId);
    if (!wonder) return false;

    this.builtWonders.set(wonderId, { ownerId, cityId, turnCompleted: turn });
    return true;
  }

  /**
   * Get wonder by ID
   */
  getWonder(id: string): WorldWonder | undefined {
    return WORLD_WONDERS.find(w => w.id === id);
  }

  /**
   * Get all wonders for a player
   */
  getPlayerWonders(playerId: string): WorldWonder[] {
    const wonders: WorldWonder[] = [];
    this.builtWonders.forEach((data, wonderId) => {
      if (data.ownerId === playerId) {
        const wonder = this.getWonder(wonderId);
        if (wonder) wonders.push(wonder);
      }
    });
    return wonders;
  }

  /**
   * Get available wonders for era and tech
   */
  getAvailableWonders(era: string, technologies: string[]): WorldWonder[] {
    return WORLD_WONDERS.filter(w => {
      // Check if already built
      if (!this.isAvailable(w.id)) return false;

      // Check era (can build current era or earlier)
      const eras = ['antiquity', 'medieval', 'modern'];
      const currentEraIndex = eras.indexOf(era);
      const wonderEraIndex = eras.indexOf(w.era);
      if (wonderEraIndex > currentEraIndex) return false;

      // Check tech requirement
      if (!technologies.includes(w.requiredTech)) return false;

      return true;
    });
  }

  /**
   * Serialize for save/load
   */
  serialize() {
    return {
      builtWonders: Array.from(this.builtWonders.entries())
    };
  }

  /**
   * Deserialize from saved data
   */
  deserialize(data: any) {
    this.builtWonders = new Map(data.builtWonders || []);
  }
}
