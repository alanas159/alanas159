import { EraType } from '../types';

export interface Technology {
  id: string;
  name: string;
  cost: number;
  era: EraType;
  branch: 'military' | 'economy' | 'infrastructure' | 'naval' | 'science_culture';
  prerequisites: string[];
  unlocks: string[]; // Units, buildings, or bonuses
  bonus?: {
    type: 'production' | 'food' | 'gold' | 'science' | 'culture' | 'movement' | 'defense' | 'attack';
    amount: number; // Percentage or absolute
    description: string;
  };
}

// ===== AGE I: ANTIQUITY =====

export const ANTIQUITY_MILITARY: Technology[] = [
  {
    id: 'archery',
    name: 'Archery',
    cost: 25,
    era: 'antiquity',
    branch: 'military',
    prerequisites: [],
    unlocks: ['archer', 'archery_range'],
    bonus: { type: 'attack', amount: 0, description: 'Unlocks ranged units' }
  },
  {
    id: 'bronze_working',
    name: 'Bronze Working',
    cost: 30,
    era: 'antiquity',
    branch: 'military',
    prerequisites: [],
    unlocks: ['spearman', 'bronze_mine'],
    bonus: { type: 'production', amount: 10, description: '+10% production from mines' }
  },
  {
    id: 'animal_husbandry',
    name: 'Animal Husbandry',
    cost: 25,
    era: 'antiquity',
    branch: 'military',
    prerequisites: [],
    unlocks: ['cavalry', 'pasture'],
    bonus: { type: 'food', amount: 1, description: '+1 food per animal resource' }
  },
  {
    id: 'iron_working',
    name: 'Iron Working',
    cost: 60,
    era: 'antiquity',
    branch: 'military',
    prerequisites: ['bronze_working'],
    unlocks: ['swordsman', 'iron_mine'],
    bonus: { type: 'production', amount: 20, description: '+20% production from iron' }
  },
  {
    id: 'military_training',
    name: 'Military Training',
    cost: 75,
    era: 'antiquity',
    branch: 'military',
    prerequisites: ['bronze_working', 'archery'],
    unlocks: ['composite_bowmen', 'barracks_upgrade'],
    bonus: { type: 'attack', amount: 15, description: '+15% unit combat strength' }
  },
  {
    id: 'horseback_riding',
    name: 'Horseback Riding',
    cost: 90,
    era: 'antiquity',
    branch: 'military',
    prerequisites: ['animal_husbandry'],
    unlocks: ['heavy_cavalry', 'stables'],
    bonus: { type: 'movement', amount: 1, description: '+1 movement for mounted units' }
  },
  {
    id: 'phalanx_formation',
    name: 'Phalanx Formation',
    cost: 110,
    era: 'antiquity',
    branch: 'military',
    prerequisites: ['iron_working', 'military_training'],
    unlocks: ['pike_units'],
    bonus: { type: 'defense', amount: 25, description: '+25% defensive bonus' }
  }
];

export const ANTIQUITY_ECONOMY: Technology[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    cost: 20,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: [],
    unlocks: ['settler', 'farm', 'granary'],
    bonus: { type: 'food', amount: 1, description: '+1 food per wheat resource' }
  },
  {
    id: 'pottery',
    name: 'Pottery',
    cost: 20,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: [],
    unlocks: ['pottery_workshop', 'storage_pits'],
    bonus: { type: 'culture', amount: 1, description: '+1 culture per city' }
  },
  {
    id: 'mining',
    name: 'Mining',
    cost: 25,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: [],
    unlocks: ['quarry', 'stone_mine', 'copper_mine'],
    bonus: { type: 'production', amount: 1, description: '+1 production from hills' }
  },
  {
    id: 'the_wheel',
    name: 'The Wheel',
    cost: 55,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: ['agriculture'],
    unlocks: ['roads', 'chariots'],
    bonus: { type: 'movement', amount: 50, description: '+50% trade route speed' }
  },
  {
    id: 'currency',
    name: 'Currency',
    cost: 80,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: ['pottery', 'the_wheel'],
    unlocks: ['market'],
    bonus: { type: 'gold', amount: 2, description: '+2 gold per turn, enables trade' }
  },
  {
    id: 'masonry',
    name: 'Masonry',
    cost: 70,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: ['mining'],
    unlocks: ['walls', 'monuments'],
    bonus: { type: 'defense', amount: 3, description: '+3 city defense' }
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    cost: 95,
    era: 'antiquity',
    branch: 'economy',
    prerequisites: ['agriculture', 'the_wheel'],
    unlocks: ['aqueducts'],
    bonus: { type: 'food', amount: 2, description: '+2 food from floodplain farms' }
  }
];

