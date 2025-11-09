import { Player, City } from '../types';

export type GreatPersonType = 'scientist' | 'engineer' | 'artist' | 'general' | 'merchant' | 'prophet';

export interface GreatPerson {
  id: string;
  name: string;
  type: GreatPersonType;
  icon: string;
  era: 'antiquity' | 'medieval' | 'modern';
  ability: {
    name: string;
    description: string;
    use: (player: Player, city?: City) => void;
  };
}

export const GREAT_PEOPLE: GreatPerson[] = [
  // SCIENTISTS
  {
    id: 'archimedes',
    name: '🔬 Archimedes',
    type: 'scientist',
    icon: '🔬',
    era: 'antiquity',
    ability: {
      name: 'Eureka!',
      description: 'Instantly gain 200 science points',
      use: (player) => {
        player.resources.science += 200;
      }
    }
  },
  {
    id: 'galileo',
    name: '🔭 Galileo Galilei',
    type: 'scientist',
    icon: '🔭',
    era: 'medieval',
    ability: {
      name: 'Scientific Revolution',
      description: 'Boost science production by 50% in one city permanently',
      use: (player, city) => {
        if (city) {
          city.production.science = (city.production.science || 0) * 1.5;
        }
      }
    }
  },
  {
    id: 'einstein',
    name: '⚛️ Albert Einstein',
    type: 'scientist',
    icon: '⚛️',
    era: 'modern',
    ability: {
      name: 'Theory of Relativity',
      description: 'Instantly complete current research',
      use: (player) => {
        if (player.currentResearch) {
          player.technologies.push(player.currentResearch.techId);
          player.currentResearch = undefined;
        }
      }
    }
  },

  // ENGINEERS
  {
    id: 'imhotep',
    name: '🏗️ Imhotep',
    type: 'engineer',
    icon: '🏗️',
    era: 'antiquity',
    ability: {
      name: 'Master Builder',
      description: 'Gain 300 production points instantly',
      use: (player) => {
        player.resources.production += 300;
      }
    }
  },
  {
    id: 'leonardo',
    name: '🎨 Leonardo da Vinci',
    type: 'engineer',
    icon: '🎨',
    era: 'medieval',
    ability: {
      name: 'Renaissance Man',
      description: '+100 production, +100 science, +100 culture',
      use: (player) => {
        player.resources.production += 100;
        player.resources.science += 100;
        player.resources.culture += 100;
      }
    }
  },
  {
    id: 'tesla',
    name: '⚡ Nikola Tesla',
    type: 'engineer',
    icon: '⚡',
    era: 'modern',
    ability: {
      name: 'Electric Innovation',
      description: 'Double production in one city permanently',
      use: (player, city) => {
        if (city) {
          city.production.production = (city.production.production || 0) * 2;
        }
      }
    }
  },

  // ARTISTS
  {
    id: 'homer',
    name: '📜 Homer',
    type: 'artist',
    icon: '📜',
    era: 'antiquity',
    ability: {
      name: 'Epic Poetry',
      description: 'Gain 250 culture points instantly',
      use: (player) => {
        player.resources.culture += 250;
      }
    }
  },
  {
    id: 'shakespeare',
    name: '🎭 William Shakespeare',
    type: 'artist',
    icon: '🎭',
    era: 'medieval',
    ability: {
      name: 'Dramatic Masterpiece',
      description: '+50% culture production in one city permanently',
      use: (player, city) => {
        if (city) {
          city.production.culture = (city.production.culture || 0) * 1.5;
        }
      }
    }
  },
  {
    id: 'mozart',
    name: '🎵 Wolfgang Mozart',
    type: 'artist',
    icon: '🎵',
    era: 'modern',
    ability: {
      name: 'Symphony of Ages',
      description: '+500 culture instantly',
      use: (player) => {
        player.resources.culture += 500;
      }
    }
  },

  // GENERALS
  {
    id: 'alexander',
    name: '⚔️ Alexander the Great',
    type: 'general',
    icon: '⚔️',
    era: 'antiquity',
    ability: {
      name: 'Military Genius',
      description: 'All military units get +2 attack permanently',
      use: (player) => {
        player.units.forEach(unit => {
          if (unit.type !== 'settler') {
            unit.attack += 2;
          }
        });
      }
    }
  },
  {
    id: 'napoleon',
    name: '👑 Napoleon Bonaparte',
    type: 'general',
    icon: '👑',
    era: 'medieval',
    ability: {
      name: 'Grand Army',
      description: 'Recruit 3 free military units instantly',
      use: (player, city) => {
        // Would create 3 warriors at capital
        player.resources.production += 60; // Equivalent to 3 warriors
      }
    }
  },
  {
    id: 'sunzi',
    name: '📖 Sun Tzu',
    type: 'general',
    icon: '📖',
    era: 'antiquity',
    ability: {
      name: 'Art of War',
      description: '+3 defense to all units permanently',
      use: (player) => {
        player.units.forEach(unit => {
          unit.defense += 3;
        });
      }
    }
  },

  // MERCHANTS
  {
    id: 'marco_polo',
    name: '🧭 Marco Polo',
    type: 'merchant',
    icon: '🧭',
    era: 'medieval',
    ability: {
      name: 'Silk Road',
      description: 'Gain 400 gold instantly',
      use: (player) => {
        player.resources.gold += 400;
      }
    }
  },
  {
    id: 'medici',
    name: '💰 Cosimo de\' Medici',
    type: 'merchant',
    icon: '💰',
    era: 'medieval',
    ability: {
      name: 'Banking Empire',
      description: '+5 gold per turn in all cities permanently',
      use: (player) => {
        player.cities.forEach(city => {
          city.production.gold = (city.production.gold || 0) + 5;
        });
      }
    }
  },

  // PROPHETS
  {
    id: 'confucius',
    name: '☯️ Confucius',
    type: 'prophet',
    icon: '☯️',
    era: 'antiquity',
    ability: {
      name: 'Philosophy of Harmony',
      description: '+200 culture and +100 science',
      use: (player) => {
        player.resources.culture += 200;
        player.resources.science += 100;
      }
    }
  }
];

