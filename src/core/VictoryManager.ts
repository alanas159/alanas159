import { GameState, Player } from '../types';

/**
 * VictoryManager - Handles victory condition checking
 */
export class VictoryManager {
  /**
   * Check all victory conditions
   */
  static checkVictory(state: GameState): { winner: string; type: string } | null {
    // Check domination victory
    const dominationWinner = this.checkDominationVictory(state);
    if (dominationWinner) return { winner: dominationWinner, type: 'domination' };

    // Check science victory
    const scienceWinner = this.checkScienceVictory(state);
    if (scienceWinner) return { winner: scienceWinner, type: 'science' };

    // Check culture victory
    const cultureWinner = this.checkCultureVictory(state);
    if (cultureWinner) return { winner: cultureWinner, type: 'culture' };

    // Check time victory (turn 500)
    if (state.turn >= 500) {
      const timeWinner = this.checkTimeVictory(state);
      if (timeWinner) return { winner: timeWinner, type: 'time' };
    }

    return null;
  }

  /**
   * Domination Victory: Control 75% of all cities
   */
  private static checkDominationVictory(state: GameState): string | null {
    const totalCities = state.players.reduce((sum, p) => sum + p.cities.length, 0);
    const threshold = Math.ceil(totalCities * 0.75);

    for (const player of state.players) {
      if (player.cities.length >= threshold && totalCities > 0) {
        return player.id;
      }
    }

    return null;
  }

  /**
   * Science Victory: Research all modern era technologies
   */
  private static checkScienceVictory(state: GameState): string | null {
    // Count modern era tech requirements (simplified: 60+ technologies)
    const scienceThreshold = 60;

    for (const player of state.players) {
      if (player.technologies.length >= scienceThreshold) {
        return player.id;
      }
    }

    return null;
  }

  /**
   * Culture Victory: Accumulate 50,000 culture
   */
  private static checkCultureVictory(state: GameState): string | null {
    const cultureThreshold = 50000;

    for (const player of state.players) {
      if (player.resources.culture >= cultureThreshold) {
        return player.id;
      }
    }

    return null;
  }

  /**
   * Time Victory: Highest score at turn 500
   */
  private static checkTimeVictory(state: GameState): string | null {
    let highestScore = -1;
    let winner: string | null = null;

    for (const player of state.players) {
      const score = this.calculatePlayerScore(player, state);

      if (score > highestScore) {
        highestScore = score;
        winner = player.id;
      }
    }

    return winner;
  }

  /**
   * Calculate player's score
   */
  static calculatePlayerScore(player: Player, state: GameState): number {
    let score = 0;

    // Cities: 50 points each
    score += player.cities.length * 50;

    // Population: 10 points per pop
    const totalPop = player.cities.reduce((sum, city) => sum + city.population, 0);
    score += totalPop * 10;

    // Territory: 2 points per tile
    score += player.territories.length * 2;

    // Technologies: 30 points each
    score += player.technologies.length * 30;

    // Military units: 15 points each
    score += player.units.length * 15;

    // Resources (scaled down)
    score += Math.floor(player.resources.gold / 100);
    score += Math.floor(player.resources.culture / 50);
    score += Math.floor(player.resources.science / 50);

    // Wonders: 100 points each
    const wondersOwned = state.builtWonders?.filter(w => w.ownerId === player.id).length || 0;
    score += wondersOwned * 100;

    // Great People: 75 points each
    const greatPeopleOwned = player.greatPeople?.length || 0;
    score += greatPeopleOwned * 75;

    return score;
  }

  /**
   * Get victory progress for player
   */
  static getVictoryProgress(player: Player, state: GameState): Record<string, number> {
    const totalCities = state.players.reduce((sum, p) => sum + p.cities.length, 0);
    const citiesThreshold = Math.ceil(totalCities * 0.75);

    return {
      domination: totalCities > 0 ? Math.min(100, (player.cities.length / citiesThreshold) * 100) : 0,
      science: Math.min(100, (player.technologies.length / 60) * 100),
      culture: Math.min(100, (player.resources.culture / 50000) * 100),
      time: (state.turn / 500) * 100
    };
  }
}