export const ANTIQUITY_INFRASTRUCTURE: Technology[] = [
  {
    id: 'writing',
    name: 'Writing',
    cost: 50,
    era: 'antiquity',
    branch: 'infrastructure',
    prerequisites: ['pottery'],
    unlocks: ['library'],
    bonus: { type: 'science', amount: 2, description: '+2 science per turn, enables diplomacy' }
  },
  {
    id: 'calendars',
    name: 'Calendars',
    cost: 65,
    era: 'antiquity',
    branch: 'infrastructure',
    prerequisites: ['agriculture'],
    unlocks: ['temple_upgrades'],
    bonus: { type: 'food', amount: 1, description: '+1 food from season prediction' }
  },
  {
    id: 'construction',
    name: 'Construction',
    cost: 100,
    era: 'antiquity',
    branch: 'infrastructure',
    prerequisites: ['masonry', 'the_wheel'],
    unlocks: ['bridges', 'siege_workshops'],
    bonus: { type: 'production', amount: 15, description: '+15% building construction speed' }
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    cost: 120,
    era: 'antiquity',
    branch: 'infrastructure',
    prerequisites: ['writing'],
    unlocks: ['academy'],
    bonus: { type: 'science', amount: 3, description: '+3 science, geometry improvements' }
  }
];

export const ANTIQUITY_NAVAL: Technology[] = [
  {
    id: 'sailing',
    name: 'Sailing',
    cost: 40,
    era: 'antiquity',
    branch: 'naval',
    prerequisites: [],
    unlocks: ['fishing_boats', 'galley', 'coastal_trade'],
    bonus: { type: 'food', amount: 1, description: '+1 food from fish resources' }
  },
  {
    id: 'celestial_navigation',
    name: 'Celestial Navigation',
    cost: 85,
    era: 'antiquity',
    branch: 'naval',
    prerequisites: ['sailing', 'writing'],
    unlocks: ['lighthouse'],
    bonus: { type: 'movement', amount: 1, description: 'Navigate open ocean, +1 naval movement' }
  },
  {
    id: 'shipbuilding',
    name: 'Shipbuilding',
    cost: 105,
    era: 'antiquity',
    branch: 'naval',
    prerequisites: ['sailing', 'construction'],
    unlocks: ['trireme', 'harbor'],
    bonus: { type: 'production', amount: 10, description: '+10% ship production' }
  }
];

export const ANTIQUITY_SCIENCE_CULTURE: Technology[] = [
  {
    id: 'mysticism',
    name: 'Mysticism',
    cost: 30,
    era: 'antiquity',
    branch: 'science_culture',
    prerequisites: [],
    unlocks: ['shrine', 'religion'],
    bonus: { type: 'culture', amount: 1, description: '+1 culture, religion foundations' }
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    cost: 110,
    era: 'antiquity',
    branch: 'science_culture',
    prerequisites: ['writing', 'mysticism'],
    unlocks: ['great_philosophers'],
    bonus: { type: 'culture', amount: 2, description: '+2 culture, morale boost' }
  },
  {
    id: 'drama',
    name: 'Drama',
    cost: 125,
    era: 'antiquity',
    branch: 'science_culture',
    prerequisites: ['philosophy'],
    unlocks: ['theater'],
    bonus: { type: 'culture', amount: 15, description: '+15% border expansion rate' }
  }
];

