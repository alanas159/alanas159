import { CivilizationData } from '../types';

// All 8 civilizations with unique bonuses and abilities
export const CIVILIZATIONS: CivilizationData[] = [
  {
    id: 'celts',
    name: 'Celts',
    description: 'Masters of forest warfare with strong defensive bonuses. Excel in guerrilla tactics and druidic culture.',
    color: '#2d8659',
    bonuses: [
      { type: 'production', amount: 2, terrain: 'forest' },
      { type: 'culture', amount: 1, terrain: 'forest' },
      { type: 'production', amount: 1 } // Bonus to defensive structures
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    uniqueAbility: 'Forest Defenders: +2 Production from forests, units gain +20% defense in forest tiles'
  },
  {
    id: 'romans',
    name: 'Romans',
    description: 'Engineering masters with superior legions. Build roads faster and expand rapidly through conquest.',
    color: '#8b0000',
    bonuses: [
      { type: 'production', amount: 3 }, // Engineering bonus
      { type: 'gold', amount: 2 }, // From roads and trade
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    uniqueAbility: 'All Roads Lead to Rome: Cities produce +3 Production, military units move faster on roads'
  },
  {
    id: 'egyptians',
    name: 'Egyptians',
    description: 'River valley civilization with pyramid wonders. Massive food production and early scientific advances.',
    color: '#daa520',
    bonuses: [
      { type: 'food', amount: 3, terrain: 'grassland' },
      { type: 'science', amount: 2 },
      { type: 'culture', amount: 1 }
    ],
    startingUnits: ['settler', 'warrior', 'archer'],
    uniqueAbility: 'Gift of the Nile: +3 Food from grasslands, +2 Science from monuments and wonders'
  },
  {
    id: 'baltic',
    name: 'Baltic Tribes',
    description: 'Hardy northern warriors adapted to harsh climates. Excel in amber trade and fortified settlements.',
    color: '#4a90a4',
    bonuses: [
      { type: 'gold', amount: 3 }, // Amber trade
      { type: 'production', amount: 2, terrain: 'hills' },
      { type: 'food', amount: 1 } // Resistance to cold
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    uniqueAbility: 'Northern Resilience: +2 Production from hills, units ignore movement penalties in tundra/snow'
  },
  {
    id: 'mongols',
    name: 'Mongols',
    description: 'Nomadic horse lords dominating the steppes. Unmatched cavalry speed and mobile warfare tactics.',
    color: '#8b4513',
    bonuses: [
      { type: 'production', amount: 2, terrain: 'plains' },
      { type: 'gold', amount: 2 }, // From conquest
    ],
    startingUnits: ['settler', 'cavalry', 'cavalry'],
    uniqueAbility: 'Horde Tactics: Cavalry units move +2 spaces, gain +25% attack on plains terrain'
  },
  {
    id: 'mali',
    name: 'Mali Empire',
    description: 'West African gold traders with vast wealth. Dominate trade routes and use espionage effectively.',
    color: '#ffd700',
    bonuses: [
      { type: 'gold', amount: 5 }, // Massive gold income
      { type: 'culture', amount: 2 },
      { type: 'food', amount: 1, terrain: 'desert' }
    ],
    startingUnits: ['settler', 'warrior', 'archer'],
    uniqueAbility: 'Trans-Saharan Trade: +5 Gold per turn, trade caravans provide vision and intelligence'
  },
  {
    id: 'aztecs',
    name: 'Aztecs',
    description: 'Mesoamerican jungle warriors with fearsome sacrificial rituals. Superior jungle combat and morale.',
    color: '#b22222',
    bonuses: [
      { type: 'production', amount: 2, terrain: 'jungle' },
      { type: 'food', amount: 2, terrain: 'jungle' },
      { type: 'culture', amount: 1 }
    ],
    startingUnits: ['settler', 'warrior', 'warrior'],
    uniqueAbility: 'Warrior Priests: +2 Food and Production from jungles, defeating enemies grants culture'
  },
  {
    id: 'zulus',
    name: 'Zulus',
    description: 'Elite warriors of southern Africa. Lightning-fast melee assaults and superior cattle economy.',
    color: '#8b4789',
    bonuses: [
      { type: 'food', amount: 3 }, // Cattle herding
      { type: 'production', amount: 2 },
    ],
    startingUnits: ['settler', 'warrior', 'warrior', 'warrior'],
    uniqueAbility: 'Impi Warriors: +3 Food from cattle, melee units cost -25% production and gain +15% attack'
  }
];

export function getCivilizationById(id: string): CivilizationData | undefined {
  return CIVILIZATIONS.find(civ => civ.id === id);
}
