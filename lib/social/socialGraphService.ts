// @ts-nocheck
// ---- Types ----

export type CollectorTier = 'whale' | 'shark' | 'dolphin' | 'fish' | 'minnow';

export type EdgeType = 'follows' | 'traded' | 'co-collects' | 'rival';

export type HerdSignalType = 'accumulation' | 'distribution' | 'FOMO' | 'panic-sell';

export type HerdPhase = 'early' | 'peak' | 'late';

export type InfluencerAction = 'bought' | 'sold' | 'graded' | 'listed';

export type AdoptionPhase =
  | 'innovator'
  | 'early-adopter'
  | 'early-majority'
  | 'late-majority'
  | 'laggard';

export interface CollectorNode {
  id: string;
  username: string;
  avatarInitial: string;
  reputation: number; // 0-100
  totalValue: number;
  cardCount: number;
  specialty: string[];
  influenceScore: number; // 0-100
  followerCount: number;
  followingCount: number;
  tradeCount: number;
  joinDate: string;
  tier: CollectorTier;
}

export interface SocialEdge {
  from: string;
  to: string;
  type: EdgeType;
  strength: number; // 0-1
  lastInteraction: string;
}

export interface HerdSignal {
  id: string;
  type: HerdSignalType;
  detectedAt: string;
  participants: string[];
  targetCard: string;
  magnitude: number; // 0-100
  phase: HerdPhase;
}

export interface InfluencerAlert {
  influencerId: string;
  action: InfluencerAction;
  card: string;
  timestamp: string;
  marketImpactPercent: number;
  followerReactionTime: number; // minutes
}

export interface TrendAdoptionCurve {
  trendId: string;
  name: string;
  phase: AdoptionPhase;
  adoptionPercent: number;
  velocity: number; // percent per day
  projectedPeak: string;
  dataPoints: { day: number; adoption: number }[];
}

export interface CommunityCluster {
  id: string;
  name: string;
  members: string[];
  avgReputation: number;
  specialty: string;
  avgPortfolioValue: number;
  activityLevel: 'high' | 'medium' | 'low';
}

export interface MarketMomentum {
  overall: number; // -100 to 100
  sentiment: 'bullish' | 'bearish' | 'neutral';
  topMovers: { card: string; change: number }[];
  volumeChange: number;
  activeTraders24h: number;
}

export interface CollectorPath {
  nodes: string[];
  edgeTypes: EdgeType[];
  totalStrength: number;
  degrees: number;
}

// ---- Mock Data: Collector Nodes (55 collectors) ----