// ===== AGE II: MEDIEVAL =====

export const MEDIEVAL_MILITARY: Technology[] = [
  {
    id: 'steel_making',
    name: 'Steel Making',
    cost: 180,
    era: 'medieval',
    branch: 'military',
    prerequisites: ['iron_working', 'masonry'],
    unlocks: ['longswordsmen'],
    bonus: { type: 'production', amount: 30, description: '+30% weapon production' }
  },
  {
    id: 'feudalism',
    name: 'Feudalism',
    cost: 200,
    era: 'medieval',
    branch: 'military',
    prerequisites: ['phalanx_formation'],
    unlocks: ['knights', 'castle'],
    bonus: { type: 'defense', amount: 20, description: 'Loyalty system, +20% defensive buildings' }
  },
  {
    id: 'chivalry',
    name: 'Chivalry',
    cost: 240,
    era: 'medieval',
    branch: 'military',
    prerequisites: ['feudalism', 'horseback_riding'],
    unlocks: ['mounted_knights'],
    bonus: { type: 'movement', amount: 1, description: '+1 knight movement, faster healing' }
  },
  {
    id: 'gunpowder',
    name: 'Gunpowder',
    cost: 320,
    era: 'medieval',
    branch: 'military',
    prerequisites: ['steel_making', 'chemistry'],
    unlocks: ['musketmen', 'bombard'],
    bonus: { type: 'attack', amount: 50, description: '+50% ranged attack, walls obsolete' }
  },
  {
    id: 'military_engineering',
    name: 'Military Engineering',
    cost: 360,
    era: 'medieval',
    branch: 'military',
    prerequisites: ['gunpowder', 'construction'],
    unlocks: ['fortresses', 'trenches'],
    bonus: { type: 'defense', amount: 4, description: '+4 city defense from fortifications' }
  },
  {
    id: 'rifling',
    name: 'Rifling',
    cost: 420,
    era: 'medieval',
    branch: 'military',
    prerequisites: ['gunpowder', 'metal_casting'],
    unlocks: ['riflemen'],
    bonus: { type: 'attack', amount: 50, description: '+50% ranged attack accuracy' }
  }
];

export const MEDIEVAL_ECONOMY: Technology[] = [
  {
    id: 'guilds',
    name: 'Guilds',
    cost: 190,
    era: 'medieval',
    branch: 'economy',
    prerequisites: ['currency', 'construction'],
    unlocks: ['merchant_guilds'],
    bonus: { type: 'gold', amount: 3, description: '+3 gold per city' }
  },
  {
    id: 'metal_casting',
    name: 'Metal Casting',
    cost: 220,
    era: 'medieval',
    branch: 'economy',
    prerequisites: ['steel_making'],
    unlocks: ['workshop'],
    bonus: { type: 'production', amount: 2, description: '+2 production, cannon foundries' }
  },
  {
    id: 'banking',
    name: 'Banking',
    cost: 280,
    era: 'medieval',
    branch: 'economy',
    prerequisites: ['guilds', 'mathematics'],
    unlocks: ['banks', 'stock_exchange'],
    bonus: { type: 'gold', amount: 20, description: '+20% interest income' }
  },
  {
    id: 'economics',
    name: 'Economics',
    cost: 380,
    era: 'medieval',
    branch: 'economy',
    prerequisites: ['banking', 'printing_press'],
    unlocks: ['trade_companies'],
    bonus: { type: 'gold', amount: 4, description: '+4 gold per trade route' }
  },
  {
    id: 'crop_rotation',
    name: 'Crop Rotation',
    cost: 210,
    era: 'medieval',
    branch: 'economy',
    prerequisites: ['irrigation', 'calendars'],
    unlocks: ['windmills'],
    bonus: { type: 'food', amount: 1, description: '+1 food from farms, +20% population growth' }
  }
];

