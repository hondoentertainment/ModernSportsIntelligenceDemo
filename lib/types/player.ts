/**
 * Player & sports data types for ESPN, MLB Stats, etc.
 */

export type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'soccer';

/** Unified player profile across sports */
export interface PlayerProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  sport: Sport;
  league: string;
  team: string;
  position: string;
  number?: string;
  birthDate?: string;
  age?: number;
  imageUrl?: string;
  isRookie: boolean;
  isActive: boolean;
  /** Years of professional experience */
  experience: number;
  /** External IDs for cross-referencing */
  externalIds: {
    mlbId?: number;
    espnId?: number;
    basketballReferenceId?: string;
    proFootballReferenceId?: string;
  };
}

/** Game event that could impact card prices */
export interface GameEvent {
  id: string;
  type: 'milestone' | 'injury' | 'trade' | 'award' | 'record' | 'debut' | 'retirement';
  playerId: string;
  playerName: string;
  sport: Sport;
  headline: string;
  description: string;
  impactScore: number;
  /** Estimated price impact percentage */
  priceImpactPercent: number;
  timestamp: string;
  source: string;
}

/** Player stats summary (sport-agnostic) */
export interface PlayerStatsSummary {
  playerId: string;
  season: string;
  gamesPlayed: number;
  /** Key stat lines depend on sport */
  stats: Record<string, number | string>;
  /** Overall performance rating 0-100 */
  performanceRating: number;
  trending: 'up' | 'down' | 'stable';
}