const collectorNodes: CollectorNode[] = [
  { id: 'c-001', username: 'CardKingMJ', avatarInitial: 'C', reputation: 97, totalValue: 2450000, cardCount: 4200, specialty: ['Basketball', 'Michael Jordan'], influenceScore: 98, followerCount: 48200, followingCount: 310, tradeCount: 1820, joinDate: '2018-01-15', tier: 'whale' },
  { id: 'c-002', username: 'RookieHunter99', avatarInitial: 'R', reputation: 91, totalValue: 1870000, cardCount: 3100, specialty: ['Football', 'Rookie Cards'], influenceScore: 89, followerCount: 32100, followingCount: 480, tradeCount: 1450, joinDate: '2018-06-22', tier: 'whale' },
  { id: 'c-003', username: 'GradedGemMint', avatarInitial: 'G', reputation: 94, totalValue: 1340000, cardCount: 1850, specialty: ['PSA 10', 'Graded Cards'], influenceScore: 92, followerCount: 41500, followingCount: 220, tradeCount: 980, joinDate: '2017-11-03', tier: 'whale' },
  { id: 'c-004', username: 'VintageVault', avatarInitial: 'V', reputation: 96, totalValue: 3100000, cardCount: 2200, specialty: ['Vintage', 'Pre-war', 'Tobacco Cards'], influenceScore: 85, followerCount: 27800, followingCount: 190, tradeCount: 620, joinDate: '2016-03-10', tier: 'whale' },
  { id: 'c-005', username: 'WaxBreaker', avatarInitial: 'W', reputation: 88, totalValue: 890000, cardCount: 5600, specialty: ['Box Breaks', 'Hobby Boxes'], influenceScore: 94, followerCount: 55200, followingCount: 870, tradeCount: 3200, joinDate: '2019-02-18', tier: 'shark' },
  { id: 'c-006', username: 'PrizmQueen', avatarInitial: 'P', reputation: 86, totalValue: 720000, cardCount: 2900, specialty: ['Prizm', 'Silver', 'Color Parallels'], influenceScore: 82, followerCount: 23400, followingCount: 540, tradeCount: 1680, joinDate: '2019-08-05', tier: 'shark' },
  { id: 'c-007', username: 'FlipMaster', avatarInitial: 'F', reputation: 72, totalValue: 340000, cardCount: 1200, specialty: ['Flipping', 'Short-term Trades'], influenceScore: 78, followerCount: 19800, followingCount: 620, tradeCount: 4500, joinDate: '2020-01-12', tier: 'shark' },
  { id: 'c-008', username: 'SetBuilder_Dan', avatarInitial: 'S', reputation: 90, totalValue: 280000, cardCount: 8900, specialty: ['Complete Sets', 'Base Cards'], influenceScore: 55, followerCount: 8200, followingCount: 340, tradeCount: 2100, joinDate: '2015-07-20', tier: 'dolphin' },
  { id: 'c-009', username: 'PatchCollector', avatarInitial: 'P', reputation: 84, totalValue: 560000, cardCount: 780, specialty: ['Game-Used Patches', 'Memorabilia'], influenceScore: 71, followerCount: 14500, followingCount: 290, tradeCount: 890, joinDate: '2019-04-15', tier: 'shark' },
  { id: 'c-010', username: 'AutoHunterX', avatarInitial: 'A', reputation: 87, totalValue: 980000, cardCount: 1560, specialty: ['Autographs', 'On-card Autos'], influenceScore: 80, followerCount: 21300, followingCount: 410, tradeCount: 1240, joinDate: '2018-09-30', tier: 'shark' },
  { id: 'c-011', username: 'BowmanScout', avatarInitial: 'B', reputation: 83, totalValue: 410000, cardCount: 3400, specialty: ['Bowman', 'Prospects', '1st Bowman'], influenceScore: 76, followerCount: 17600, followingCount: 520, tradeCount: 2300, joinDate: '2019-11-08', tier: 'shark' },
  { id: 'c-012', username: 'ToppsNostalgia', avatarInitial: 'T', reputation: 92, totalValue: 1150000, cardCount: 6200, specialty: ['Topps Heritage', 'Vintage Topps'], influenceScore: 68, followerCount: 12800, followingCount: 180, tradeCount: 540, joinDate: '2014-05-25', tier: 'whale' },
  { id: 'c-013', username: 'NBAFutures', avatarInitial: 'N', reputation: 79, totalValue: 320000, cardCount: 1800, specialty: ['NBA Rookies', 'Basketball'], influenceScore: 74, followerCount: 15200, followingCount: 680, tradeCount: 1560, joinDate: '2020-06-14', tier: 'dolphin' },
  { id: 'c-014', username: 'GridironGold', avatarInitial: 'G', reputation: 81, totalValue: 440000, cardCount: 2100, specialty: ['Football', 'Gold Parallels'], influenceScore: 69, followerCount: 11900, followingCount: 350, tradeCount: 980, joinDate: '2019-09-01', tier: 'dolphin' },
  { id: 'c-015', username: 'DiamondDealer', avatarInitial: 'D', reputation: 76, totalValue: 290000, cardCount: 950, specialty: ['Baseball', 'Refractors'], influenceScore: 65, followerCount: 9800, followingCount: 430, tradeCount: 1820, joinDate: '2020-03-20', tier: 'dolphin' },
  { id: 'c-016', username: 'SlabCollector', avatarInitial: 'S', reputation: 89, totalValue: 780000, cardCount: 1100, specialty: ['Graded Cards', 'BGS 9.5'], influenceScore: 73, followerCount: 13600, followingCount: 260, tradeCount: 720, joinDate: '2018-12-05', tier: 'shark' },
  { id: 'c-017', username: 'HoopsHero', avatarInitial: 'H', reputation: 71, totalValue: 185000, cardCount: 2400, specialty: ['Basketball', 'NBA Hoops'], influenceScore: 58, followerCount: 7400, followingCount: 510, tradeCount: 890, joinDate: '2020-10-18', tier: 'dolphin' },
  { id: 'c-018', username: 'PCOnly_Brady', avatarInitial: 'P', reputation: 93, totalValue: 1560000, cardCount: 620, specialty: ['Tom Brady', 'Patriots'], influenceScore: 62, followerCount: 10200, followingCount: 140, tradeCount: 280, joinDate: '2016-01-28', tier: 'whale' },
  { id: 'c-019', username: 'BreakNinja', avatarInitial: 'B', reputation: 77, totalValue: 210000, cardCount: 3800, specialty: ['Group Breaks', 'Random Teams'], influenceScore: 83, followerCount: 28900, followingCount: 720, tradeCount: 2800, joinDate: '2020-04-10', tier: 'dolphin' },
  { id: 'c-020', username: 'MintCondition', avatarInitial: 'M', reputation: 85, totalValue: 520000, cardCount: 1650, specialty: ['Raw Cards', 'Near-Mint'], influenceScore: 61, followerCount: 8900, followingCount: 320, tradeCount: 940, joinDate: '2019-07-22', tier: 'shark' },
  { id: 'c-021', username: 'PaniniKing', avatarInitial: 'P', reputation: 78, totalValue: 380000, cardCount: 2700, specialty: ['Panini', 'National Treasures'], influenceScore: 72, followerCount: 14100, followingCount: 460, tradeCount: 1340, joinDate: '2019-05-16', tier: 'dolphin' },
  { id: 'c-022', username: 'ErrorCardFan', avatarInitial: 'E', reputation: 68, totalValue: 95000, cardCount: 420, specialty: ['Error Cards', 'Oddball'], influenceScore: 42, followerCount: 3200, followingCount: 280, tradeCount: 310, joinDate: '2021-02-14', tier: 'fish' },
  { id: 'c-023', username: 'SoccerStar_FC', avatarInitial: 'S', reputation: 74, totalValue: 260000, cardCount: 1900, specialty: ['Soccer', 'Premier League'], influenceScore: 66, followerCount: 10800, followingCount: 390, tradeCount: 780, joinDate: '2020-08-01', tier: 'dolphin' },
  { id: 'c-024', username: 'HockeyVault', avatarInitial: 'H', reputation: 82, totalValue: 340000, cardCount: 2300, specialty: ['Hockey', 'Young Guns'], influenceScore: 59, followerCount: 7800, followingCount: 310, tradeCount: 620, joinDate: '2018-10-15', tier: 'dolphin' },
  { id: 'c-025', username: 'InvestorMike', avatarInitial: 'I', reputation: 80, totalValue: 670000, cardCount: 890, specialty: ['Investment Grade', 'Blue Chips'], influenceScore: 77, followerCount: 18500, followingCount: 250, tradeCount: 1100, joinDate: '2019-01-08', tier: 'shark' },
  { id: 'c-026', username: 'CasualCarl', avatarInitial: 'C', reputation: 45, totalValue: 8500, cardCount: 120, specialty: ['Casual Collector'], influenceScore: 12, followerCount: 45, followingCount: 180, tradeCount: 18, joinDate: '2023-06-01', tier: 'minnow' },
  { id: 'c-027', username: 'NewbieNick', avatarInitial: 'N', reputation: 38, totalValue: 3200, cardCount: 65, specialty: ['New Collector'], influenceScore: 8, followerCount: 22, followingCount: 210, tradeCount: 5, joinDate: '2024-01-15', tier: 'minnow' },
  { id: 'c-028', username: 'ChromeChaser', avatarInitial: 'C', reputation: 73, totalValue: 195000, cardCount: 1400, specialty: ['Topps Chrome', 'Refractors'], influenceScore: 54, followerCount: 6200, followingCount: 380, tradeCount: 720, joinDate: '2020-11-20', tier: 'dolphin' },
  { id: 'c-029', username: 'ParallelPete', avatarInitial: 'P', reputation: 69, totalValue: 145000, cardCount: 2100, specialty: ['Numbered Cards', 'Parallels'], influenceScore: 48, followerCount: 4800, followingCount: 420, tradeCount: 580, joinDate: '2021-03-08', tier: 'fish' },
  { id: 'c-030', username: 'BasketballJen', avatarInitial: 'B', reputation: 75, totalValue: 230000, cardCount: 1600, specialty: ['WNBA', 'Basketball'], influenceScore: 63, followerCount: 9400, followingCount: 340, tradeCount: 640, joinDate: '2020-05-22', tier: 'dolphin' },
  { id: 'c-031', username: 'TradeKing_Lou', avatarInitial: 'T', reputation: 82, totalValue: 310000, cardCount: 2800, specialty: ['Trading', 'Value Trades'], influenceScore: 70, followerCount: 12400, followingCount: 580, tradeCount: 5200, joinDate: '2019-02-28', tier: 'dolphin' },
  { id: 'c-032', username: 'GrailHunter', avatarInitial: 'G', reputation: 88, totalValue: 890000, cardCount: 340, specialty: ['Holy Grails', 'Ultra Rare'], influenceScore: 75, followerCount: 16200, followingCount: 200, tradeCount: 180, joinDate: '2017-08-14', tier: 'shark' },
  { id: 'c-033', username: 'PennySleeve', avatarInitial: 'P', reputation: 52, totalValue: 22000, cardCount: 3200, specialty: ['Budget Collector', 'Commons'], influenceScore: 25, followerCount: 1200, followingCount: 340, tradeCount: 280, joinDate: '2022-04-10', tier: 'fish' },
  { id: 'c-034', username: 'MemorabiliaMat', avatarInitial: 'M', reputation: 79, totalValue: 420000, cardCount: 680, specialty: ['Memorabilia', 'Jersey Cards'], influenceScore: 56, followerCount: 7100, followingCount: 290, tradeCount: 450, joinDate: '2019-12-01', tier: 'dolphin' },
  { id: 'c-035', username: 'ProspectPro', avatarInitial: 'P', reputation: 81, totalValue: 275000, cardCount: 1900, specialty: ['Prospects', 'Minor League'], influenceScore: 71, followerCount: 13800, followingCount: 450, tradeCount: 1680, joinDate: '2020-02-14', tier: 'dolphin' },
  { id: 'c-036', username: 'LeBronFanatic', avatarInitial: 'L', reputation: 83, totalValue: 920000, cardCount: 480, specialty: ['LeBron James', 'Lakers'], influenceScore: 64, followerCount: 10500, followingCount: 160, tradeCount: 340, joinDate: '2017-06-23', tier: 'shark' },
  { id: 'c-037', username: 'OhtaniCollects', avatarInitial: 'O', reputation: 76, totalValue: 350000, cardCount: 1100, specialty: ['Shohei Ohtani', 'Baseball'], influenceScore: 68, followerCount: 11200, followingCount: 380, tradeCount: 890, joinDate: '2021-04-01', tier: 'dolphin' },
  { id: 'c-038', username: 'DraftPicks_Al', avatarInitial: 'D', reputation: 70, totalValue: 165000, cardCount: 2300, specialty: ['Draft Picks', 'NFL Rookies'], influenceScore: 52, followerCount: 5600, followingCount: 410, tradeCount: 940, joinDate: '2020-09-15', tier: 'dolphin' },
  { id: 'c-039', username: 'CardShopOwner', avatarInitial: 'C', reputation: 91, totalValue: 1800000, cardCount: 12000, specialty: ['Retail', 'All Sports'], influenceScore: 86, followerCount: 35200, followingCount: 920, tradeCount: 8400, joinDate: '2015-03-01', tier: 'whale' },
  { id: 'c-040', username: 'InvestorJane', avatarInitial: 'I', reputation: 84, totalValue: 580000, cardCount: 720, specialty: ['Portfolio Strategy', 'Blue Chips'], influenceScore: 74, followerCount: 15800, followingCount: 280, tradeCount: 920, joinDate: '2019-06-10', tier: 'shark' },
  { id: 'c-041', username: 'JunkWaxJerry', avatarInitial: 'J', reputation: 65, totalValue: 35000, cardCount: 15000, specialty: ['Junk Wax Era', '80s-90s'], influenceScore: 38, followerCount: 2800, followingCount: 260, tradeCount: 420, joinDate: '2021-08-20', tier: 'fish' },
  { id: 'c-042', username: 'UltraModern', avatarInitial: 'U', reputation: 72, totalValue: 190000, cardCount: 850, specialty: ['Ultra Modern', '2023-2025'], influenceScore: 57, followerCount: 6800, followingCount: 490, tradeCount: 1100, joinDate: '2022-01-05', tier: 'dolphin' },
  { id: 'c-043', username: 'SnipeAndFlip', avatarInitial: 'S', reputation: 58, totalValue: 78000, cardCount: 380, specialty: ['Auction Sniping', 'Quick Flips'], influenceScore: 44, followerCount: 3900, followingCount: 520, tradeCount: 2200, joinDate: '2022-06-18', tier: 'fish' },
  { id: 'c-044', username: 'CompletionDave', avatarInitial: 'C', reputation: 87, totalValue: 260000, cardCount: 9800, specialty: ['Set Completion', 'Topps Series'], influenceScore: 47, followerCount: 4200, followingCount: 180, tradeCount: 1600, joinDate: '2016-09-12', tier: 'dolphin' },
  { id: 'c-045', username: 'WembyTracker', avatarInitial: 'W', reputation: 74, totalValue: 280000, cardCount: 620, specialty: ['Victor Wembanyama', 'French Players'], influenceScore: 70, followerCount: 13200, followingCount: 360, tradeCount: 780, joinDate: '2023-02-01', tier: 'dolphin' },
  { id: 'c-046', username: 'PSA_Submitter', avatarInitial: 'P', reputation: 80, totalValue: 420000, cardCount: 950, specialty: ['PSA Grading', 'Population Reports'], influenceScore: 67, followerCount: 11600, followingCount: 310, tradeCount: 680, joinDate: '2019-03-25', tier: 'dolphin' },
  { id: 'c-047', username: 'BGSBlackLabel', avatarInitial: 'B', reputation: 86, totalValue: 710000, cardCount: 420, specialty: ['BGS 10', 'Black Labels'], influenceScore: 72, followerCount: 14400, followingCount: 240, tradeCount: 520, joinDate: '2018-07-08', tier: 'shark' },
  { id: 'c-048', username: 'RetroRay', avatarInitial: 'R', reputation: 78, totalValue: 180000, cardCount: 4100, specialty: ['Retro', '1970s', 'Topps'], influenceScore: 43, followerCount: 3400, followingCount: 200, tradeCount: 380, joinDate: '2020-12-01', tier: 'dolphin' },
  { id: 'c-049', username: 'RipAndShip', avatarInitial: 'R', reputation: 70, totalValue: 130000, cardCount: 2800, specialty: ['Ripping', 'Shipping', 'Box Breaks'], influenceScore: 60, followerCount: 8500, followingCount: 650, tradeCount: 1900, joinDate: '2021-05-15', tier: 'fish' },
  { id: 'c-050', username: 'TroutPC', avatarInitial: 'T', reputation: 90, totalValue: 1100000, cardCount: 380, specialty: ['Mike Trout', 'Angels'], influenceScore: 63, followerCount: 9200, followingCount: 150, tradeCount: 290, joinDate: '2016-08-18', tier: 'whale' },
  { id: 'c-051', username: 'MahomeMania', avatarInitial: 'M', reputation: 77, totalValue: 490000, cardCount: 710, specialty: ['Patrick Mahomes', 'Chiefs'], influenceScore: 66, followerCount: 10900, followingCount: 320, tradeCount: 560, joinDate: '2020-02-02', tier: 'dolphin' },
  { id: 'c-052', username: 'CardShowTour', avatarInitial: 'C', reputation: 83, totalValue: 320000, cardCount: 3200, specialty: ['Card Shows', 'In-Person Deals'], influenceScore: 58, followerCount: 7600, followingCount: 480, tradeCount: 2400, joinDate: '2018-04-20', tier: 'dolphin' },
  { id: 'c-053', username: 'eBaySniper', avatarInitial: 'E', reputation: 62, totalValue: 55000, cardCount: 580, specialty: ['eBay', 'Auction Strategy'], influenceScore: 35, followerCount: 2100, followingCount: 380, tradeCount: 1400, joinDate: '2022-09-10', tier: 'fish' },
  { id: 'c-054', username: 'OneOfOneClub', avatarInitial: 'O', reputation: 95, totalValue: 2800000, cardCount: 210, specialty: ['1/1 Cards', 'Superfractors'], influenceScore: 88, followerCount: 38400, followingCount: 170, tradeCount: 420, joinDate: '2017-02-14', tier: 'whale' },
  { id: 'c-055', username: 'BudgetBaller', avatarInitial: 'B', reputation: 55, totalValue: 12000, cardCount: 850, specialty: ['Budget Picks', 'Under $10'], influenceScore: 30, followerCount: 1800, followingCount: 420, tradeCount: 340, joinDate: '2023-08-05', tier: 'fish' },
];