export const MEDIEVAL_INFRASTRUCTURE: Technology[] = [
  {
    id: 'education',
    name: 'Education',
    cost: 250,
    era: 'medieval',
    branch: 'infrastructure',
    prerequisites: ['mathematics', 'philosophy'],
    unlocks: ['university'],
    bonus: { type: 'science', amount: 5, description: '+5 science, great scientists' }
  },
  {
    id: 'civil_service',
    name: 'Civil Service',
    cost: 290,
    era: 'medieval',
    branch: 'infrastructure',
    prerequisites: ['education', 'guilds'],
    unlocks: ['bureaucracy'],
    bonus: { type: 'production', amount: 15, description: 'Corruption reduction, +15% build speed' }
  },
  {
    id: 'printing_press',
    name: 'Printing Press',
    cost: 340,
    era: 'medieval',
    branch: 'infrastructure',
    prerequisites: ['education'],
    unlocks: ['library_upgrades'],
    bonus: { type: 'science', amount: 3, description: '+3 science, faster tech spread' }
  },
  {
    id: 'acoustics',
    name: 'Acoustics',
    cost: 310,
    era: 'medieval',
    branch: 'infrastructure',
    prerequisites: ['drama', 'education'],
    unlocks: ['opera_house'],
    bonus: { type: 'culture', amount: 4, description: '+4 culture, culture bomb ability' }
  }
];

export const MEDIEVAL_NAVAL: Technology[] = [
  {
    id: 'cartography',
    name: 'Cartography',
    cost: 230,
    era: 'medieval',
    branch: 'naval',
    prerequisites: ['celestial_navigation', 'mathematics'],
    unlocks: ['caravel'],
    bonus: { type: 'movement', amount: 20, description: 'Map trading, reveal coastlines' }
  },
  {
    id: 'naval_warfare',
    name: 'Naval Warfare',
    cost: 300,
    era: 'medieval',
    branch: 'naval',
    prerequisites: ['cartography', 'steel_making'],
    unlocks: ['frigate'],
    bonus: { type: 'attack', amount: 30, description: 'Naval bombardment capability' }
  },
  {
    id: 'astronomy',
    name: 'Astronomy',
    cost: 350,
    era: 'medieval',
    branch: 'naval',
    prerequisites: ['cartography', 'education'],
    unlocks: ['observatory'],
    bonus: { type: 'science', amount: 4, description: '+4 science on hills, ocean crossing' }
  }
];

export const MEDIEVAL_SCIENCE_CULTURE: Technology[] = [
  {
    id: 'theology',
    name: 'Theology',
    cost: 260,
    era: 'medieval',
    branch: 'science_culture',
    prerequisites: ['philosophy', 'mysticism'],
    unlocks: ['cathedral'],
    bonus: { type: 'culture', amount: 3, description: 'State religion, +3 culture/happiness' }
  },
  {
    id: 'humanism',
    name: 'Humanism',
    cost: 330,
    era: 'medieval',
    branch: 'science_culture',
    prerequisites: ['theology', 'education'],
    unlocks: ['renaissance_fair'],
    bonus: { type: 'culture', amount: 2, description: 'Golden age trigger, +2 all yields' }
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    cost: 370,
    era: 'medieval',
    branch: 'science_culture',
    prerequisites: ['acoustics', 'metal_casting'],
    unlocks: ['alchemy_lab'],
    bonus: { type: 'science', amount: 3, description: '+3 science, explosives foundation' }
  }
];

// ===== AGE III: MODERN =====

