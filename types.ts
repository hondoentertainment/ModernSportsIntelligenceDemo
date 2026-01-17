
export type Sport = 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Soccer';

export interface CardInventory {
  id: string;
  player: string;
  year: number;
  manufacturer: string;
  cardNumber: string;
  set: string;
  sport: Sport;
  isAutographed: boolean;
  condition: string;
  isGraded: boolean;
  gradingCompany?: 'PSA' | 'BGS' | 'SGC' | 'CSG' | 'HGA' | 'Other';
  grade?: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue?: number;
  lastValuationDate?: string;
  valuationConfidence?: number;
  notes?: string;
  image?: string;
}

export interface TargetWatchlist {
  id: string;
  player: string;
  cardDescription: string;
  priority: 'High' | 'Medium' | 'Low';
  targetPrice: number;
  notes?: string;
  sport: Sport;
}

export interface MiLBProspect {
  id: string;
  name: string;
  team: string;
  position: string;
  league: 'AAA' | 'AA' | 'High-A' | 'Low-A';
  trendScore: number; // 0-100
  change24h: number; // percentage
  trendDirection: 'up' | 'down' | 'stable';
  history7d: number[];
}

export interface MLBPlayer {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentTeam: { id: number; name: string };
  primaryPosition: { code: string; name: string };
  batSide: { code: string; description: string };
  pitchHand: { code: string; description: string };
}

export interface PricingAnalysis {
  estimatedValue: number;
  low: number;
  high: number;
  avg: number;
  confidence: number;
  salesCount: number;
  lastUpdated: string;
}