// ---- Mock Data: Social Edges (120+ edges) ----

const socialEdges: SocialEdge[] = [
  // Whale-to-Whale follows and trades
  { from: 'c-001', to: 'c-003', type: 'follows', strength: 0.92, lastInteraction: '2026-03-14' },
  { from: 'c-003', to: 'c-001', type: 'follows', strength: 0.88, lastInteraction: '2026-03-14' },
  { from: 'c-001', to: 'c-004', type: 'traded', strength: 0.75, lastInteraction: '2026-03-10' },
  { from: 'c-001', to: 'c-054', type: 'co-collects', strength: 0.85, lastInteraction: '2026-03-12' },
  { from: 'c-002', to: 'c-001', type: 'follows', strength: 0.90, lastInteraction: '2026-03-14' },
  { from: 'c-002', to: 'c-011', type: 'co-collects', strength: 0.78, lastInteraction: '2026-03-11' },
  { from: 'c-002', to: 'c-014', type: 'traded', strength: 0.65, lastInteraction: '2026-03-08' },
  { from: 'c-003', to: 'c-016', type: 'co-collects', strength: 0.89, lastInteraction: '2026-03-13' },
  { from: 'c-003', to: 'c-047', type: 'co-collects', strength: 0.82, lastInteraction: '2026-03-12' },
  { from: 'c-004', to: 'c-012', type: 'co-collects', strength: 0.93, lastInteraction: '2026-03-14' },
  { from: 'c-004', to: 'c-048', type: 'traded', strength: 0.70, lastInteraction: '2026-03-05' },
  { from: 'c-054', to: 'c-001', type: 'follows', strength: 0.80, lastInteraction: '2026-03-13' },
  { from: 'c-054', to: 'c-032', type: 'co-collects', strength: 0.88, lastInteraction: '2026-03-14' },
  { from: 'c-054', to: 'c-003', type: 'traded', strength: 0.72, lastInteraction: '2026-03-09' },

  // Influencer network
  { from: 'c-005', to: 'c-001', type: 'follows', strength: 0.85, lastInteraction: '2026-03-14' },
  { from: 'c-005', to: 'c-019', type: 'co-collects', strength: 0.91, lastInteraction: '2026-03-14' },
  { from: 'c-005', to: 'c-049', type: 'traded', strength: 0.68, lastInteraction: '2026-03-07' },
  { from: 'c-005', to: 'c-039', type: 'traded', strength: 0.77, lastInteraction: '2026-03-12' },
  { from: 'c-039', to: 'c-005', type: 'follows', strength: 0.82, lastInteraction: '2026-03-14' },
  { from: 'c-039', to: 'c-031', type: 'traded', strength: 0.88, lastInteraction: '2026-03-13' },
  { from: 'c-039', to: 'c-052', type: 'co-collects', strength: 0.76, lastInteraction: '2026-03-10' },

  // Grading community
  { from: 'c-016', to: 'c-046', type: 'co-collects', strength: 0.90, lastInteraction: '2026-03-14' },
  { from: 'c-046', to: 'c-003', type: 'follows', strength: 0.87, lastInteraction: '2026-03-14' },
  { from: 'c-047', to: 'c-016', type: 'co-collects', strength: 0.85, lastInteraction: '2026-03-13' },
  { from: 'c-046', to: 'c-047', type: 'traded', strength: 0.72, lastInteraction: '2026-03-09' },

  // Basketball cluster
  { from: 'c-013', to: 'c-001', type: 'follows', strength: 0.88, lastInteraction: '2026-03-14' },
  { from: 'c-013', to: 'c-017', type: 'co-collects', strength: 0.82, lastInteraction: '2026-03-12' },
  { from: 'c-013', to: 'c-030', type: 'co-collects', strength: 0.79, lastInteraction: '2026-03-11' },
  { from: 'c-013', to: 'c-036', type: 'follows', strength: 0.85, lastInteraction: '2026-03-14' },
  { from: 'c-013', to: 'c-045', type: 'co-collects', strength: 0.74, lastInteraction: '2026-03-10' },
  { from: 'c-017', to: 'c-030', type: 'follows', strength: 0.71, lastInteraction: '2026-03-13' },
  { from: 'c-030', to: 'c-017', type: 'follows', strength: 0.68, lastInteraction: '2026-03-12' },
  { from: 'c-036', to: 'c-001', type: 'rival', strength: 0.55, lastInteraction: '2026-03-08' },
  { from: 'c-036', to: 'c-045', type: 'traded', strength: 0.62, lastInteraction: '2026-03-06' },
  { from: 'c-045', to: 'c-036', type: 'follows', strength: 0.80, lastInteraction: '2026-03-14' },

  // Football cluster
  { from: 'c-014', to: 'c-002', type: 'follows', strength: 0.86, lastInteraction: '2026-03-14' },
  { from: 'c-014', to: 'c-038', type: 'co-collects', strength: 0.81, lastInteraction: '2026-03-12' },
  { from: 'c-014', to: 'c-051', type: 'co-collects', strength: 0.77, lastInteraction: '2026-03-10' },
  { from: 'c-038', to: 'c-002', type: 'follows', strength: 0.79, lastInteraction: '2026-03-13' },
  { from: 'c-051', to: 'c-018', type: 'rival', strength: 0.45, lastInteraction: '2026-03-04' },
  { from: 'c-051', to: 'c-014', type: 'traded', strength: 0.72, lastInteraction: '2026-03-11' },

  // Baseball cluster
  { from: 'c-015', to: 'c-037', type: 'co-collects', strength: 0.84, lastInteraction: '2026-03-13' },
  { from: 'c-015', to: 'c-050', type: 'follows', strength: 0.78, lastInteraction: '2026-03-14' },
  { from: 'c-037', to: 'c-011', type: 'co-collects', strength: 0.72, lastInteraction: '2026-03-11' },
  { from: 'c-037', to: 'c-050', type: 'follows', strength: 0.85, lastInteraction: '2026-03-14' },
  { from: 'c-050', to: 'c-004', type: 'traded', strength: 0.60, lastInteraction: '2026-03-02' },
  { from: 'c-011', to: 'c-035', type: 'co-collects', strength: 0.88, lastInteraction: '2026-03-14' },
  { from: 'c-035', to: 'c-011', type: 'follows', strength: 0.82, lastInteraction: '2026-03-13' },

  // Trading hub connections
  { from: 'c-007', to: 'c-031', type: 'rival', strength: 0.60, lastInteraction: '2026-03-09' },
  { from: 'c-007', to: 'c-043', type: 'co-collects', strength: 0.75, lastInteraction: '2026-03-12' },
  { from: 'c-007', to: 'c-053', type: 'traded', strength: 0.68, lastInteraction: '2026-03-08' },
  { from: 'c-031', to: 'c-007', type: 'follows', strength: 0.55, lastInteraction: '2026-03-11' },
  { from: 'c-031', to: 'c-043', type: 'traded', strength: 0.62, lastInteraction: '2026-03-07' },
  { from: 'c-043', to: 'c-053', type: 'co-collects', strength: 0.80, lastInteraction: '2026-03-13' },

  // PC collectors
  { from: 'c-018', to: 'c-002', type: 'follows', strength: 0.72, lastInteraction: '2026-03-12' },
  { from: 'c-018', to: 'c-050', type: 'co-collects', strength: 0.55, lastInteraction: '2026-03-05' },
  { from: 'c-036', to: 'c-013', type: 'follows', strength: 0.78, lastInteraction: '2026-03-14' },
  { from: 'c-037', to: 'c-015', type: 'follows', strength: 0.81, lastInteraction: '2026-03-13' },

  // Investment group
  { from: 'c-025', to: 'c-040', type: 'co-collects', strength: 0.91, lastInteraction: '2026-03-14' },
  { from: 'c-040', to: 'c-025', type: 'follows', strength: 0.88, lastInteraction: '2026-03-14' },
  { from: 'c-025', to: 'c-001', type: 'follows', strength: 0.82, lastInteraction: '2026-03-13' },
  { from: 'c-025', to: 'c-054', type: 'follows', strength: 0.85, lastInteraction: '2026-03-14' },
  { from: 'c-040', to: 'c-003', type: 'follows', strength: 0.80, lastInteraction: '2026-03-13' },
  { from: 'c-040', to: 'c-032', type: 'traded', strength: 0.70, lastInteraction: '2026-03-10' },

  // Box break community
  { from: 'c-019', to: 'c-049', type: 'co-collects', strength: 0.87, lastInteraction: '2026-03-14' },
  { from: 'c-049', to: 'c-019', type: 'follows', strength: 0.84, lastInteraction: '2026-03-14' },
  { from: 'c-019', to: 'c-005', type: 'follows', strength: 0.90, lastInteraction: '2026-03-14' },
  { from: 'c-049', to: 'c-005', type: 'follows', strength: 0.86, lastInteraction: '2026-03-13' },

  // Parallel / Chrome collectors
  { from: 'c-006', to: 'c-028', type: 'co-collects', strength: 0.85, lastInteraction: '2026-03-13' },
  { from: 'c-028', to: 'c-029', type: 'co-collects', strength: 0.79, lastInteraction: '2026-03-12' },
  { from: 'c-006', to: 'c-029', type: 'traded', strength: 0.65, lastInteraction: '2026-03-08' },
  { from: 'c-006', to: 'c-021', type: 'co-collects', strength: 0.77, lastInteraction: '2026-03-11' },
  { from: 'c-021', to: 'c-006', type: 'follows', strength: 0.82, lastInteraction: '2026-03-14' },

  // Set builders
  { from: 'c-008', to: 'c-044', type: 'co-collects', strength: 0.94, lastInteraction: '2026-03-14' },
  { from: 'c-044', to: 'c-008', type: 'follows', strength: 0.90, lastInteraction: '2026-03-14' },
  { from: 'c-008', to: 'c-012', type: 'traded', strength: 0.72, lastInteraction: '2026-03-09' },
  { from: 'c-044', to: 'c-012', type: 'follows', strength: 0.78, lastInteraction: '2026-03-12' },

  // Memorabilia connections
  { from: 'c-009', to: 'c-034', type: 'co-collects', strength: 0.88, lastInteraction: '2026-03-14' },
  { from: 'c-034', to: 'c-009', type: 'follows', strength: 0.85, lastInteraction: '2026-03-13' },
  { from: 'c-009', to: 'c-010', type: 'co-collects', strength: 0.80, lastInteraction: '2026-03-12' },
  { from: 'c-010', to: 'c-009', type: 'traded', strength: 0.73, lastInteraction: '2026-03-10' },
  { from: 'c-010', to: 'c-032', type: 'follows', strength: 0.77, lastInteraction: '2026-03-14' },
  { from: 'c-032', to: 'c-010', type: 'traded', strength: 0.65, lastInteraction: '2026-03-07' },

  // Newbie / Casual edges
  { from: 'c-026', to: 'c-005', type: 'follows', strength: 0.30, lastInteraction: '2026-03-13' },
  { from: 'c-026', to: 'c-055', type: 'co-collects', strength: 0.42, lastInteraction: '2026-03-10' },
  { from: 'c-027', to: 'c-001', type: 'follows', strength: 0.22, lastInteraction: '2026-03-12' },
  { from: 'c-027', to: 'c-026', type: 'follows', strength: 0.35, lastInteraction: '2026-03-11' },
  { from: 'c-055', to: 'c-033', type: 'co-collects', strength: 0.48, lastInteraction: '2026-03-09' },
  { from: 'c-055', to: 'c-041', type: 'follows', strength: 0.40, lastInteraction: '2026-03-08' },
  { from: 'c-033', to: 'c-041', type: 'co-collects', strength: 0.55, lastInteraction: '2026-03-11' },
  { from: 'c-041', to: 'c-048', type: 'co-collects', strength: 0.62, lastInteraction: '2026-03-10' },

  // Card show connections
  { from: 'c-052', to: 'c-031', type: 'traded', strength: 0.78, lastInteraction: '2026-03-12' },
  { from: 'c-052', to: 'c-004', type: 'traded', strength: 0.65, lastInteraction: '2026-03-06' },
  { from: 'c-052', to: 'c-012', type: 'co-collects', strength: 0.70, lastInteraction: '2026-03-09' },

  // Cross-sport connections
  { from: 'c-023', to: 'c-013', type: 'follows', strength: 0.55, lastInteraction: '2026-03-10' },
  { from: 'c-024', to: 'c-014', type: 'follows', strength: 0.50, lastInteraction: '2026-03-09' },
  { from: 'c-023', to: 'c-024', type: 'co-collects', strength: 0.45, lastInteraction: '2026-03-07' },

  // Grading community extended
  { from: 'c-020', to: 'c-016', type: 'follows', strength: 0.75, lastInteraction: '2026-03-13' },
  { from: 'c-020', to: 'c-046', type: 'co-collects', strength: 0.70, lastInteraction: '2026-03-11' },
  { from: 'c-042', to: 'c-045', type: 'co-collects', strength: 0.68, lastInteraction: '2026-03-10' },
  { from: 'c-042', to: 'c-013', type: 'follows', strength: 0.62, lastInteraction: '2026-03-09' },

  // Rivalry edges
  { from: 'c-001', to: 'c-054', type: 'rival', strength: 0.40, lastInteraction: '2026-03-08' },
  { from: 'c-007', to: 'c-025', type: 'rival', strength: 0.52, lastInteraction: '2026-03-06' },
  { from: 'c-005', to: 'c-039', type: 'rival', strength: 0.38, lastInteraction: '2026-03-04' },

  // Additional density edges
  { from: 'c-010', to: 'c-001', type: 'follows', strength: 0.83, lastInteraction: '2026-03-14' },
  { from: 'c-006', to: 'c-003', type: 'follows', strength: 0.79, lastInteraction: '2026-03-13' },
  { from: 'c-011', to: 'c-002', type: 'follows', strength: 0.81, lastInteraction: '2026-03-14' },
  { from: 'c-016', to: 'c-054', type: 'follows', strength: 0.76, lastInteraction: '2026-03-12' },
  { from: 'c-021', to: 'c-001', type: 'follows', strength: 0.74, lastInteraction: '2026-03-11' },
  { from: 'c-025', to: 'c-003', type: 'traded', strength: 0.68, lastInteraction: '2026-03-09' },
  { from: 'c-032', to: 'c-054', type: 'follows', strength: 0.82, lastInteraction: '2026-03-14' },
  { from: 'c-035', to: 'c-002', type: 'follows', strength: 0.70, lastInteraction: '2026-03-10' },
  { from: 'c-040', to: 'c-001', type: 'follows', strength: 0.77, lastInteraction: '2026-03-13' },
  { from: 'c-042', to: 'c-005', type: 'follows', strength: 0.65, lastInteraction: '2026-03-08' },
  { from: 'c-045', to: 'c-001', type: 'follows', strength: 0.72, lastInteraction: '2026-03-12' },
  { from: 'c-009', to: 'c-039', type: 'traded', strength: 0.60, lastInteraction: '2026-03-05' },
  { from: 'c-012', to: 'c-050', type: 'co-collects', strength: 0.75, lastInteraction: '2026-03-11' },
  { from: 'c-015', to: 'c-011', type: 'traded', strength: 0.58, lastInteraction: '2026-03-03' },
  { from: 'c-034', to: 'c-032', type: 'follows', strength: 0.72, lastInteraction: '2026-03-12' },
  { from: 'c-038', to: 'c-051', type: 'co-collects', strength: 0.80, lastInteraction: '2026-03-13' },
  { from: 'c-046', to: 'c-020', type: 'traded', strength: 0.65, lastInteraction: '2026-03-07' },
  { from: 'c-048', to: 'c-012', type: 'follows', strength: 0.72, lastInteraction: '2026-03-10' },
  { from: 'c-049', to: 'c-039', type: 'traded', strength: 0.58, lastInteraction: '2026-03-04' },
  { from: 'c-051', to: 'c-002', type: 'follows', strength: 0.76, lastInteraction: '2026-03-13' },
  { from: 'c-053', to: 'c-007', type: 'follows', strength: 0.62, lastInteraction: '2026-03-11' },
];