export const MODERN_MILITARY: Technology[] = [
  {
    id: 'military_science',
    name: 'Military Science',
    cost: 520,
    era: 'modern',
    branch: 'military',
    prerequisites: ['rifling', 'military_engineering'],
    unlocks: ['artillery', 'line_infantry'],
    bonus: { type: 'attack', amount: 40, description: '+40% artillery effectiveness' }
  },
  {
    id: 'advanced_ballistics',
    name: 'Advanced Ballistics',
    cost: 600,
    era: 'modern',
    branch: 'military',
    prerequisites: ['military_science'],
    unlocks: ['advanced_artillery'],
    bonus: { type: 'attack', amount: 30, description: '+30% ranged accuracy' }
  },
  {
    id: 'combustion',
    name: 'Combustion',
    cost: 640,
    era: 'modern',
    branch: 'military',
    prerequisites: ['industrialization', 'rifling'],
    unlocks: ['tanks', 'armored_divisions'],
    bonus: { type: 'movement', amount: 2, description: 'Oil required, +2 mechanized movement' }
  },
  {
    id: 'flight',
    name: 'Flight',
    cost: 700,
    era: 'modern',
    branch: 'military',
    prerequisites: ['combustion', 'advanced_ballistics'],
    unlocks: ['biplanes'],
    bonus: { type: 'movement', amount: 2, description: '+2 vision range, reconnaissance' }
  },
  {
    id: 'radar',
    name: 'Radar',
    cost: 850,
    era: 'modern',
    branch: 'infrastructure',
    prerequisites: ['radio', 'flight'],
    unlocks: ['radar_stations', 'air_defense'],
    bonus: { type: 'defense', amount: 30, description: '+30% air defense, detect aircraft' }
  },
  {
    id: 'advanced_flight',
    name: 'Advanced Flight',
    cost: 880,
    era: 'modern',
    branch: 'military',
    prerequisites: ['flight', 'radar'],
    unlocks: ['fighter_jets', 'bombers'],
    bonus: { type: 'attack', amount: 100, description: 'Strategic bombing, +100% air attack' }
  },
  {
    id: 'rocketry',
    name: 'Rocketry',
    cost: 1000,
    era: 'modern',
    branch: 'military',
    prerequisites: ['advanced_flight'],
    unlocks: ['missiles'],
    bonus: { type: 'attack', amount: 150, description: 'Intercontinental range' }
  },
  {
    id: 'nuclear_fission',
    name: 'Nuclear Fission',
    cost: 1100,
    era: 'modern',
    branch: 'military',
    prerequisites: ['atomic_theory', 'rocketry'],
    unlocks: ['nuclear_weapons', 'atomic_bomb', 'power_plants'],
    bonus: { type: 'attack', amount: 500, description: 'Ultimate weapon, +500% devastation' }
  },
  {
    id: 'stealth_technology',
    name: 'Stealth Technology',
    cost: 1250,
    era: 'modern',
    branch: 'military',
    prerequisites: ['advanced_flight', 'computers'],
    unlocks: ['stealth_bombers', 'submarines_undetectable'],
    bonus: { type: 'defense', amount: 100, description: '+100% evasion, undetectable' }
  }
];

export const MODERN_ECONOMY: Technology[] = [
  {
    id: 'industrialization',
    name: 'Industrialization',
    cost: 550,
    era: 'modern',
    branch: 'economy',
    prerequisites: ['metal_casting', 'steam_power'],
    unlocks: ['factories'],
    bonus: { type: 'production', amount: 5, description: '+5 production, coal resource' }
  },
  {
    id: 'steam_power',
    name: 'Steam Power',
    cost: 480,
    era: 'modern',
    branch: 'economy',
    prerequisites: ['economics', 'chemistry'],
    unlocks: ['railroads', 'steamships'],
    bonus: { type: 'movement', amount: 2, description: '+2 movement on roads' }
  },
  {
    id: 'electricity',
    name: 'Electricity',
    cost: 720,
    era: 'modern',
    branch: 'economy',
    prerequisites: ['industrialization', 'physics'],
    unlocks: ['power_plants'],
    bonus: { type: 'production', amount: 4, description: '+4 production per city' }
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration',
    cost: 780,
    era: 'modern',
    branch: 'economy',
    prerequisites: ['electricity', 'crop_rotation'],
    unlocks: ['supermarkets'],
    bonus: { type: 'food', amount: 2, description: '+2 food from farms, preservation' }
  },
  {
    id: 'plastics',
    name: 'Plastics',
    cost: 850,
    era: 'modern',
    branch: 'economy',
    prerequisites: ['electricity', 'synthetic_materials'],
    unlocks: ['oil_refineries'],
    bonus: { type: 'production', amount: 3, description: '+3 production from oil' }
  },
  {
    id: 'globalization',
    name: 'Globalization',
    cost: 1200,
    era: 'modern',
    branch: 'economy',
    prerequisites: ['computers', 'satellites'],
    unlocks: ['global_trade_network'],
    bonus: { type: 'gold', amount: 10, description: '+10 gold per trade route' }
  }
];

