import { CivilizationData } from '../types';

// All 8 civilizations with unique bonuses, capital names, and starting technologies
export const CIVILIZATIONS: CivilizationData[] = [
  {
    id: 'celts',
    name: 'Celts',
    description: 'Masters of forest warfare with strong defensive bonuses. Excel in guerrilla tactics and druidic culture.',
    color: '#2d8659',
    capitalName: 'Tara',
    bonuses: [
      { type: 'production', amount: 2, terrain: 'forest' },
      { type: 'culture', amount: 1, terrain: 'forest' },
      { type: 'production', amount: 1 } // Bonus to defensive structures
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    startingTechnologies: ['archery', 'animal_husbandry', 'mysticism'],
    uniqueAbility: 'Forest Defenders: +2 Production from forests, units gain +20% defense in forest tiles, +25% research on Mysticism/Theology branches'
  },
  {
    id: 'romans',
    name: 'Romans',
    description: 'Engineering masters with superior legions. Build roads faster and expand rapidly through conquest.',
    color: '#8b0000',
    capitalName: 'Roma',
    bonuses: [
      { type: 'production', amount: 3 }, // Engineering bonus
      { type: 'gold', amount: 2 }, // From roads and trade
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    startingTechnologies: ['mining', 'masonry', 'bronze_working'],
    uniqueAbility: 'All Roads Lead to Rome: Cities produce +3 Production, Masonry and Construction cost 50% less, military units move faster on roads'
  },
  {
    id: 'egyptians',
    name: 'Egyptians',
    description: 'River valley civilization with pyramid wonders. Massive food production and early scientific advances.',
    color: '#daa520',
    capitalName: 'Thebes',
    bonuses: [
      { type: 'food', amount: 3, terrain: 'grassland' },
      { type: 'science', amount: 2 },
      { type: 'culture', amount: 1 }
    ],
    startingUnits: ['settler', 'warrior', 'archer'],
    startingTechnologies: ['agriculture', 'writing', 'calendars'],
    uniqueAbility: 'Gift of the Nile: +3 Food from grasslands, +2 Science from monuments and wonders, Agriculture and Irrigation prerequisites satisfied'
  },
  {
    id: 'baltic',
    name: 'Baltic Tribes',
    description: 'Hardy northern warriors adapted to harsh climates. Excel in amber trade and fortified settlements.',
    color: '#4a90a4',
    capitalName: 'Vilnius',
    bonuses: [
      { type: 'gold', amount: 3 }, // Amber trade
      { type: 'production', amount: 2, terrain: 'hills' },
      { type: 'food', amount: 1 } // Resistance to cold
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    startingTechnologies: ['sailing', 'animal_husbandry', 'mining'],
    uniqueAbility: 'Northern Resilience: +2 Production from hills, units ignore movement penalties in tundra/snow, free Sailing on coastal cities'
  },
  {
    id: 'mongols',
    name: 'Mongols',
    description: 'Nomadic horse lords dominating the steppes. Unmatched cavalry speed and mobile warfare tactics.',
    color: '#8b4513',
    capitalName: 'Karakorum',
    bonuses: [
      { type: 'production', amount: 2, terrain: 'plains' },
      { type: 'gold', amount: 2 }, // From conquest
    ],
    startingUnits: ['settler', 'cavalry', 'cavalry'],
    startingTechnologies: ['animal_husbandry', 'archery', 'horseback_riding'],
    uniqueAbility: 'Horde Tactics: Cavalry units move +2 spaces, gain +25% attack on plains terrain, start with advanced cavalry tech'
  },
  {
    id: 'mali',
    name: 'Mali Empire',
    description: 'West African gold traders with vast wealth. Dominate trade routes and use espionage effectively.',
    color: '#ffd700',
    capitalName: 'Timbuktu',
    bonuses: [
      { type: 'gold', amount: 5 }, // Massive gold income
      { type: 'culture', amount: 2 },
      { type: 'food', amount: 1, terrain: 'desert' }
    ],
    startingUnits: ['settler', 'warrior', 'archer'],
    startingTechnologies: ['currency', 'pottery', 'the_wheel'],
    uniqueAbility: 'Trans-Saharan Trade: +5 Gold per turn, trade caravans provide vision and intelligence, +50% gold from trade routes'
  },
  {
    id: 'aztecs',
    name: 'Aztecs',
    description: 'Mesoamerican jungle warriors with fearsome sacrificial rituals. Superior jungle combat and morale.',
    color: '#b22222',
    capitalName: 'Tenochtitlan',
    bonuses: [
      { type: 'production', amount: 2, terrain: 'jungle' },
      { type: 'food', amount: 2, terrain: 'jungle' },
      { type: 'culture', amount: 1 }
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    startingTechnologies: ['agriculture', 'pottery', 'mysticism'],
    uniqueAbility: 'Warrior Priests: +2 Food and Production from jungles, defeating enemies grants culture, units heal faster'
  },
  {
    id: 'zulus',
    name: 'Zulus',
    description: 'Elite warriors of southern Africa. Lightning-fast melee assaults and superior cattle economy.',
    color: '#8b4789',
    capitalName: 'Ulundi',
    bonuses: [
      { type: 'food', amount: 3 }, // Cattle herding
      { type: 'production', amount: 2 },
    ],
    startingUnits: ['settler', 'warrior', 'warrior', 'warrior'],
    startingTechnologies: ['bronze_working', 'animal_husbandry', 'military_training'],
    uniqueAbility: 'Impi Warriors: +3 Food from cattle, melee units cost -25% production and gain +15% attack, faster unit production'
  }
];

export function getCivilizationById(id: string): CivilizationData | undefined {
  return CIVILIZATIONS.find(civ => civ.id === id);
}