// ---- Mock Data: Herd Signals (12 signals) ----

const herdSignals: HerdSignal[] = [
  { id: 'hs-001', type: 'accumulation', detectedAt: '2026-03-14T18:30:00Z', participants: ['c-001', 'c-003', 'c-025', 'c-040', 'c-054', 'c-032'], targetCard: '2025 Panini Prizm Silver Cooper Flagg RC', magnitude: 92, phase: 'early' },
  { id: 'hs-002', type: 'FOMO', detectedAt: '2026-03-14T14:15:00Z', participants: ['c-013', 'c-017', 'c-030', 'c-042', 'c-045', 'c-036', 'c-019', 'c-021'], targetCard: '2025 Topps Chrome Wembanyama Gold /50', magnitude: 88, phase: 'peak' },
  { id: 'hs-003', type: 'distribution', detectedAt: '2026-03-13T22:00:00Z', participants: ['c-007', 'c-043', 'c-053', 'c-031'], targetCard: '2024 Panini Select Caleb Williams Concourse', magnitude: 65, phase: 'late' },
  { id: 'hs-004', type: 'accumulation', detectedAt: '2026-03-13T10:45:00Z', participants: ['c-002', 'c-014', 'c-038', 'c-051'], targetCard: '2025 Bowman 1st Edition Bryce Harper Auto', magnitude: 78, phase: 'early' },
  { id: 'hs-005', type: 'panic-sell', detectedAt: '2026-03-12T16:20:00Z', participants: ['c-029', 'c-033', 'c-043', 'c-049', 'c-055'], targetCard: '2024 Topps Chrome Black CJ Stroud /199', magnitude: 71, phase: 'peak' },
  { id: 'hs-006', type: 'FOMO', detectedAt: '2026-03-12T09:00:00Z', participants: ['c-005', 'c-019', 'c-049', 'c-006', 'c-028', 'c-042'], targetCard: '2025 Prizm FOTL Exclusive Rookie Lot', magnitude: 84, phase: 'early' },
  { id: 'hs-007', type: 'accumulation', detectedAt: '2026-03-11T20:30:00Z', participants: ['c-004', 'c-012', 'c-048', 'c-050'], targetCard: '1986 Fleer Michael Jordan RC PSA 9', magnitude: 95, phase: 'peak' },
  { id: 'hs-008', type: 'distribution', detectedAt: '2026-03-11T11:00:00Z', participants: ['c-007', 'c-031', 'c-043'], targetCard: '2024 Donruss Optic Jayden Daniels Rated Rookie', magnitude: 55, phase: 'late' },
  { id: 'hs-009', type: 'FOMO', detectedAt: '2026-03-10T15:45:00Z', participants: ['c-013', 'c-030', 'c-036', 'c-045', 'c-017', 'c-042', 'c-021'], targetCard: '2025 Panini National Treasures Wemby RPA /99', magnitude: 91, phase: 'early' },
  { id: 'hs-010', type: 'panic-sell', detectedAt: '2026-03-09T08:30:00Z', participants: ['c-022', 'c-033', 'c-041', 'c-055', 'c-026'], targetCard: '2023 Topps Chrome Update Elly De La Cruz RC', magnitude: 58, phase: 'late' },
  { id: 'hs-011', type: 'accumulation', detectedAt: '2026-03-08T19:00:00Z', participants: ['c-010', 'c-009', 'c-034', 'c-032', 'c-054'], targetCard: '2024 Flawless LeBron James Patch Auto /25', magnitude: 87, phase: 'early' },
  { id: 'hs-012', type: 'distribution', detectedAt: '2026-03-07T13:15:00Z', participants: ['c-015', 'c-037', 'c-028'], targetCard: '2024 Bowman Chrome Roki Sasaki 1st /250', magnitude: 62, phase: 'peak' },
];

