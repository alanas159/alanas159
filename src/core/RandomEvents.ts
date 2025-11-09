import { Player, GameState } from '../types';

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  probability: number; // 0-1
  minTurn: number;
  effect: (player: Player, state: GameState) => void;
  canTrigger: (player: Player, state: GameState) => boolean;
}

/**
 * Random Events System
 */
export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'rainy_season',
    name: '🌧️ Rainy Season',
    description: 'Heavy rains bless your lands! +50% food production but units move slower.',
    icon: '🌧️',
    probability: 0.15,
    minTurn: 10,
    canTrigger: (player) => player.cities.length > 0,
    effect: (player, state) => {
      // Boost food for 5 turns
      player.cities.forEach(city => {
        const foodBoost = (city.production.food || 0) * 0.5;
        player.resources.food += foodBoost * 5; // 5 turns worth
      });
      // Reduce unit movement temporarily (handled in game logic)
    }
  },
  {
    id: 'drought',
    name: '☀️ Drought',
    description: 'A severe drought strikes your lands! -30% food production for 3 turns.',
    icon: '☀️',
    probability: 0.12,
    minTurn: 15,
    canTrigger: (player) => player.cities.length > 0,
    effect: (player) => {
      player.cities.forEach(city => {
        const foodLoss = (city.production.food || 0) * 0.3 * 3;
        player.resources.food = Math.max(0, player.resources.food - foodLoss);
      });
    }
  },
  {
    id: 'gold_discovery',
    name: '💎 Gold Discovery',
    description: 'Miners discovered a rich gold vein! +200 gold instantly.',
    icon: '💎',
    probability: 0.10,
    minTurn: 20,
    canTrigger: (player) => player.cities.length >= 2,
    effect: (player) => {
      player.resources.gold += 200;
    }
  },
  {
    id: 'plague',
    name: '☠️ Plague',
    description: 'A plague sweeps through your cities! -1 population in all cities.',
    icon: '☠️',
    probability: 0.08,
    minTurn: 25,
    canTrigger: (player) => player.cities.length > 0,
    effect: (player) => {
      player.cities.forEach(city => {
        city.population = Math.max(1, city.population - 1);
      });
    }
  },
  {
    id: 'barbarian_raid',
    name: '⚔️ Barbarian Raid',
    description: 'Barbarians attack your borders! Lose 50 gold and 50 production.',
    icon: '⚔️',
    probability: 0.15,
    minTurn: 10,
    canTrigger: (player) => player.resources.gold > 50,
    effect: (player) => {
      player.resources.gold = Math.max(0, player.resources.gold - 50);
      player.resources.production = Math.max(0, player.resources.production - 50);
    }
  },
  {
    id: 'golden_age',
    name: '✨ Golden Age',
    description: 'Your civilization enters a Golden Age! +25% to all yields for 10 turns.',
    icon: '✨',
    probability: 0.05,
    minTurn: 50,
    canTrigger: (player) => player.cities.length >= 3 && player.technologies.length >= 20,
    effect: (player) => {
      const boost = {
        food: 0,
        production: 0,
        gold: 0,
        science: 0,
        culture: 0
      };

      player.cities.forEach(city => {
        Object.entries(city.production).forEach(([key, value]) => {
          boost[key as keyof typeof boost] += value * 0.25 * 10; // 10 turns worth
        });
      });

      Object.entries(boost).forEach(([key, value]) => {
        player.resources[key as keyof typeof player.resources] += value;
      });
    }
  },
  {
    id: 'scientific_breakthrough',
    name: '🔬 Scientific Breakthrough',
    description: 'Your scientists make a breakthrough! +100 science instantly.',
    icon: '🔬',
    probability: 0.12,
    minTurn: 30,
    canTrigger: (player) => player.technologies.length >= 15,
    effect: (player) => {
      player.resources.science += 100;
    }
  },
  {
    id: 'cultural_festival',
    name: '🎭 Cultural Festival',
    description: 'A grand festival celebrates your culture! +150 culture.',
    icon: '🎭',
    probability: 0.10,
    minTurn: 25,
    canTrigger: (player) => player.cities.length >= 2,
    effect: (player) => {
      player.resources.culture += 150;
    }
  },
  {
    id: 'bountiful_harvest',
    name: '🌾 Bountiful Harvest',
    description: 'An exceptional harvest! +100 food and +50 gold.',
    icon: '🌾',
    probability: 0.15,
    minTurn: 15,
    canTrigger: (player) => player.cities.length > 0,
    effect: (player) => {
      player.resources.food += 100;
      player.resources.gold += 50;
    }
  },
  {
    id: 'trade_boom',
    name: '📈 Trade Boom',
    description: 'Trade routes flourish! +150 gold and +50 culture.',
    icon: '📈',
    probability: 0.12,
    minTurn: 20,
    canTrigger: (player) => player.cities.length >= 2,
    effect: (player) => {
      player.resources.gold += 150;
      player.resources.culture += 50;
    }
  },
  {
    id: 'earthquake',
    name: '🌍 Earthquake',
    description: 'An earthquake damages infrastructure! -100 production.',
    icon: '🌍',
    probability: 0.08,
    minTurn: 20,
    canTrigger: (player) => player.resources.production > 100,
    effect: (player) => {
      player.resources.production = Math.max(0, player.resources.production - 100);
    }
  },
  {
    id: 'diplomatic_gift',
    name: '🎁 Diplomatic Gift',
    description: 'Another civilization sends gifts! +75 gold and +25 science.',
    icon: '🎁',
    probability: 0.10,
    minTurn: 15,
    canTrigger: () => true,
    effect: (player) => {
      player.resources.gold += 75;
      player.resources.science += 25;
    }
  }
];

/**
 * RandomEventsManager - Handles random event triggering
 */
export class RandomEventsManager {
  private eventsHistory: Array<{ eventId: string; turn: number; playerId: string }> = [];

  /**
   * Process random events for a turn
   */
  processEvents(turn: number, players: Player[], state: GameState): void {
    players.forEach(player => {
      RANDOM_EVENTS.forEach(event => {
        // Check if event can trigger
        if (turn < event.minTurn) return;
        if (!event.canTrigger(player, state)) return;

        // Check if already triggered recently (prevent spam)
        const recentEvent = this.eventsHistory.find(
          e => e.eventId === event.id && e.playerId === player.id && turn - e.turn < 20
        );
        if (recentEvent) return;

        // Roll for probability
        if (Math.random() < event.probability) {
          event.effect(player, state);
          this.eventsHistory.push({ eventId: event.id, turn, playerId: player.id });

          // Add notification
          if (!player.isAI) {
            // Notification will be added by GameState
          }
        }
      });
    });
  }

  /**
   * Get event by ID
   */
  getEvent(id: string): RandomEvent | undefined {
    return RANDOM_EVENTS.find(e => e.id === id);
  }

  /**
   * Serialize for save/load
   */
  serialize() {
    return { eventsHistory: this.eventsHistory };
  }

  /**
   * Deserialize from saved data
   */
  deserialize(data: any) {
    this.eventsHistory = data.eventsHistory || [];
  }
}
