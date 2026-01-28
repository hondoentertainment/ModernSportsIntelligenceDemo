
export type Sport = 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Soccer';
export type League = 'MLB' | 'MiLB' | 'NBA' | 'NFL' | 'Other';

export interface CardInventory {
  id: string;
  player: string;
  year: number;
  manufacturer: string;
  cardNumber: string;
  set: string;
  sport: Sport;
  league: League;
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
  currentMarketPrice?: number;
  notes?: string;
  sport: Sport;
  league: League;
  status: 'active' | 'acquired' | 'expired';
  createdAt: string;
  image?: string;
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
  breakoutScore: number; // 0-100
  summary: string;
  image: string;
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

export type AlertType = 'price_target' | 'sync_complete' | 'trend' | 'momentum' | 'warning' | 'system';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  relatedId?: string; // Target ID, Card ID, etc.
  metadata?: Record<string, any>;
}