// ---- Mock Data: Influencer Alerts (18 alerts) ----

const influencerAlerts: InfluencerAlert[] = [
  { influencerId: 'c-001', action: 'bought', card: '2025 Panini Prizm Silver Cooper Flagg RC #201', timestamp: '2026-03-14T17:45:00Z', marketImpactPercent: 14.2, followerReactionTime: 8 },
  { influencerId: 'c-054', action: 'bought', card: '2025 National Treasures Wemby 1/1 Logoman', timestamp: '2026-03-14T16:30:00Z', marketImpactPercent: 22.8, followerReactionTime: 5 },
  { influencerId: 'c-003', action: 'graded', card: '2003 Topps Chrome LeBron James RC - PSA 10', timestamp: '2026-03-14T14:00:00Z', marketImpactPercent: 8.5, followerReactionTime: 15 },
  { influencerId: 'c-005', action: 'listed', card: '2024 Prizm FOTL Box Break Lot (12 boxes)', timestamp: '2026-03-14T12:15:00Z', marketImpactPercent: -3.2, followerReactionTime: 12 },
  { influencerId: 'c-039', action: 'bought', card: '2025 Topps Series 1 Case (20 hobby boxes)', timestamp: '2026-03-14T10:00:00Z', marketImpactPercent: 6.8, followerReactionTime: 20 },
  { influencerId: 'c-002', action: 'sold', card: '2024 Panini Select Caleb Williams Tie-Dye /25', timestamp: '2026-03-13T22:30:00Z', marketImpactPercent: -11.5, followerReactionTime: 10 },
  { influencerId: 'c-001', action: 'graded', card: '1986 Fleer Michael Jordan RC - BGS 9.5', timestamp: '2026-03-13T19:00:00Z', marketImpactPercent: 5.3, followerReactionTime: 18 },
  { influencerId: 'c-054', action: 'sold', card: '2024 Topps Chrome Superfractor Elly De La Cruz 1/1', timestamp: '2026-03-13T15:45:00Z', marketImpactPercent: -18.4, followerReactionTime: 6 },
  { influencerId: 'c-004', action: 'bought', card: '1952 Topps Mickey Mantle #311 PSA 5', timestamp: '2026-03-13T11:20:00Z', marketImpactPercent: 4.1, followerReactionTime: 35 },
  { influencerId: 'c-003', action: 'bought', card: '2025 Bowman 1st Chrome Cooper Flagg Auto PSA 10', timestamp: '2026-03-12T20:00:00Z', marketImpactPercent: 16.7, followerReactionTime: 9 },
  { influencerId: 'c-005', action: 'bought', card: '2025 Panini Prizm Hobby Box Case (12 boxes)', timestamp: '2026-03-12T16:30:00Z', marketImpactPercent: 7.9, followerReactionTime: 14 },
  { influencerId: 'c-025', action: 'bought', card: '2024 Flawless LeBron James Patch Auto /25', timestamp: '2026-03-12T13:00:00Z', marketImpactPercent: 9.3, followerReactionTime: 22 },
  { influencerId: 'c-039', action: 'sold', card: '2023 Optic Jayden Daniels Rated Rookie Lot (50)', timestamp: '2026-03-12T09:15:00Z', marketImpactPercent: -8.7, followerReactionTime: 16 },
  { influencerId: 'c-002', action: 'bought', card: '2025 Bowman 1st Bryce Harper Auto Orange /25', timestamp: '2026-03-11T21:00:00Z', marketImpactPercent: 12.1, followerReactionTime: 11 },
  { influencerId: 'c-001', action: 'listed', card: '2020 Prizm Joe Burrow Silver PSA 10', timestamp: '2026-03-11T14:30:00Z', marketImpactPercent: -6.4, followerReactionTime: 7 },
  { influencerId: 'c-054', action: 'graded', card: '2025 Panini Flawless Cooper Flagg RPA 1/1 - BGS 9.5', timestamp: '2026-03-10T18:00:00Z', marketImpactPercent: 19.6, followerReactionTime: 4 },
  { influencerId: 'c-003', action: 'sold', card: '2024 Topps Chrome Black CJ Stroud Auto /199', timestamp: '2026-03-10T12:00:00Z', marketImpactPercent: -13.2, followerReactionTime: 13 },
  { influencerId: 'c-005', action: 'bought', card: '2025 Topps Chrome Hobby Case (12 boxes)', timestamp: '2026-03-09T15:00:00Z', marketImpactPercent: 5.5, followerReactionTime: 19 },
];