export const MODERN_INFRASTRUCTURE: Technology[] = [
  {
    id: 'replaceable_parts',
    name: 'Replaceable Parts',
    cost: 650,
    era: 'modern',
    branch: 'infrastructure',
    prerequisites: ['industrialization'],
    unlocks: ['mass_production'],
    bonus: { type: 'production', amount: 30, description: '+30% build speed' }
  },
  {
    id: 'radio',
    name: 'Radio',
    cost: 760,
    era: 'modern',
    branch: 'infrastructure',
    prerequisites: ['electricity', 'printing_press'],
    unlocks: ['broadcast_tower'],
    bonus: { type: 'culture', amount: 4, description: '+4 culture, propaganda' }
  },
  {
    id: 'computers',
    name: 'Computers',
    cost: 950,
    era: 'modern',
    branch: 'infrastructure',
    prerequisites: ['radio', 'atomic_theory'],
    unlocks: ['research_labs'],
    bonus: { type: 'science', amount: 6, description: '+6 science, digital era' }
  },
  {
    id: 'robotics',
    name: 'Robotics',
    cost: 1150,
    era: 'modern',
    branch: 'infrastructure',
    prerequisites: ['computers', 'plastics'],
    unlocks: ['automated_workers', 'drones'],
    bonus: { type: 'production', amount: 3, description: '+3 production, automation' }
  },
  {
    id: 'nanotechnology',
    name: 'Nanotechnology',
    cost: 1400,
    era: 'modern',
    branch: 'infrastructure',
    prerequisites: ['robotics', 'nuclear_fusion'],
    unlocks: ['advanced_materials'],
    bonus: { type: 'production', amount: 5, description: '+5 production, future tech' }
  }
];

export const MODERN_NAVAL: Technology[] = [
  {
    id: 'advanced_navigation',
    name: 'Advanced Navigation',
    cost: 600,
    era: 'modern',
    branch: 'naval',
    prerequisites: ['astronomy', 'steam_power'],
    unlocks: ['ironclad'],
    bonus: { type: 'movement', amount: 1, description: '+1 ocean movement' }
  },
  {
    id: 'combined_arms',
    name: 'Combined Arms',
    cost: 820,
    era: 'modern',
    branch: 'naval',
    prerequisites: ['advanced_navigation', 'combustion'],
    unlocks: ['destroyers', 'carriers'],
    bonus: { type: 'attack', amount: 40, description: 'Naval supremacy, +40% fleet attack' }
  },
  {
    id: 'submarines',
    name: 'Submarines',
    cost: 920,
    era: 'modern',
    branch: 'naval',
    prerequisites: ['combined_arms', 'electricity'],
    unlocks: ['submarine_units'],
    bonus: { type: 'defense', amount: 50, description: 'Underwater warfare, +50% evasion' }
  },
  {
    id: 'nuclear_propulsion',
    name: 'Nuclear Propulsion',
    cost: 1180,
    era: 'modern',
    branch: 'naval',
    prerequisites: ['submarines', 'nuclear_fission'],
    unlocks: ['nuclear_submarines', 'nuclear_carriers'],
    bonus: { type: 'movement', amount: 3, description: 'Unlimited range, +3 movement' }
  }
];

