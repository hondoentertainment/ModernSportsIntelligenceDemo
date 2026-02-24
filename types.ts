
export type Sport = 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Soccer';
export type League = 'MLB' | 'MiLB' | 'NBA' | 'NFL' | 'Other';

export interface ExitPlan {
  id: string;
  targetPrice: number;
  timeframe: 'Short (3m)' | 'Medium (6-12m)' | 'Long (1-3y)' | 'Held (3y+)';
  strategy: 'Take Profit' | 'Cut Loss' | 'Institutional Hold';
  notes?: string;
  createdAt: string;
}

export interface PopReport {
  popHigher: number;
  popTotal: number;
  popAtGrade: number;
  lastChecked: string;
  source: 'simulated' | 'psa' | 'bgs';
  badge?: 'Apex' | 'Low Pop' | 'Standard';
}

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
  searchUrl?: string;
  // Professional Grade Fields
  taxBasis?: number;
  gradingFees?: number;
  shippingFees?: number;
  status?: 'active' | 'sold';
  salePrice?: number;
  saleDate?: string;
  // Portfolio Builder Groups
  group?: string;
  groupOrder?: number;
  // Scarcity Data
  popCount?: number;
  popHigher?: number;
  scarcityIndex?: number; // 0-100
  popReport?: PopReport;
  gradingRoi?: number; // Percentage gain/loss
  // Liquidity Intelligence (Phase 20)
  liquidityScore?: number; // 0-100
  exitPlan?: ExitPlan;
  exitPlanId?: string;
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
  searchUrl?: string;
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
  image?: string;
}

export interface PricingAnalysis {
  estimatedValue: number;
  low: number;
  high: number;
  avg: number;
  confidence: number;
  salesCount: number;
  lastUpdated: string;
  searchUrl?: string; // Deep link to eBay for manual verification
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


export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic: boolean;
  twitterHandle?: string;
  instagramHandle?: string;
  joinedAt: string;
  alphaScore: number;
  portfolioValue: number;
  roi: number;
  tier?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: UserProfile;
  alphaScore: number;
  change24h: number;
}

export type NegotiationStatus = 'active' | 'accepted' | 'rejected' | 'countered';

export interface AgentInsight {
  agentId: string;
  agentName: string;
  persona: string;
  insight: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface CollaborativeThesis {
  id: string;
  summary: string;
  keyTakeaways: string[];
  riskAssessment: string;
  recommendedAction: string;
  agents: AgentInsight[];
  createdAt: string;
}

export interface NegotiationMessage {
  id: string;
  sender: 'user' | 'agent' | 'seller';
  content: string;
  offerAmount?: number;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'aggressive';
}

export interface NegotiationSession {
  id: string;
  targetItem: {
    id: string;
    name: string;
    price: number; // Listing Price
    image: string;
  };
  currentUserOffer: number;
  sellerAsk: number;
  maxWillingToPay: number;
  status: NegotiationStatus;
  messages: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}