// ---- Mock Data: Trend Adoption Curves (10 trends) ----

function generateSCurve(phase: AdoptionPhase, noiseScale = 3): { day: number; adoption: number }[] {
  const points: { day: number; adoption: number }[] = [];
  const maxDay = 90;
  const phaseOffsets: Record<AdoptionPhase, number> = {
    'innovator': 0.08,
    'early-adopter': 0.22,
    'early-majority': 0.50,
    'late-majority': 0.75,
    'laggard': 0.92,
  };
  const currentProgress = phaseOffsets[phase];
  const midpoint = 45;
  const steepness = 0.1;
  for (let day = 0; day <= maxDay; day++) {
    const raw = 100 / (1 + Math.exp(-steepness * (day - midpoint)));
    const capped = day / maxDay <= currentProgress ? raw : null;
    if (capped !== null) {
      const noise = (Math.sin(day * 1.7) * noiseScale);
      points.push({ day, adoption: Math.max(0, Math.min(100, Math.round(capped + noise))) });
    }
  }
  return points;
}

const trendAdoptionCurves: TrendAdoptionCurve[] = [
  { trendId: 'tr-001', name: 'Cooper Flagg Rookies', phase: 'early-adopter', adoptionPercent: 24, velocity: 2.8, projectedPeak: '2026-06-15', dataPoints: generateSCurve('early-adopter') },
  { trendId: 'tr-002', name: 'Wembanyama 2nd Year', phase: 'early-majority', adoptionPercent: 52, velocity: 1.4, projectedPeak: '2026-04-20', dataPoints: generateSCurve('early-majority') },
  { trendId: 'tr-003', name: 'Vintage Tobacco Revival', phase: 'innovator', adoptionPercent: 6, velocity: 0.5, projectedPeak: '2027-01-10', dataPoints: generateSCurve('innovator') },
  { trendId: 'tr-004', name: 'Soccer Card Crossover', phase: 'early-majority', adoptionPercent: 48, velocity: 1.8, projectedPeak: '2026-05-01', dataPoints: generateSCurve('early-majority', 4) },
  { trendId: 'tr-005', name: 'PSA 10 Pop Report Plays', phase: 'late-majority', adoptionPercent: 78, velocity: 0.6, projectedPeak: '2026-03-01', dataPoints: generateSCurve('late-majority') },
  { trendId: 'tr-006', name: 'AI-Graded Cards', phase: 'innovator', adoptionPercent: 3, velocity: 0.3, projectedPeak: '2027-06-01', dataPoints: generateSCurve('innovator', 2) },
  { trendId: 'tr-007', name: 'FOTL Box Flipping', phase: 'late-majority', adoptionPercent: 72, velocity: 0.4, projectedPeak: '2026-02-15', dataPoints: generateSCurve('late-majority') },
  { trendId: 'tr-008', name: 'Patch Card Premium', phase: 'early-adopter', adoptionPercent: 18, velocity: 2.2, projectedPeak: '2026-07-10', dataPoints: generateSCurve('early-adopter', 4) },
  { trendId: 'tr-009', name: 'Draft Class Speculation', phase: 'early-majority', adoptionPercent: 44, velocity: 3.1, projectedPeak: '2026-04-28', dataPoints: generateSCurve('early-majority') },
  { trendId: 'tr-010', name: 'Junk Wax Nostalgia', phase: 'laggard', adoptionPercent: 91, velocity: 0.1, projectedPeak: '2025-12-01', dataPoints: generateSCurve('laggard') },
];

