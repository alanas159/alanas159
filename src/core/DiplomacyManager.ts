import { Player, GameState } from '../types';
import { CIVILIZATIONS } from '../civilizations/CivilizationData';

export type DiplomaticRelation = 'war' | 'neutral' | 'friendly' | 'allied';
export type TradeType = 'one_time' | 'ongoing';

export interface DiplomaticState {
  playerId1: string;
  playerId2: string;
  relation: DiplomaticRelation;
  trustLevel: number; // -100 to 100
  wardeclaredTurn?: number;
  allianceFormedTurn?: number;
}

export interface TradeAgreement {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  type: TradeType;
  offering: {
    gold?: number;
    goldPerTurn?: number;
    resources?: { food?: number; production?: number; science?: number; culture?: number };
  };
  requesting: {
    gold?: number;
    goldPerTurn?: number;
    resources?: { food?: number; production?: number; science?: number; culture?: number };
  };
  turnsRemaining?: number; // For ongoing trades
  createdTurn: number;
}

/**
 * DiplomacyManager - Handles all diplomatic relations
 */
export class DiplomacyManager {
  private diplomaticStates: Map<string, DiplomaticState> = new Map();
  private tradeAgreements: TradeAgreement[] = [];

  /**
   * Initialize diplomacy for all players
   */
  initializeDiplomacy(players: Player[]) {
    // Create diplomatic relations for all player pairs
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const key = this.getRelationKey(players[i].id, players[j].id);
        this.diplomaticStates.set(key, {
          playerId1: players[i].id,
          playerId2: players[j].id,
          relation: 'neutral',
          trustLevel: 0
        });
      }
    }
  }

  /**
   * Get diplomatic relation between two players
   */
  getRelation(playerId1: string, playerId2: string): DiplomaticState | null {
    const key = this.getRelationKey(playerId1, playerId2);
    return this.diplomaticStates.get(key) || null;
  }

  /**
   * Declare war
   */
  declareWar(declarerId: string, targetId: string): boolean {
    const relation = this.getRelation(declarerId, targetId);
    if (!relation) return false;

    if (relation.relation === 'allied') {
      // Can't declare war on ally, must break alliance first
      return false;
    }

    relation.relation = 'war';
    relation.trustLevel = -100;
    relation.wardeclaredTurn = Date.now();

    return true;
  }

  /**
   * Propose peace
   */
  makePeace(playerId1: string, playerId2: string): boolean {
    const relation = this.getRelation(playerId1, playerId2);
    if (!relation) return false;

    relation.relation = 'neutral';
    relation.trustLevel = Math.max(-50, relation.trustLevel);
    relation.wardeclaredTurn = undefined;

    return true;
  }

  /**
   * Form alliance
   */
  formAlliance(playerId1: string, playerId2: string, turn: number): boolean {
    const relation = this.getRelation(playerId1, playerId2);
    if (!relation) return false;

    if (relation.relation === 'war') {
      // Must make peace first
      return false;
    }

    relation.relation = 'allied';
    relation.trustLevel = Math.max(50, relation.trustLevel);
    relation.allianceFormedTurn = turn;

    return true;
  }

  /**
   * Break alliance
   */
  breakAlliance(playerId1: string, playerId2: string): boolean {
    const relation = this.getRelation(playerId1, playerId2);
    if (!relation) return false;

    if (relation.relation !== 'allied') return false;

    relation.relation = 'neutral';
    relation.trustLevel = Math.max(0, relation.trustLevel - 30);
    relation.allianceFormedTurn = undefined;

    return true;
  }

  /**
   * Create trade agreement
   */
  createTrade(agreement: Omit<TradeAgreement, 'id'>): string {
    const id = `trade-${Date.now()}-${Math.random()}`;
    const trade: TradeAgreement = { ...agreement, id };
    this.tradeAgreements.push(trade);
    return id;
  }

  /**
   * Process trade agreements each turn
   */
  processTrades(turn: number, players: Player[]) {
    const expiredTrades: string[] = [];

    this.tradeAgreements.forEach(trade => {
      if (trade.type === 'ongoing' && trade.turnsRemaining !== undefined) {
        // Process ongoing trade
        const fromPlayer = players.find(p => p.id === trade.fromPlayerId);
        const toPlayer = players.find(p => p.id === trade.toPlayerId);

        if (fromPlayer && toPlayer) {
          // Transfer gold per turn
          if (trade.offering.goldPerTurn) {
            fromPlayer.resources.gold -= trade.offering.goldPerTurn;
            toPlayer.resources.gold += trade.offering.goldPerTurn;
          }
          if (trade.requesting.goldPerTurn) {
            toPlayer.resources.gold -= trade.requesting.goldPerTurn;
            fromPlayer.resources.gold += trade.requesting.goldPerTurn;
          }

          // Transfer resources per turn
          if (trade.offering.resources) {
            Object.entries(trade.offering.resources).forEach(([res, amount]) => {
              if (amount) {
                fromPlayer.resources[res as keyof typeof fromPlayer.resources] -= amount;
                toPlayer.resources[res as keyof typeof toPlayer.resources] += amount;
              }
            });
          }
          if (trade.requesting.resources) {
            Object.entries(trade.requesting.resources).forEach(([res, amount]) => {
              if (amount) {
                toPlayer.resources[res as keyof typeof toPlayer.resources] -= amount;
                fromPlayer.resources[res as keyof typeof fromPlayer.resources] += amount;
              }
            });
          }
        }

        // Decrement turns remaining
        trade.turnsRemaining!--;
        if (trade.turnsRemaining! <= 0) {
          expiredTrades.push(trade.id);
        }
      }
    });

    // Remove expired trades
    this.tradeAgreements = this.tradeAgreements.filter(t => !expiredTrades.includes(t.id));
  }

  /**
   * Cancel trade
   */
  cancelTrade(tradeId: string): boolean {
    const index = this.tradeAgreements.findIndex(t => t.id === tradeId);
    if (index === -1) return false;

    this.tradeAgreements.splice(index, 1);
    return true;
  }

  /**
   * Get all trades for a player
   */
  getPlayerTrades(playerId: string): TradeAgreement[] {
    return this.tradeAgreements.filter(
      t => t.fromPlayerId === playerId || t.toPlayerId === playerId
    );
  }

  /**
   * Get all diplomatic relations for a player
   */
  getPlayerRelations(playerId: string): DiplomaticState[] {
    const relations: DiplomaticState[] = [];
    this.diplomaticStates.forEach(state => {
      if (state.playerId1 === playerId || state.playerId2 === playerId) {
        relations.push(state);
      }
    });
    return relations;
  }

  /**
   * Get relation key for two players
   */
  private getRelationKey(playerId1: string, playerId2: string): string {
    // Always use consistent ordering
    return playerId1 < playerId2
      ? `${playerId1}-${playerId2}`
      : `${playerId2}-${playerId1}`;
  }

  /**
   * Check if two players are at war
   */
  isAtWar(playerId1: string, playerId2: string): boolean {
    const relation = this.getRelation(playerId1, playerId2);
    return relation?.relation === 'war';
  }

  /**
   * Check if two players are allied
   */
  isAllied(playerId1: string, playerId2: string): boolean {
    const relation = this.getRelation(playerId1, playerId2);
    return relation?.relation === 'allied';
  }

  /**
   * Get all data for serialization
   */
  serialize() {
    return {
      diplomaticStates: Array.from(this.diplomaticStates.entries()),
      tradeAgreements: this.tradeAgreements
    };
  }

  /**
   * Restore from serialized data
   */
  deserialize(data: any) {
    this.diplomaticStates = new Map(data.diplomaticStates);
    this.tradeAgreements = data.tradeAgreements;
  }
}
