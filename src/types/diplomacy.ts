/**
 * Diplomacy System Types
 */

export type DiplomaticRelation = 'war' | 'neutral' | 'friendly' | 'allied';

export type DiplomaticAction =
  | 'declare_war'
  | 'request_peace'
  | 'propose_alliance'
  | 'break_alliance'
  | 'offer_trade'
  | 'demand_tribute';

export interface DiplomaticState {
  playerId1: string;
  playerId2: string;
  relation: DiplomaticRelation;
  trustLevel: number; // -100 to 100
  tradeAgreements: TradeAgreement[];
  lastInteraction: number; // turn number
}

export interface TradeAgreement {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offering: TradeOffer;
  requesting: TradeOffer;
  duration: number; // turns remaining
  createdTurn: number;
}

export interface TradeOffer {
  gold?: number;
  goldPerTurn?: number;
  resources?: Record<string, number>;
  technologies?: string[];
  cities?: string[]; // city IDs
}

export interface DiplomaticMessage {
  fromPlayerId: string;
  toPlayerId: string;
  action: DiplomaticAction;
  offer?: TradeOffer;
  request?: TradeOffer;
  message: string;
  turn: number;
}