// ---- Mock Data: Community Clusters (10 clusters) ----

const communityClusters: CommunityCluster[] = [
  { id: 'cl-001', name: 'Whale Watch Alliance', members: ['c-001', 'c-003', 'c-004', 'c-012', 'c-018', 'c-050', 'c-054'], avgReputation: 94, specialty: 'High-Value Investments', avgPortfolioValue: 2034285, activityLevel: 'high' },
  { id: 'cl-002', name: 'Basketball Addicts', members: ['c-001', 'c-013', 'c-017', 'c-030', 'c-036', 'c-045', 'c-042'], avgReputation: 80, specialty: 'Basketball Cards', avgPortfolioValue: 581428, activityLevel: 'high' },
  { id: 'cl-003', name: 'Football Fanatics', members: ['c-002', 'c-014', 'c-018', 'c-038', 'c-051'], avgReputation: 83, specialty: 'Football Rookies & Parallels', avgPortfolioValue: 594000, activityLevel: 'medium' },
  { id: 'cl-004', name: 'Grading Gurus', members: ['c-003', 'c-016', 'c-020', 'c-046', 'c-047'], avgReputation: 87, specialty: 'PSA & BGS Graded Cards', avgPortfolioValue: 654000, activityLevel: 'high' },
  { id: 'cl-005', name: 'Box Break Brigade', members: ['c-005', 'c-019', 'c-049', 'c-039'], avgReputation: 81, specialty: 'Box Breaks & Ripping', avgPortfolioValue: 557500, activityLevel: 'high' },
  { id: 'cl-006', name: 'Flip & Trade Syndicate', members: ['c-007', 'c-031', 'c-043', 'c-053'], avgReputation: 68, specialty: 'Short-Term Trading', avgPortfolioValue: 122000, activityLevel: 'high' },
  { id: 'cl-007', name: 'Vintage Vault Society', members: ['c-004', 'c-012', 'c-041', 'c-048', 'c-050'], avgReputation: 85, specialty: 'Pre-2000 Vintage Cards', avgPortfolioValue: 873000, activityLevel: 'low' },
  { id: 'cl-008', name: 'Prospect Pipeline', members: ['c-011', 'c-015', 'c-035', 'c-037'], avgReputation: 79, specialty: 'Prospects & Bowman 1st', avgPortfolioValue: 282500, activityLevel: 'medium' },
  { id: 'cl-009', name: 'Investment Club', members: ['c-025', 'c-040', 'c-032', 'c-054'], avgReputation: 87, specialty: 'Portfolio Strategy & Blue Chips', avgPortfolioValue: 1237500, activityLevel: 'medium' },
  { id: 'cl-010', name: 'Budget Builders', members: ['c-026', 'c-027', 'c-033', 'c-055', 'c-022'], avgReputation: 52, specialty: 'Budget & Casual Collecting', avgPortfolioValue: 28340, activityLevel: 'low' },
];