export const MODERN_SCIENCE_CULTURE: Technology[] = [
  {
    id: 'physics',
    name: 'Physics',
    cost: 620,
    era: 'modern',
    branch: 'science_culture',
    prerequisites: ['chemistry', 'humanism'],
    unlocks: ['scientific_method'],
    bonus: { type: 'science', amount: 4, description: '+4 science, great scientists' }
  },
  {
    id: 'atomic_theory',
    name: 'Atomic Theory',
    cost: 800,
    era: 'modern',
    branch: 'science_culture',
    prerequisites: ['physics', 'electricity'],
    unlocks: ['research_institute'],
    bonus: { type: 'science', amount: 6, description: '+6 science, unlock nukes' }
  },
  {
    id: 'synthetic_materials',
    name: 'Synthetic Materials',
    cost: 890,
    era: 'modern',
    branch: 'science_culture',
    prerequisites: ['atomic_theory', 'industrialization'],
    unlocks: ['labs_upgrade'],
    bonus: { type: 'science', amount: 5, description: '+5 science, polymer production' }
  },
  {
    id: 'satellites',
    name: 'Satellites',
    cost: 1050,
    era: 'modern',
    branch: 'science_culture',
    prerequisites: ['rocketry', 'computers'],
    unlocks: ['satellite_uplink'],
    bonus: { type: 'science', amount: 10, description: 'Reveal entire map, GPS, +10 science' }
  },
  {
    id: 'nuclear_fusion',
    name: 'Nuclear Fusion',
    cost: 1300,
    era: 'modern',
    branch: 'science_culture',
    prerequisites: ['nuclear_fission', 'nanotechnology'],
    unlocks: ['fusion_reactor'],
    bonus: { type: 'science', amount: 10, description: '+10 science, clean energy' }
  },
  {
    id: 'space_colonization',
    name: 'Space Colonization',
    cost: 1500,
    era: 'modern',
    branch: 'science_culture',
    prerequisites: ['nuclear_fusion', 'satellites'],
    unlocks: ['space_victory', 'exodus_ship'],
    bonus: { type: 'science', amount: 20, description: 'Space victory condition' }
  }
];

// Combine all technologies
export const TECHNOLOGIES: Technology[] = [
  ...ANTIQUITY_MILITARY,
  ...ANTIQUITY_ECONOMY,
  ...ANTIQUITY_INFRASTRUCTURE,
  ...ANTIQUITY_NAVAL,
  ...ANTIQUITY_SCIENCE_CULTURE,
  ...MEDIEVAL_MILITARY,
  ...MEDIEVAL_ECONOMY,
  ...MEDIEVAL_INFRASTRUCTURE,
  ...MEDIEVAL_NAVAL,
  ...MEDIEVAL_SCIENCE_CULTURE,
  ...MODERN_MILITARY,
  ...MODERN_ECONOMY,
  ...MODERN_INFRASTRUCTURE,
  ...MODERN_NAVAL,
  ...MODERN_SCIENCE_CULTURE
];

// Helper functions
export function getTechnologyById(id: string): Technology | undefined {
  return TECHNOLOGIES.find(tech => tech.id === id);
}

export function canResearch(techId: string, researchedTechs: string[]): boolean {
  const tech = getTechnologyById(techId);
  if (!tech) return false;

  // Already researched?
  if (researchedTechs.includes(techId)) return false;

  // All prerequisites met?
  return tech.prerequisites.every(prereq => researchedTechs.includes(prereq));
}

export function getTechnologiesByEra(era: EraType): Technology[] {
  return TECHNOLOGIES.filter(tech => tech.era === era);
}

export function getTechnologiesByBranch(branch: Technology['branch']): Technology[] {
  return TECHNOLOGIES.filter(tech => tech.branch === branch);
}
