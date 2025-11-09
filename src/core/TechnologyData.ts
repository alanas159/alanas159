import { Technology } from '../types';

// All available technologies organized by era
export const TECHNOLOGIES: Technology[] = [
  // ANTIQUITY ERA
  {
    id: 'agriculture',
    name: 'Agriculture',
    cost: 20,
    era: 'antiquity',
    prerequisites: [],
    unlocks: ['granary', 'farm_improvement', 'settler']
  },
  {
    id: 'mining',
    name: 'Mining',
    cost: 25,
    era: 'antiquity',
    prerequisites: [],
    unlocks: ['mine_improvement', 'workshop']
  },
  {
    id: 'writing',
    name: 'Writing',
    cost: 30,
    era: 'antiquity',
    prerequisites: [],
    unlocks: ['library', 'temple']
  },
  {
    id: 'bronze_working',
    name: 'Bronze Working',
    cost: 35,
    era: 'antiquity',
    prerequisites: ['mining'],
    unlocks: ['spearman', 'barracks']
  },
  {
    id: 'archery',
    name: 'Archery',
    cost: 30,
    era: 'antiquity',
    prerequisites: [],
    unlocks: ['archer']
  },
  {
    id: 'animal_husbandry',
    name: 'Animal Husbandry',
    cost: 25,
    era: 'antiquity',
    prerequisites: ['agriculture'],
    unlocks: ['cavalry', 'pasture_improvement']
  },
  {
    id: 'masonry',
    name: 'Masonry',
    cost: 40,
    era: 'antiquity',
    prerequisites: ['mining'],
    unlocks: ['walls', 'quarry_improvement']
  },
  {
    id: 'currency',
    name: 'Currency',
    cost: 45,
    era: 'antiquity',
    prerequisites: ['writing'],
    unlocks: ['market']
  },

  // EXPLORATION ERA
  {
    id: 'iron_working',
    name: 'Iron Working',
    cost: 60,
    era: 'exploration',
    prerequisites: ['bronze_working'],
    unlocks: ['swordsman', 'iron_mine']
  },
  {
    id: 'construction',
    name: 'Construction',
    cost: 55,
    era: 'exploration',
    prerequisites: ['masonry'],
    unlocks: ['aqueduct', 'colosseum']
  },
  {
    id: 'engineering',
    name: 'Engineering',
    cost: 70,
    era: 'exploration',
    prerequisites: ['construction', 'iron_working'],
    unlocks: ['catapult', 'road']
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    cost: 65,
    era: 'exploration',
    prerequisites: ['writing'],
    unlocks: ['university', 'national_college']
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    cost: 75,
    era: 'exploration',
    prerequisites: ['philosophy', 'currency'],
    unlocks: ['observatory', 'banking']
  },
  {
    id: 'horseback_riding',
    name: 'Horseback Riding',
    cost: 50,
    era: 'exploration',
    prerequisites: ['animal_husbandry'],
    unlocks: ['knight', 'stable']
  },
  {
    id: 'navigation',
    name: 'Navigation',
    cost: 80,
    era: 'exploration',
    prerequisites: [],
    unlocks: ['caravel', 'lighthouse']
  },
  {
    id: 'gunpowder',
    name: 'Gunpowder',
    cost: 90,
    era: 'exploration',
    prerequisites: ['chemistry'],
    unlocks: ['musketman', 'cannon']
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    cost: 85,
    era: 'exploration',
    prerequisites: ['mathematics'],
    unlocks: ['fertilizer']
  },

  // MODERN ERA
  {
    id: 'steam_power',
    name: 'Steam Power',
    cost: 120,
    era: 'modern',
    prerequisites: ['engineering'],
    unlocks: ['factory', 'railroad']
  },
  {
    id: 'rifling',
    name: 'Rifling',
    cost: 110,
    era: 'modern',
    prerequisites: ['gunpowder'],
    unlocks: ['rifleman', 'ranger']
  },
  {
    id: 'industrialization',
    name: 'Industrialization',
    cost: 140,
    era: 'modern',
    prerequisites: ['steam_power'],
    unlocks: ['coal_plant', 'workshop_upgrade']
  },
  {
    id: 'electricity',
    name: 'Electricity',
    cost: 150,
    era: 'modern',
    prerequisites: ['steam_power'],
    unlocks: ['power_plant', 'hospital']
  },
  {
    id: 'scientific_theory',
    name: 'Scientific Theory',
    cost: 145,
    era: 'modern',
    prerequisites: ['mathematics', 'chemistry'],
    unlocks: ['research_lab', 'museum']
  },
  {
    id: 'flight',
    name: 'Flight',
    cost: 160,
    era: 'modern',
    prerequisites: ['physics'],
    unlocks: ['biplane', 'airport']
  },
  {
    id: 'physics',
    name: 'Physics',
    cost: 155,
    era: 'modern',
    prerequisites: ['scientific_theory'],
    unlocks: ['electronics']
  },
  {
    id: 'radio',
    name: 'Radio',
    cost: 170,
    era: 'modern',
    prerequisites: ['electricity', 'physics'],
    unlocks: ['broadcast_tower']
  },
  {
    id: 'rocketry',
    name: 'Rocketry',
    cost: 200,
    era: 'modern',
    prerequisites: ['flight', 'radio'],
    unlocks: ['apollo_program']
  }
];

// Helper functions
export function getTechnologyById(id: string): Technology | undefined {
  return TECHNOLOGIES.find(tech => tech.id === id);
}

export function getAvailableTechnologies(researchedTechs: string[]): Technology[] {
  return TECHNOLOGIES.filter(tech => {
    // Already researched
    if (researchedTechs.includes(tech.id)) {
      return false;
    }

    // Check if all prerequisites are met
    return tech.prerequisites.every(prereq => researchedTechs.includes(prereq));
  });
}

export function getTechnologiesByEra(era: string): Technology[] {
  return TECHNOLOGIES.filter(tech => tech.era === era);
}

export function canResearch(techId: string, researchedTechs: string[]): boolean {
  const tech = getTechnologyById(techId);
  if (!tech) return false;

  // Already researched
  if (researchedTechs.includes(techId)) return false;

  // Check prerequisites
  return tech.prerequisites.every(prereq => researchedTechs.includes(prereq));
}