// ---- Service Functions ----

export function getCollectorGraph(): { nodes: CollectorNode[]; edges: SocialEdge[] } {
  return { nodes: collectorNodes, edges: socialEdges };
}

export function getCollectorProfile(id: string): CollectorNode | undefined {
  return collectorNodes.find(n => n.id === id);
}

export function getInfluencerLeaderboard(): CollectorNode[] {
  return [...collectorNodes]
    .sort((a, b) => b.influenceScore - a.influenceScore)
    .slice(0, 20);
}

export function getHerdSignals(): HerdSignal[] {
  return [...herdSignals].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
}

export function getTrendAdoptionCurve(trendId: string): TrendAdoptionCurve | undefined {
  return trendAdoptionCurves.find(t => t.trendId === trendId);
}

export function getAllTrendAdoptionCurves(): TrendAdoptionCurve[] {
  return trendAdoptionCurves;
}

export function getCommunityCluster(id: string): CommunityCluster | undefined {
  return communityClusters.find(c => c.id === id);
}

export function getAllCommunityClusters(): CommunityCluster[] {
  return communityClusters;
}

export function getInfluencerAlerts(): InfluencerAlert[] {
  return [...influencerAlerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getCollectorPath(fromId: string, toId: string): CollectorPath | null {
  // BFS shortest path through the social graph
  const adjacency: Record<string, { neighbor: string; edgeType: EdgeType; strength: number }[]> = {};
  for (const edge of socialEdges) {
    if (!adjacency[edge.from]) adjacency[edge.from] = [];
    adjacency[edge.from].push({ neighbor: edge.to, edgeType: edge.type, strength: edge.strength });
    // treat edges as bidirectional for pathfinding
    if (!adjacency[edge.to]) adjacency[edge.to] = [];
    adjacency[edge.to].push({ neighbor: edge.from, edgeType: edge.type, strength: edge.strength });
  }

  if (!adjacency[fromId] || !adjacency[toId]) return null;

  const visited = new Set<string>();
  const queue: { node: string; path: string[]; edgeTypes: EdgeType[]; totalStrength: number }[] = [
    { node: fromId, path: [fromId], edgeTypes: [], totalStrength: 0 },
  ];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.node === toId) {
      return {
        nodes: current.path,
        edgeTypes: current.edgeTypes,
        totalStrength: current.edgeTypes.length > 0
          ? current.totalStrength / current.edgeTypes.length
          : 0,
        degrees: current.path.length - 1,
      };
    }
    const neighbors = adjacency[current.node] || [];
    for (const { neighbor, edgeType, strength } of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          node: neighbor,
          path: [...current.path, neighbor],
          edgeTypes: [...current.edgeTypes, edgeType],
          totalStrength: current.totalStrength + strength,
        });
      }
    }
  }

  return null;
}

export function getMarketMomentum(): MarketMomentum {
  return {
    overall: 34,
    sentiment: 'bullish',
    topMovers: [
      { card: '2025 Prizm Cooper Flagg Silver RC', change: 42.5 },
      { card: '2025 NT Wemby RPA /99', change: 28.3 },
      { card: '2024 Flawless LeBron Patch Auto /25', change: 18.7 },
      { card: '1986 Fleer Jordan RC PSA 9', change: 12.1 },
      { card: '2025 Bowman 1st Bryce Harper Auto', change: 9.8 },
      { card: '2024 Topps Chrome CJ Stroud Auto', change: -15.4 },
      { card: '2024 Select Caleb Williams Tie-Dye /25', change: -22.1 },
      { card: '2023 Chrome Elly De La Cruz RC', change: -8.6 },
    ],
    volumeChange: 18.4,
    activeTraders24h: 1247,
  };
}

export function getNodeEdges(nodeId: string): SocialEdge[] {
  return socialEdges.filter(e => e.from === nodeId || e.to === nodeId);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}