/**
 * Great People Generation System
 */
export class GreatPeopleManager {
  private earnedPeople: Map<string, string[]> = new Map(); // playerId -> great person IDs
  private pointsProgress: Map<string, Map<GreatPersonType, number>> = new Map(); // playerId -> type -> points

  /**
   * Add points towards a great person
   */
  addPoints(playerId: string, type: GreatPersonType, points: number) {
    if (!this.pointsProgress.has(playerId)) {
      this.pointsProgress.set(playerId, new Map());
    }

    const playerPoints = this.pointsProgress.get(playerId)!;
    const current = playerPoints.get(type) || 0;
    playerPoints.set(type, current + points);

    // Check if threshold reached (100 points = 1 great person)
    if (playerPoints.get(type)! >= 100) {
      this.generateGreatPerson(playerId, type);
      playerPoints.set(type, 0);
    }
  }

  /**
   * Generate a great person
   */
  private generateGreatPerson(playerId: string, type: GreatPersonType): GreatPerson | null {
    const availablePeople = GREAT_PEOPLE.filter(p => p.type === type);
    const earned = this.earnedPeople.get(playerId) || [];

    // Filter out already earned people
    const unearned = availablePeople.filter(p => !earned.includes(p.id));

    if (unearned.length === 0) return null;

    // Pick random person of this type
    const person = unearned[Math.floor(Math.random() * unearned.length)];

    // Add to earned
    if (!this.earnedPeople.has(playerId)) {
      this.earnedPeople.set(playerId, []);
    }
    this.earnedPeople.get(playerId)!.push(person.id);

    return person;
  }

  /**
   * Use a great person's ability
   */
  useGreatPerson(personId: string, player: Player, city?: City) {
    const person = GREAT_PEOPLE.find(p => p.id === personId);
    if (!person) return;

    person.ability.use(player, city);
  }

  /**
   * Get great people for a player
   */
  getPlayerGreatPeople(playerId: string): GreatPerson[] {
    const earned = this.earnedPeople.get(playerId) || [];
    return earned.map(id => GREAT_PEOPLE.find(p => p.id === id)!).filter(p => p);
  }

  /**
   * Get points progress for a player
   */
  getProgress(playerId: string): Map<GreatPersonType, number> {
    return this.pointsProgress.get(playerId) || new Map();
  }

  /**
   * Serialize for save/load
   */
  serialize() {
    return {
      earnedPeople: Array.from(this.earnedPeople.entries()),
      pointsProgress: Array.from(this.pointsProgress.entries()).map(([playerId, points]) => [
        playerId,
        Array.from(points.entries())
      ])
    };
  }

  /**
   * Deserialize from saved data
   */
  deserialize(data: any) {
    this.earnedPeople = new Map(data.earnedPeople || []);
    this.pointsProgress = new Map(
      (data.pointsProgress || []).map(([playerId, points]: [string, any]) => [
        playerId,
        new Map(points)
      ])
    );
  }
}
