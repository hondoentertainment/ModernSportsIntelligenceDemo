// Phase 158 – Real-Time Auction Sniper & Alert System Service

// ---- Types ----

export type AuctionPlatform = 'ebay' | 'heritage' | 'goldin' | 'pwcc' | 'comc' | 'whatnot' | 'lelands' | 'scp' | 'eBay' | 'Goldin' | 'Heritage' | 'PWCC' | 'MySlabs';

export interface LiveAuction {
  id: string;
  platform: AuctionPlatform;
  title: string;
  cardName: string;
  sport: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  timeRemaining: number; // seconds
  endTime: string;
  estimatedFinalPrice: number;
  estimatedValue: number;
  watchers: number;
  seller: string;
  sellerRating: number;
  hasImage: boolean;
  featured: boolean;
  potentialSavings: number;
  itemName: string;
}

export interface BidRecommendation {
  id: string;
  auctionId: string;
  auctionTitle: string;
  cardName: string;
  platform: AuctionPlatform;
  currentBid: number;
  maxBidSuggestion: number;
  recommendedMaxBid: number;
  estimatedValue: number;
  compAvgPrice: number;
  compCount: number;
  confidence: number;
  reasoning: string;
  valueRating: number;
  action: string;
  timeRemaining: string;
}

export interface SniperAlert {
  id: string;
  auctionId: string;
  auctionTitle: string;
  cardName: string;
  platform: AuctionPlatform;
  currentBid: number;
  currentPrice: number;
  marketValue: number;
  discount: number;
  timeRemaining: number;
  alertType: string;
  urgency: string;
  priority: string;
  triggerReason: string;
  message: string;
}

export interface AuctionHistory {
  id: string;
  cardName: string;
  platform: AuctionPlatform;
  finalPrice: number;
  bidCount: number;
  date: string;
  grade: string;
  seller: string;
}

export interface BidStrategyGuide {
  id: string;
  name: string;
  description: string;
  optimalSnipeTime: number; // seconds before end
  successRate: number;
  avgWinRate: number;
  avgSavings: number;
  bestFor: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WatchedAuction {
  id: string;
  auctionId: string;
  title: string;
  cardName: string;
  platform: AuctionPlatform;
  currentBid: number;
  maxBid: number;
  priceAlert: number;
  addedDate: string;
  timeRemaining: number;
  status: string;
  notes: string;
}

export interface PriceAlert {
  id: string;
  cardName: string;
  maxPrice: number;
  platform: AuctionPlatform | 'all';
  active: boolean;
  triggeredCount: number;
  lastTriggered: string | null;
}

export interface EndingSoon {
  id: string;
  auctionId: string;
  cardName: string;
  platform: AuctionPlatform;
  currentBid: number;
  timeRemaining: number;
  bidCount: number;
  estimatedFinal: number;
  isUndervalue: boolean;
}

export interface BidAnalysis {
  auctionId: string;
  bidHistory: { time: number; amount: number; bidder: string }[];
  avgBidIncrement: number;
  sniperActivity: boolean;
  projectedFinal: number;
  competitorCount: number;
}

export interface AuctionStats {
  platform: AuctionPlatform;
  totalActive: number;
  avgFinalPrice: number;
  avgBidCount: number;
  sniperSuccessRate: number;
  peakBiddingHour: number;
  avgListingDuration: number;
}

export interface CompetitorBidder {
  username: string;
  platform: AuctionPlatform;
  bidCount: number;
  winRate: number;
  avgSpend: number;
  preferredCategories: string[];
  sniperBehavior: boolean;
  lastActive: string;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_auction_sniper';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ---- Mock Data ----

const _RAW_LIVE_AUCTIONS = [
  { id: 'la_001', platform: 'ebay', title: '2024 Topps Chrome Paul Skenes RC Auto /99 PSA 10', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', sport: 'Baseball', currentBid: 1250, startingBid: 500, bidCount: 18, timeRemaining: 3600, endTime: '2026-03-15T18:00:00Z', estimatedFinalPrice: 1800, watchers: 45, seller: 'cardvault_premium', sellerRating: 99.8, hasImage: true, featured: true },
  { id: 'la_002', platform: 'heritage', title: '1952 Topps Mickey Mantle #311 PSA 4', cardName: '1952 Topps Mickey Mantle #311', sport: 'Baseball', currentBid: 85000, startingBid: 50000, bidCount: 32, timeRemaining: 7200, endTime: '2026-03-15T19:00:00Z', estimatedFinalPrice: 120000, watchers: 210, seller: 'Heritage Auctions', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_003', platform: 'goldin', title: '2023 National Treasures Victor Wembanyama RPA /49 BGS 9.5', cardName: '2023 National Treasures Wembanyama RPA /49', sport: 'Basketball', currentBid: 15000, startingBid: 8000, bidCount: 24, timeRemaining: 5400, endTime: '2026-03-15T18:30:00Z', estimatedFinalPrice: 22000, watchers: 120, seller: 'Goldin Auctions', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_004', platform: 'ebay', title: '2024 Bowman Chrome 1st Jackson Holliday Auto PSA 10', cardName: '2024 Bowman Chrome 1st Jackson Holliday Auto', sport: 'Baseball', currentBid: 420, startingBid: 200, bidCount: 14, timeRemaining: 1800, endTime: '2026-03-15T17:30:00Z', estimatedFinalPrice: 600, watchers: 28, seller: 'diamond_cuts_cards', sellerRating: 99.5, hasImage: true, featured: false },
  { id: 'la_005', platform: 'pwcc', title: '1986 Fleer Michael Jordan RC #57 PSA 8', cardName: '1986 Fleer Michael Jordan RC #57', sport: 'Basketball', currentBid: 18500, startingBid: 15000, bidCount: 12, timeRemaining: 14400, endTime: '2026-03-15T21:00:00Z', estimatedFinalPrice: 25000, watchers: 85, seller: 'PWCC Marketplace', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_006', platform: 'ebay', title: '2024 Panini Prizm Caleb Williams RC Silver /299 PSA 10', cardName: '2024 Panini Prizm Caleb Williams RC Silver', sport: 'Football', currentBid: 380, startingBid: 150, bidCount: 22, timeRemaining: 900, endTime: '2026-03-15T17:15:00Z', estimatedFinalPrice: 500, watchers: 35, seller: 'gridiron_gems', sellerRating: 99.2, hasImage: true, featured: false },
  { id: 'la_007', platform: 'whatnot', title: '2023 Topps Chrome Elly De La Cruz RC Auto Refractor', cardName: '2023 Topps Chrome Elly De La Cruz RC Auto Refractor', sport: 'Baseball', currentBid: 850, startingBid: 400, bidCount: 16, timeRemaining: 600, endTime: '2026-03-15T17:10:00Z', estimatedFinalPrice: 1100, watchers: 55, seller: 'live_breaks_daily', sellerRating: 98.5, hasImage: true, featured: false },
  { id: 'la_008', platform: 'heritage', title: '1933 Goudey Babe Ruth #53 SGC 3', cardName: '1933 Goudey Babe Ruth #53', sport: 'Baseball', currentBid: 45000, startingBid: 25000, bidCount: 28, timeRemaining: 86400, endTime: '2026-03-16T17:00:00Z', estimatedFinalPrice: 65000, watchers: 175, seller: 'Heritage Auctions', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_009', platform: 'goldin', title: '2022 Panini Flawless Luka Doncic Patch Auto /25 BGS 9', cardName: '2022 Panini Flawless Luka Doncic Patch Auto /25', sport: 'Basketball', currentBid: 8500, startingBid: 5000, bidCount: 19, timeRemaining: 10800, endTime: '2026-03-15T20:00:00Z', estimatedFinalPrice: 12000, watchers: 72, seller: 'Goldin Auctions', sellerRating: 100, hasImage: true, featured: false },
  { id: 'la_010', platform: 'ebay', title: '2024 Upper Deck Connor Bedard Young Guns RC PSA 10', cardName: '2024 Upper Deck Connor Bedard Young Guns RC', sport: 'Hockey', currentBid: 280, startingBid: 100, bidCount: 25, timeRemaining: 2400, endTime: '2026-03-15T17:40:00Z', estimatedFinalPrice: 400, watchers: 42, seller: 'puck_collector_99', sellerRating: 99.0, hasImage: true, featured: false },
  { id: 'la_011', platform: 'comc', title: '2023 Prizm Silver Victor Wembanyama RC PSA 10', cardName: '2023 Prizm Silver Victor Wembanyama RC', sport: 'Basketball', currentBid: 650, startingBid: 400, bidCount: 11, timeRemaining: 4200, endTime: '2026-03-15T18:10:00Z', estimatedFinalPrice: 850, watchers: 38, seller: 'COMC_Featured', sellerRating: 99.9, hasImage: true, featured: false },
  { id: 'la_012', platform: 'lelands', title: '1955 Topps Roberto Clemente RC #164 PSA 5', cardName: '1955 Topps Roberto Clemente RC #164', sport: 'Baseball', currentBid: 22000, startingBid: 15000, bidCount: 15, timeRemaining: 172800, endTime: '2026-03-17T17:00:00Z', estimatedFinalPrice: 35000, watchers: 95, seller: 'Lelands Auctions', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_013', platform: 'ebay', title: '2025 Bowman Chrome 1st Ethan Salas Auto /150 PSA 10', cardName: '2025 Bowman Chrome 1st Ethan Salas Auto /150', sport: 'Baseball', currentBid: 520, startingBid: 250, bidCount: 20, timeRemaining: 1200, endTime: '2026-03-15T17:20:00Z', estimatedFinalPrice: 750, watchers: 33, seller: 'prospect_kings', sellerRating: 99.1, hasImage: true, featured: false },
  { id: 'la_014', platform: 'scp', title: '1969 Topps Reggie Jackson RC #260 PSA 7', cardName: '1969 Topps Reggie Jackson RC #260', sport: 'Baseball', currentBid: 3200, startingBid: 2000, bidCount: 10, timeRemaining: 259200, endTime: '2026-03-18T17:00:00Z', estimatedFinalPrice: 4500, watchers: 48, seller: 'SCP Auctions', sellerRating: 100, hasImage: true, featured: false },
  { id: 'la_015', platform: 'pwcc', title: '2022 Topps Chrome Julio Rodriguez RC Auto Gold /50 PSA 10', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto Gold /50', sport: 'Baseball', currentBid: 5800, startingBid: 3000, bidCount: 17, timeRemaining: 21600, endTime: '2026-03-15T23:00:00Z', estimatedFinalPrice: 8000, watchers: 62, seller: 'PWCC Marketplace', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_016', platform: 'ebay', title: '2024 Panini Prizm Jayden Daniels RC Silver PSA 10', cardName: '2024 Panini Prizm Jayden Daniels RC Silver', sport: 'Football', currentBid: 185, startingBid: 80, bidCount: 15, timeRemaining: 3000, endTime: '2026-03-15T17:50:00Z', estimatedFinalPrice: 275, watchers: 22, seller: 'football_first_cards', sellerRating: 98.8, hasImage: true, featured: false },
  { id: 'la_017', platform: 'goldin', title: '2021 National Treasures Trevor Lawrence RPA /99 BGS 9', cardName: '2021 National Treasures Trevor Lawrence RPA /99', sport: 'Football', currentBid: 3200, startingBid: 2000, bidCount: 13, timeRemaining: 43200, endTime: '2026-03-16T05:00:00Z', estimatedFinalPrice: 4800, watchers: 55, seller: 'Goldin Auctions', sellerRating: 100, hasImage: true, featured: false },
  { id: 'la_018', platform: 'whatnot', title: '2023 Bowman Chrome 1st Jackson Chourio Auto Refractor', cardName: '2023 Bowman Chrome 1st Jackson Chourio Auto Refractor', sport: 'Baseball', currentBid: 320, startingBid: 150, bidCount: 12, timeRemaining: 450, endTime: '2026-03-15T17:07:30Z', estimatedFinalPrice: 500, watchers: 28, seller: 'rip_city_breaks', sellerRating: 97.5, hasImage: true, featured: false },
  { id: 'la_019', platform: 'ebay', title: '2023 Upper Deck Connor McDavid Canvas Young Guns PSA 10', cardName: '2023 Upper Deck Connor McDavid Canvas Young Guns', sport: 'Hockey', currentBid: 150, startingBid: 50, bidCount: 18, timeRemaining: 5400, endTime: '2026-03-15T18:30:00Z', estimatedFinalPrice: 220, watchers: 19, seller: 'hockey_haven_cards', sellerRating: 99.3, hasImage: true, featured: false },
  { id: 'la_020', platform: 'heritage', title: '2009 Bowman Chrome Mike Trout Auto RC BGS 9.5', cardName: '2009 Bowman Chrome Mike Trout Auto RC', sport: 'Baseball', currentBid: 95000, startingBid: 60000, bidCount: 35, timeRemaining: 36000, endTime: '2026-03-16T03:00:00Z', estimatedFinalPrice: 140000, watchers: 280, seller: 'Heritage Auctions', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_021', platform: 'ebay', title: '2024 Topps Chrome Shohei Ohtani Dodgers RC PSA 10', cardName: '2024 Topps Chrome Shohei Ohtani Dodgers RC', sport: 'Baseball', currentBid: 95, startingBid: 30, bidCount: 28, timeRemaining: 1500, endTime: '2026-03-15T17:25:00Z', estimatedFinalPrice: 145, watchers: 52, seller: 'west_coast_cards', sellerRating: 99.6, hasImage: true, featured: false },
  { id: 'la_022', platform: 'comc', title: '2023 Select Concourse Patrick Mahomes Silver /199 PSA 10', cardName: '2023 Select Concourse Patrick Mahomes Silver /199', sport: 'Football', currentBid: 125, startingBid: 60, bidCount: 9, timeRemaining: 7800, endTime: '2026-03-15T19:10:00Z', estimatedFinalPrice: 180, watchers: 15, seller: 'COMC_Vault', sellerRating: 99.9, hasImage: true, featured: false },
  { id: 'la_023', platform: 'ebay', title: '2025 Topps Chrome Gunnar Henderson Refractor Auto /499 PSA 10', cardName: '2025 Topps Chrome Gunnar Henderson Refractor Auto /499', sport: 'Baseball', currentBid: 340, startingBid: 150, bidCount: 16, timeRemaining: 4800, endTime: '2026-03-15T18:20:00Z', estimatedFinalPrice: 500, watchers: 30, seller: 'chrome_chasers', sellerRating: 99.4, hasImage: true, featured: false },
  { id: 'la_024', platform: 'pwcc', title: '1993 SP Foil Derek Jeter RC #279 PSA 9', cardName: '1993 SP Foil Derek Jeter RC #279', sport: 'Baseball', currentBid: 12500, startingBid: 8000, bidCount: 14, timeRemaining: 28800, endTime: '2026-03-16T01:00:00Z', estimatedFinalPrice: 18000, watchers: 78, seller: 'PWCC Marketplace', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_025', platform: 'ebay', title: '2024 Prizm Draft Picks Drake Maye RC Silver PSA 10', cardName: '2024 Prizm Draft Picks Drake Maye RC Silver', sport: 'Football', currentBid: 65, startingBid: 25, bidCount: 12, timeRemaining: 2100, endTime: '2026-03-15T17:35:00Z', estimatedFinalPrice: 95, watchers: 14, seller: 'rookie_rush_cards', sellerRating: 98.2, hasImage: true, featured: false },
  { id: 'la_026', platform: 'goldin', title: '2018 Topps Chrome Shohei Ohtani RC Auto PSA 10', cardName: '2018 Topps Chrome Shohei Ohtani RC Auto', sport: 'Baseball', currentBid: 28000, startingBid: 18000, bidCount: 22, timeRemaining: 57600, endTime: '2026-03-16T09:00:00Z', estimatedFinalPrice: 38000, watchers: 145, seller: 'Goldin Auctions', sellerRating: 100, hasImage: true, featured: true },
  { id: 'la_027', platform: 'ebay', title: '2023 Panini Prizm Chet Holmgren RC Silver PSA 10', cardName: '2023 Panini Prizm Chet Holmgren RC Silver', sport: 'Basketball', currentBid: 75, startingBid: 30, bidCount: 10, timeRemaining: 6600, endTime: '2026-03-15T18:50:00Z', estimatedFinalPrice: 110, watchers: 18, seller: 'thunder_collectors', sellerRating: 98.9, hasImage: true, featured: false },
  { id: 'la_028', platform: 'lelands', title: '1975 Topps George Brett RC #228 PSA 8', cardName: '1975 Topps George Brett RC #228', sport: 'Baseball', currentBid: 4500, startingBid: 3000, bidCount: 11, timeRemaining: 345600, endTime: '2026-03-19T17:00:00Z', estimatedFinalPrice: 6500, watchers: 40, seller: 'Lelands Auctions', sellerRating: 100, hasImage: true, featured: false },
  { id: 'la_029', platform: 'whatnot', title: '2024 Topps Chrome Rookie Auto Mystery Break', cardName: '2024 Topps Chrome Rookie Auto Break', sport: 'Baseball', currentBid: 45, startingBid: 10, bidCount: 35, timeRemaining: 300, endTime: '2026-03-15T17:05:00Z', estimatedFinalPrice: 55, watchers: 85, seller: 'break_nation_live', sellerRating: 97.0, hasImage: true, featured: false },
  { id: 'la_030', platform: 'scp', title: '2011 Topps Update Mike Trout RC #US175 PSA 10', cardName: '2011 Topps Update Mike Trout RC #US175', sport: 'Baseball', currentBid: 42000, startingBid: 30000, bidCount: 20, timeRemaining: 432000, endTime: '2026-03-20T17:00:00Z', estimatedFinalPrice: 55000, watchers: 160, seller: 'SCP Auctions', sellerRating: 100, hasImage: true, featured: true },
] as const;
const LIVE_AUCTIONS: LiveAuction[] = _RAW_LIVE_AUCTIONS.map(a => ({
  ...a,
  estimatedValue: a.estimatedFinalPrice,
  potentialSavings: Math.max(0, a.estimatedFinalPrice - a.currentBid),
  itemName: a.cardName,
}));

const _RAW_BID_RECOMMENDATIONS = [
  { id: 'br_001', auctionId: 'la_001', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', platform: 'ebay', currentBid: 1250, maxBidSuggestion: 1650, compAvgPrice: 1800, compCount: 12, confidence: 'high', reasoning: 'Recent comps average $1,800. Current bid is 30% below market. Strong demand for Skenes autos.', valueRating: 85 },
  { id: 'br_002', auctionId: 'la_004', cardName: '2024 Bowman Chrome 1st Jackson Holliday Auto', platform: 'ebay', currentBid: 420, maxBidSuggestion: 550, compAvgPrice: 620, compCount: 8, confidence: 'medium', reasoning: 'Holliday comps trending down slightly. Bid up to $550 for good value.', valueRating: 72 },
  { id: 'br_003', auctionId: 'la_006', cardName: '2024 Panini Prizm Caleb Williams RC Silver', platform: 'ebay', currentBid: 380, maxBidSuggestion: 450, compAvgPrice: 520, compCount: 15, confidence: 'high', reasoning: 'Williams Silver Prizm PSA 10 consistently sells $480-560. Current bid is well under market.', valueRating: 88 },
  { id: 'br_004', auctionId: 'la_007', cardName: '2023 Topps Chrome Elly De La Cruz RC Auto Refractor', platform: 'whatnot', currentBid: 850, maxBidSuggestion: 1000, compAvgPrice: 1150, compCount: 6, confidence: 'medium', reasoning: 'EDDLC auto refractors are volatile. Recent comps range $900-1,400. Conservative max bid advised.', valueRating: 75 },
  { id: 'br_005', auctionId: 'la_010', cardName: '2024 Upper Deck Connor Bedard Young Guns RC', platform: 'ebay', currentBid: 280, maxBidSuggestion: 360, compAvgPrice: 420, compCount: 20, confidence: 'high', reasoning: 'Bedard YG PSA 10 has strong, stable comps around $400-440. Good buying opportunity.', valueRating: 82 },
  { id: 'br_006', auctionId: 'la_011', cardName: '2023 Prizm Silver Victor Wembanyama RC', platform: 'comc', currentBid: 650, maxBidSuggestion: 780, compAvgPrice: 875, compCount: 18, confidence: 'high', reasoning: 'Wemby Silver PSA 10 comps very consistent at $850-900. COMC often has lower final prices.', valueRating: 80 },
  { id: 'br_007', auctionId: 'la_013', cardName: '2025 Bowman Chrome 1st Ethan Salas Auto /150', platform: 'ebay', currentBid: 520, maxBidSuggestion: 680, compAvgPrice: 780, compCount: 5, confidence: 'medium', reasoning: 'Limited comp data for numbered Salas autos. Prospect risk but high upside.', valueRating: 70 },
  { id: 'br_008', auctionId: 'la_016', cardName: '2024 Panini Prizm Jayden Daniels RC Silver', platform: 'ebay', currentBid: 185, maxBidSuggestion: 240, compAvgPrice: 290, compCount: 14, confidence: 'high', reasoning: 'Daniels hype building with strong rookie season. Silver PSA 10 trending up.', valueRating: 84 },
  { id: 'br_009', auctionId: 'la_019', cardName: '2023 Upper Deck Connor McDavid Canvas Young Guns', platform: 'ebay', currentBid: 150, maxBidSuggestion: 195, compAvgPrice: 230, compCount: 10, confidence: 'medium', reasoning: 'McDavid Canvas variant less liquid than base YG but has collector following.', valueRating: 68 },
  { id: 'br_010', auctionId: 'la_021', cardName: '2024 Topps Chrome Shohei Ohtani Dodgers RC', platform: 'ebay', currentBid: 95, maxBidSuggestion: 125, compAvgPrice: 150, compCount: 30, confidence: 'high', reasoning: 'High volume card with very consistent comps. Strong buy under $130.', valueRating: 90 },
  { id: 'br_011', auctionId: 'la_023', cardName: '2025 Topps Chrome Gunnar Henderson Refractor Auto /499', platform: 'ebay', currentBid: 340, maxBidSuggestion: 450, compAvgPrice: 520, compCount: 7, confidence: 'medium', reasoning: 'Henderson trending up with strong 2025 season. Refractor auto has premium appeal.', valueRating: 76 },
  { id: 'br_012', auctionId: 'la_025', cardName: '2024 Prizm Draft Picks Drake Maye RC Silver', platform: 'ebay', currentBid: 65, maxBidSuggestion: 82, compAvgPrice: 100, compCount: 12, confidence: 'medium', reasoning: 'Maye value tied to on-field performance. Conservative approach recommended.', valueRating: 65 },
  { id: 'br_013', auctionId: 'la_027', cardName: '2023 Panini Prizm Chet Holmgren RC Silver', platform: 'ebay', currentBid: 75, maxBidSuggestion: 95, compAvgPrice: 115, compCount: 16, confidence: 'high', reasoning: 'Holmgren comps stable. Silver PSA 10 is a good long-term hold under $100.', valueRating: 78 },
  { id: 'br_014', auctionId: 'la_003', cardName: '2023 National Treasures Wembanyama RPA /49', platform: 'goldin', currentBid: 15000, maxBidSuggestion: 19500, compAvgPrice: 23000, compCount: 4, confidence: 'medium', reasoning: 'Very limited comp data for /49 RPA. High-end card with significant upside potential.', valueRating: 74 },
  { id: 'br_015', auctionId: 'la_009', cardName: '2022 Panini Flawless Luka Doncic Patch Auto /25', platform: 'goldin', currentBid: 8500, maxBidSuggestion: 10500, compAvgPrice: 12500, compCount: 3, confidence: 'low', reasoning: 'Ultra-premium card with very few comps. Luka market has been volatile.', valueRating: 68 },
  { id: 'br_016', auctionId: 'la_018', cardName: '2023 Bowman Chrome 1st Jackson Chourio Auto Refractor', platform: 'whatnot', currentBid: 320, maxBidSuggestion: 440, compAvgPrice: 520, compCount: 6, confidence: 'medium', reasoning: 'Chourio strong rookie year. Refractor auto comps trending upward.', valueRating: 77 },
  { id: 'br_017', auctionId: 'la_022', cardName: '2023 Select Concourse Patrick Mahomes Silver /199', platform: 'comc', currentBid: 125, maxBidSuggestion: 160, compAvgPrice: 185, compCount: 9, confidence: 'high', reasoning: 'Mahomes Select Silver is a consistent seller. Good value under $165.', valueRating: 82 },
  { id: 'br_018', auctionId: 'la_005', cardName: '1986 Fleer Michael Jordan RC #57', platform: 'pwcc', currentBid: 18500, maxBidSuggestion: 22000, compAvgPrice: 26000, compCount: 15, confidence: 'high', reasoning: 'PSA 8 Jordan RC has deep market with consistent demand. Current bid is attractive.', valueRating: 86 },
  { id: 'br_019', auctionId: 'la_015', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto Gold /50', platform: 'pwcc', currentBid: 5800, maxBidSuggestion: 7200, compAvgPrice: 8500, compCount: 4, confidence: 'medium', reasoning: 'J-Rod Gold /50 is scarce. Limited comps but strong demand for numbered chrome autos.', valueRating: 74 },
  { id: 'br_020', auctionId: 'la_029', cardName: '2024 Topps Chrome Rookie Auto Break', platform: 'whatnot', currentBid: 45, maxBidSuggestion: 50, compAvgPrice: 55, compCount: 50, confidence: 'low', reasoning: 'Mystery break with variable value. Only bid what you can afford to lose.', valueRating: 40 },
] as const;
const _CONF_MAP: Record<string, number> = { high: 85, medium: 65, low: 40 };
const _ACTION_MAP: Record<string, string> = { high: 'bid', medium: 'watch', low: 'skip' };
const BID_RECOMMENDATIONS: BidRecommendation[] = _RAW_BID_RECOMMENDATIONS.map(r => ({
  ...r,
  auctionTitle: r.cardName,
  recommendedMaxBid: r.maxBidSuggestion,
  estimatedValue: r.compAvgPrice,
  confidence: _CONF_MAP[r.confidence] ?? 50,
  action: _ACTION_MAP[r.confidence] ?? 'watch',
  timeRemaining: `${Math.floor(Math.random() * 120 + 5)}m`,
}));

const _RAW_SNIPER_ALERTS = [
  { id: 'sa_001', auctionId: 'la_006', cardName: '2024 Panini Prizm Caleb Williams RC Silver', platform: 'ebay', currentBid: 380, marketValue: 520, discount: 27, timeRemaining: 900, alertType: 'under_market', urgency: 'critical', message: 'Caleb Williams Silver PSA 10 at 27% below market with only 15 min left!' },
  { id: 'sa_002', auctionId: 'la_007', cardName: '2023 Topps Chrome Elly De La Cruz RC Auto Refractor', platform: 'whatnot', currentBid: 850, marketValue: 1150, discount: 26, timeRemaining: 600, alertType: 'ending_soon', urgency: 'critical', message: 'EDDLC Auto Refractor ending in 10 min! Currently 26% under comp average.' },
  { id: 'sa_003', auctionId: 'la_018', cardName: '2023 Bowman Chrome 1st Jackson Chourio Auto Refractor', platform: 'whatnot', currentBid: 320, marketValue: 520, discount: 38, timeRemaining: 450, alertType: 'under_market', urgency: 'critical', message: 'Chourio 1st Auto Refractor at 38% discount! Ending in under 8 minutes.' },
  { id: 'sa_004', auctionId: 'la_021', cardName: '2024 Topps Chrome Shohei Ohtani Dodgers RC', platform: 'ebay', currentBid: 95, marketValue: 150, discount: 37, timeRemaining: 1500, alertType: 'under_market', urgency: 'high', message: 'Ohtani Dodgers Chrome PSA 10 at $95 vs $150 market. 25 min remaining.' },
  { id: 'sa_005', auctionId: 'la_029', cardName: '2024 Topps Chrome Rookie Auto Break', platform: 'whatnot', currentBid: 45, marketValue: 55, discount: 18, timeRemaining: 300, alertType: 'ending_soon', urgency: 'high', message: 'Whatnot break ending in 5 min. Low competition with only 35 bids.' },
  { id: 'sa_006', auctionId: 'la_010', cardName: '2024 Upper Deck Connor Bedard Young Guns RC', platform: 'ebay', currentBid: 280, marketValue: 420, discount: 33, timeRemaining: 2400, alertType: 'under_market', urgency: 'high', message: 'Bedard YG PSA 10 at 33% below market. Good snipe opportunity in 40 min.' },
  { id: 'sa_007', auctionId: 'la_004', cardName: '2024 Bowman Chrome 1st Jackson Holliday Auto', platform: 'ebay', currentBid: 420, marketValue: 620, discount: 32, timeRemaining: 1800, alertType: 'low_competition', urgency: 'medium', message: 'Holliday Auto with only 14 bids and 30 min left. Below average competition.' },
  { id: 'sa_008', auctionId: 'la_011', cardName: '2023 Prizm Silver Victor Wembanyama RC', platform: 'comc', currentBid: 650, marketValue: 875, discount: 26, timeRemaining: 4200, alertType: 'under_market', urgency: 'medium', message: 'Wemby Silver PSA 10 on COMC at 26% below eBay comps.' },
  { id: 'sa_009', auctionId: 'la_025', cardName: '2024 Prizm Draft Picks Drake Maye RC Silver', platform: 'ebay', currentBid: 65, marketValue: 100, discount: 35, timeRemaining: 2100, alertType: 'low_competition', urgency: 'medium', message: 'Maye Silver at $65 with only 12 bids. Low watcher count suggests snipe potential.' },
  { id: 'sa_010', auctionId: 'la_013', cardName: '2025 Bowman Chrome 1st Ethan Salas Auto /150', platform: 'ebay', currentBid: 520, marketValue: 780, discount: 33, timeRemaining: 1200, alertType: 'rare_find', urgency: 'high', message: 'Numbered Salas auto 33% under market. Rare card with limited availability.' },
  { id: 'sa_011', auctionId: 'la_016', cardName: '2024 Panini Prizm Jayden Daniels RC Silver', platform: 'ebay', currentBid: 185, marketValue: 290, discount: 36, timeRemaining: 3000, alertType: 'under_market', urgency: 'medium', message: 'Daniels Silver PSA 10 at 36% below market. Trending up with strong season.' },
  { id: 'sa_012', auctionId: 'la_027', cardName: '2023 Panini Prizm Chet Holmgren RC Silver', platform: 'ebay', currentBid: 75, marketValue: 115, discount: 35, timeRemaining: 6600, alertType: 'low_competition', urgency: 'low', message: 'Holmgren Silver well under market but over an hour left. Set a snipe timer.' },
  { id: 'sa_013', auctionId: 'la_001', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', platform: 'ebay', currentBid: 1250, marketValue: 1800, discount: 31, timeRemaining: 3600, alertType: 'under_market', urgency: 'medium', message: 'Skenes numbered auto 31% under comps. Strong prospect with 1 hour left.' },
  { id: 'sa_014', auctionId: 'la_023', cardName: '2025 Topps Chrome Gunnar Henderson Refractor Auto /499', platform: 'ebay', currentBid: 340, marketValue: 520, discount: 35, timeRemaining: 4800, alertType: 'price_drop', urgency: 'medium', message: 'Henderson Refractor Auto dropped from recent high. Buy-the-dip opportunity.' },
  { id: 'sa_015', auctionId: 'la_019', cardName: '2023 Upper Deck Connor McDavid Canvas Young Guns', platform: 'ebay', currentBid: 150, marketValue: 230, discount: 35, timeRemaining: 5400, alertType: 'under_market', urgency: 'low', message: 'McDavid Canvas variant at good discount. Over 1.5 hours remaining.' },
] as const;
const _PRIORITY_MAP: Record<string, string> = { critical: 'high', high: 'high', medium: 'medium', low: 'low' };
const SNIPER_ALERTS: SniperAlert[] = _RAW_SNIPER_ALERTS.map(a => ({
  ...a,
  auctionTitle: a.cardName,
  currentPrice: a.currentBid,
  priority: _PRIORITY_MAP[a.urgency] ?? 'low',
  triggerReason: a.alertType.replace(/_/g, ' '),
}));

const _RAW_WATCHED_AUCTIONS = [
  { id: 'wa_001', auctionId: 'la_001', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', platform: 'ebay', currentBid: 1250, priceAlert: 1600, addedDate: '2026-03-14', status: 'active', notes: 'Target for collection. Max bid $1,600.' },
  { id: 'wa_002', auctionId: 'la_003', cardName: '2023 National Treasures Wembanyama RPA /49', platform: 'goldin', currentBid: 15000, priceAlert: 20000, addedDate: '2026-03-12', status: 'active', notes: 'High-end target. Only bid if stays under $20k.' },
  { id: 'wa_003', auctionId: 'la_005', cardName: '1986 Fleer Michael Jordan RC #57', platform: 'pwcc', currentBid: 18500, priceAlert: 23000, addedDate: '2026-03-13', status: 'active', notes: 'PSA 8 Jordan RC for long-term hold.' },
  { id: 'wa_004', auctionId: 'la_006', cardName: '2024 Panini Prizm Caleb Williams RC Silver', platform: 'ebay', currentBid: 380, priceAlert: 450, addedDate: '2026-03-14', status: 'active', notes: 'Snipe target. Set max at $450.' },
  { id: 'wa_005', auctionId: 'la_010', cardName: '2024 Upper Deck Connor Bedard Young Guns RC', platform: 'ebay', currentBid: 280, priceAlert: 370, addedDate: '2026-03-14', status: 'active', notes: 'Hockey PC addition. Good price under $370.' },
  { id: 'wa_006', auctionId: 'la_012', cardName: '1955 Topps Roberto Clemente RC #164', platform: 'lelands', currentBid: 22000, priceAlert: 30000, addedDate: '2026-03-10', status: 'active', notes: 'Vintage target. PSA 5 is entry-level for this card.' },
  { id: 'wa_007', auctionId: 'la_015', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto Gold /50', platform: 'pwcc', currentBid: 5800, priceAlert: 7500, addedDate: '2026-03-13', status: 'active', notes: 'J-Rod gold auto. Beautiful card for the PC.' },
  { id: 'wa_008', auctionId: 'la_020', cardName: '2009 Bowman Chrome Mike Trout Auto RC', platform: 'heritage', currentBid: 95000, priceAlert: 125000, addedDate: '2026-03-11', status: 'active', notes: 'Dream card. Only if price stays reasonable.' },
  { id: 'wa_009', auctionId: 'la_021', cardName: '2024 Topps Chrome Shohei Ohtani Dodgers RC', platform: 'ebay', currentBid: 95, priceAlert: 130, addedDate: '2026-03-15', status: 'active', notes: 'Quick flip opportunity under $130.' },
  { id: 'wa_010', auctionId: 'la_024', cardName: '1993 SP Foil Derek Jeter RC #279', platform: 'pwcc', currentBid: 12500, priceAlert: 16000, addedDate: '2026-03-12', status: 'active', notes: 'Classic RC for vintage collection.' },
  { id: 'wa_011', auctionId: 'la_026', cardName: '2018 Topps Chrome Shohei Ohtani RC Auto', platform: 'goldin', currentBid: 28000, priceAlert: 35000, addedDate: '2026-03-11', status: 'active', notes: 'Ohtani Chrome Auto PSA 10. Flagship card.' },
  { id: 'wa_012', auctionId: 'la_002', cardName: '1952 Topps Mickey Mantle #311', platform: 'heritage', currentBid: 85000, priceAlert: 110000, addedDate: '2026-03-10', status: 'active', notes: 'Watching only. PSA 4 may be out of budget.' },
  { id: 'wa_013', auctionId: 'la_008', cardName: '1933 Goudey Babe Ruth #53', platform: 'heritage', currentBid: 45000, priceAlert: 60000, addedDate: '2026-03-09', status: 'active', notes: 'Pre-war icon. SGC 3 is affordable entry.' },
  { id: 'wa_014', auctionId: 'la_013', cardName: '2025 Bowman Chrome 1st Ethan Salas Auto /150', platform: 'ebay', currentBid: 520, priceAlert: 680, addedDate: '2026-03-15', status: 'active', notes: 'Top prospect. Numbered auto is scarce.' },
  { id: 'wa_015', auctionId: 'la_017', cardName: '2021 National Treasures Trevor Lawrence RPA /99', platform: 'goldin', currentBid: 3200, priceAlert: 4200, addedDate: '2026-03-14', status: 'active', notes: 'TLaw RPA at reasonable price. Monitor closely.' },
  { id: 'wa_016', auctionId: 'la_007', cardName: '2023 Topps Chrome Elly De La Cruz RC Auto Refractor', platform: 'whatnot', currentBid: 850, priceAlert: 1000, addedDate: '2026-03-15', status: 'active', notes: 'EDDLC auto refractor. Snipe if under $1k.' },
  { id: 'wa_017', auctionId: 'la_018', cardName: '2023 Bowman Chrome 1st Jackson Chourio Auto Refractor', platform: 'whatnot', currentBid: 320, priceAlert: 440, addedDate: '2026-03-15', status: 'active', notes: 'Chourio 1st auto. Strong rookie year supports price.' },
  { id: 'wa_018', auctionId: 'la_030', cardName: '2011 Topps Update Mike Trout RC #US175', platform: 'scp', currentBid: 42000, priceAlert: 50000, addedDate: '2026-03-08', status: 'active', notes: 'Trout RC PSA 10. Iconic modern card.' },
  { id: 'wa_019', auctionId: 'la_016', cardName: '2024 Panini Prizm Jayden Daniels RC Silver', platform: 'ebay', currentBid: 185, priceAlert: 250, addedDate: '2026-03-15', status: 'active', notes: 'Daniels breakout candidate. Silver PSA 10 target.' },
  { id: 'wa_020', auctionId: 'la_011', cardName: '2023 Prizm Silver Victor Wembanyama RC', platform: 'comc', currentBid: 650, priceAlert: 800, addedDate: '2026-03-14', status: 'active', notes: 'Wemby Silver on COMC. Usually cheaper than eBay.' },
  { id: 'wa_021', auctionId: 'la_009', cardName: '2022 Panini Flawless Luka Doncic Patch Auto /25', platform: 'goldin', currentBid: 8500, priceAlert: 11000, addedDate: '2026-03-13', status: 'active', notes: 'Luka Flawless. Premium card for the PC.' },
  { id: 'wa_022', auctionId: 'la_004', cardName: '2024 Bowman Chrome 1st Jackson Holliday Auto', platform: 'ebay', currentBid: 420, priceAlert: 550, addedDate: '2026-03-14', status: 'active', notes: 'Holliday 1st auto. Prospect with high ceiling.' },
  { id: 'wa_023', auctionId: 'la_014', cardName: '1969 Topps Reggie Jackson RC #260', platform: 'scp', currentBid: 3200, priceAlert: 4000, addedDate: '2026-03-12', status: 'active', notes: 'Mr. October RC. PSA 7 is solid grade for vintage.' },
  { id: 'wa_024', auctionId: 'la_028', cardName: '1975 Topps George Brett RC #228', platform: 'lelands', currentBid: 4500, priceAlert: 5800, addedDate: '2026-03-11', status: 'active', notes: 'Brett RC PSA 8. Clean example for HOF collection.' },
  { id: 'wa_025', auctionId: 'la_022', cardName: '2023 Select Concourse Patrick Mahomes Silver /199', platform: 'comc', currentBid: 125, priceAlert: 165, addedDate: '2026-03-15', status: 'active', notes: 'Mahomes Select Silver. Consistent seller.' },
] as const;
const _STATUS_CHOICES = ['winning', 'outbid', 'watching'] as const;
const _LIVE_MAP = new Map(LIVE_AUCTIONS.map(a => [a.id, a]));
const WATCHED_AUCTIONS: WatchedAuction[] = _RAW_WATCHED_AUCTIONS.map((w, i) => {
  const live = _LIVE_MAP.get(w.auctionId);
  return {
    ...w,
    title: w.cardName,
    maxBid: w.priceAlert,
    timeRemaining: live?.timeRemaining ?? 3600 * (i + 1),
    status: _STATUS_CHOICES[i % _STATUS_CHOICES.length],
  };
});

const BID_STRATEGIES: BidStrategyGuide[] = [
  { id: 'bs_001', name: 'Last-Second Snipe', description: 'Place bid in final 3-5 seconds to prevent counter-bids. Most effective on eBay with proxy bidding.', optimalSnipeTime: 4, successRate: 72, avgWinRate: 72, avgSavings: 15, bestFor: ['eBay fixed auctions', 'Low watcher count', 'Cards under $500'], riskLevel: 'medium' },
  { id: 'bs_002', name: 'Early Authority Bid', description: 'Place a strong bid early to discourage competition. Works best on heritage auction houses.', optimalSnipeTime: 86400, successRate: 58, avgWinRate: 58, avgSavings: 5, bestFor: ['Heritage/Goldin auctions', 'High-value vintage', 'Cards with few comps'], riskLevel: 'low' },
  { id: 'bs_003', name: 'Proxy Max Strategy', description: 'Set your true maximum bid and let the platform proxy bid for you. Simple and stress-free.', optimalSnipeTime: 3600, successRate: 65, avgWinRate: 65, avgSavings: 8, bestFor: ['All platforms', 'Beginners', 'Multiple simultaneous auctions'], riskLevel: 'low' },
  { id: 'bs_004', name: 'Odd Number Bid', description: 'Bid odd amounts like $127 or $513 to outbid round-number bidders by a small margin.', optimalSnipeTime: 30, successRate: 68, avgWinRate: 68, avgSavings: 12, bestFor: ['eBay', 'Cards under $1,000', 'High competition auctions'], riskLevel: 'low' },
  { id: 'bs_005', name: 'Wait and Pounce', description: 'Monitor without bidding until final 2 minutes. Avoid driving up price with early engagement.', optimalSnipeTime: 120, successRate: 70, avgWinRate: 70, avgSavings: 18, bestFor: ['eBay', 'Whatnot', 'High watcher auctions'], riskLevel: 'medium' },
  { id: 'bs_006', name: 'Multi-Auction Spread', description: 'Bid on multiple listings of the same card to increase odds of winning at least one below market.', optimalSnipeTime: 10, successRate: 85, avgWinRate: 85, avgSavings: 10, bestFor: ['Common cards', 'PSA 10 base', 'Volume buying'], riskLevel: 'medium' },
  { id: 'bs_007', name: 'Off-Peak Timing', description: 'Target auctions ending during off-peak hours (weekday mornings, late night) for less competition.', optimalSnipeTime: 5, successRate: 75, avgWinRate: 75, avgSavings: 22, bestFor: ['eBay', 'All card types', 'Budget buyers'], riskLevel: 'low' },
  { id: 'bs_008', name: 'Auction House Extended Bidding Counter', description: 'Heritage/Goldin extend auctions with new bids. Place bids strategically to exhaust competitors.', optimalSnipeTime: 15, successRate: 55, avgWinRate: 55, avgSavings: 3, bestFor: ['Heritage', 'Goldin', 'High-end cards over $5,000'], riskLevel: 'high' },
];

const AUCTION_STATS: AuctionStats[] = [
  { platform: 'ebay', totalActive: 245000, avgFinalPrice: 185, avgBidCount: 12, sniperSuccessRate: 72, peakBiddingHour: 21, avgListingDuration: 7 },
  { platform: 'heritage', totalActive: 850, avgFinalPrice: 8500, avgBidCount: 22, sniperSuccessRate: 45, peakBiddingHour: 22, avgListingDuration: 14 },
  { platform: 'goldin', totalActive: 1200, avgFinalPrice: 5200, avgBidCount: 18, sniperSuccessRate: 48, peakBiddingHour: 22, avgListingDuration: 10 },
  { platform: 'pwcc', totalActive: 3500, avgFinalPrice: 2800, avgBidCount: 15, sniperSuccessRate: 55, peakBiddingHour: 21, avgListingDuration: 7 },
  { platform: 'comc', totalActive: 180000, avgFinalPrice: 45, avgBidCount: 5, sniperSuccessRate: 80, peakBiddingHour: 20, avgListingDuration: 30 },
  { platform: 'whatnot', totalActive: 500, avgFinalPrice: 120, avgBidCount: 25, sniperSuccessRate: 35, peakBiddingHour: 21, avgListingDuration: 1 },
  { platform: 'lelands', totalActive: 450, avgFinalPrice: 12000, avgBidCount: 20, sniperSuccessRate: 42, peakBiddingHour: 22, avgListingDuration: 21 },
  { platform: 'scp', totalActive: 350, avgFinalPrice: 15000, avgBidCount: 18, sniperSuccessRate: 40, peakBiddingHour: 22, avgListingDuration: 21 },
];

const COMPETITOR_BIDDERS: CompetitorBidder[] = [
  { username: 'card_shark_99', platform: 'ebay', bidCount: 342, winRate: 28, avgSpend: 450, preferredCategories: ['Baseball RC', 'Chrome Autos'], sniperBehavior: true, lastActive: '2026-03-15' },
  { username: 'vintage_vault_collector', platform: 'ebay', bidCount: 185, winRate: 35, avgSpend: 2200, preferredCategories: ['Pre-1970 Baseball', 'HOF RC'], sniperBehavior: false, lastActive: '2026-03-15' },
  { username: 'hoops_heaven', platform: 'ebay', bidCount: 267, winRate: 22, avgSpend: 320, preferredCategories: ['Basketball RC', 'Prizm Silver'], sniperBehavior: true, lastActive: '2026-03-14' },
  { username: 'gridiron_gold', platform: 'ebay', bidCount: 198, winRate: 30, avgSpend: 280, preferredCategories: ['Football RC', 'QB Autos'], sniperBehavior: true, lastActive: '2026-03-15' },
  { username: 'premier_picks', platform: 'goldin', bidCount: 45, winRate: 40, avgSpend: 8500, preferredCategories: ['High-end Autos', 'RPA', 'Numbered /25'], sniperBehavior: false, lastActive: '2026-03-14' },
  { username: 'heritage_hawk', platform: 'heritage', bidCount: 78, winRate: 18, avgSpend: 12000, preferredCategories: ['Vintage Baseball', 'Pre-war', 'HOF'], sniperBehavior: false, lastActive: '2026-03-13' },
  { username: 'chrome_chaser_2024', platform: 'ebay', bidCount: 412, winRate: 25, avgSpend: 150, preferredCategories: ['Topps Chrome', 'Bowman 1st', 'Refractors'], sniperBehavior: true, lastActive: '2026-03-15' },
  { username: 'puck_power', platform: 'ebay', bidCount: 156, winRate: 32, avgSpend: 180, preferredCategories: ['Hockey YG', 'Upper Deck', 'Canvas'], sniperBehavior: false, lastActive: '2026-03-14' },
  { username: 'big_money_bidder', platform: 'goldin', bidCount: 32, winRate: 55, avgSpend: 25000, preferredCategories: ['Ultra-premium', 'Flawless', 'National Treasures'], sniperBehavior: false, lastActive: '2026-03-15' },
  { username: 'flip_king_cards', platform: 'whatnot', bidCount: 520, winRate: 38, avgSpend: 85, preferredCategories: ['Breaks', 'Modern RC', 'Quick flips'], sniperBehavior: true, lastActive: '2026-03-15' },
];

const AUCTION_HISTORY: AuctionHistory[] = [
  { id: 'ah_001', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', platform: 'ebay', finalPrice: 1850, bidCount: 22, date: '2026-03-10', grade: 'PSA 10', seller: 'chrome_kings' },
  { id: 'ah_002', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', platform: 'ebay', finalPrice: 1720, bidCount: 18, date: '2026-03-07', grade: 'PSA 10', seller: 'rc_vault' },
  { id: 'ah_003', cardName: '2024 Topps Chrome Paul Skenes RC Auto /99', platform: 'goldin', finalPrice: 1950, bidCount: 15, date: '2026-03-05', grade: 'PSA 10', seller: 'Goldin Auctions' },
  { id: 'ah_004', cardName: '2024 Panini Prizm Caleb Williams RC Silver', platform: 'ebay', finalPrice: 520, bidCount: 25, date: '2026-03-12', grade: 'PSA 10', seller: 'gridiron_gems' },
  { id: 'ah_005', cardName: '2024 Panini Prizm Caleb Williams RC Silver', platform: 'ebay', finalPrice: 495, bidCount: 20, date: '2026-03-08', grade: 'PSA 10', seller: 'football_first' },
  { id: 'ah_006', cardName: '2023 Prizm Silver Victor Wembanyama RC', platform: 'ebay', finalPrice: 880, bidCount: 28, date: '2026-03-11', grade: 'PSA 10', seller: 'hoops_elite' },
  { id: 'ah_007', cardName: '2023 Prizm Silver Victor Wembanyama RC', platform: 'comc', finalPrice: 825, bidCount: 8, date: '2026-03-09', grade: 'PSA 10', seller: 'COMC_vault' },
  { id: 'ah_008', cardName: '2024 Upper Deck Connor Bedard Young Guns RC', platform: 'ebay', finalPrice: 415, bidCount: 30, date: '2026-03-13', grade: 'PSA 10', seller: 'hockey_hits' },
  { id: 'ah_009', cardName: '2024 Upper Deck Connor Bedard Young Guns RC', platform: 'ebay', finalPrice: 430, bidCount: 22, date: '2026-03-10', grade: 'PSA 10', seller: 'puck_paradise' },
  { id: 'ah_010', cardName: '1986 Fleer Michael Jordan RC #57', platform: 'pwcc', finalPrice: 26500, bidCount: 18, date: '2026-03-08', grade: 'PSA 8', seller: 'PWCC Marketplace' },
  { id: 'ah_011', cardName: '1986 Fleer Michael Jordan RC #57', platform: 'heritage', finalPrice: 25800, bidCount: 25, date: '2026-03-01', grade: 'PSA 8', seller: 'Heritage Auctions' },
  { id: 'ah_012', cardName: '2024 Topps Chrome Shohei Ohtani Dodgers RC', platform: 'ebay', finalPrice: 148, bidCount: 32, date: '2026-03-14', grade: 'PSA 10', seller: 'ohtani_cards' },
  { id: 'ah_013', cardName: '2024 Topps Chrome Shohei Ohtani Dodgers RC', platform: 'ebay', finalPrice: 155, bidCount: 28, date: '2026-03-12', grade: 'PSA 10', seller: 'dodger_blue' },
  { id: 'ah_014', cardName: '2025 Bowman Chrome 1st Ethan Salas Auto /150', platform: 'ebay', finalPrice: 780, bidCount: 16, date: '2026-03-09', grade: 'PSA 10', seller: 'prospect_hq' },
  { id: 'ah_015', cardName: '2024 Panini Prizm Jayden Daniels RC Silver', platform: 'ebay', finalPrice: 285, bidCount: 18, date: '2026-03-13', grade: 'PSA 10', seller: 'dmv_cards' },
];

// ---- Helper Functions ----

const PLATFORM_CONFIG: Record<AuctionPlatform, { label: string; text: string; bg: string; border: string }> = {
  ebay: { label: 'eBay', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  heritage: { label: 'Heritage', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  goldin: { label: 'Goldin', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  pwcc: { label: 'PWCC', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  comc: { label: 'COMC', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  whatnot: { label: 'Whatnot', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  lelands: { label: 'Lelands', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  scp: { label: 'SCP', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  eBay: { label: 'eBay', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Goldin: { label: 'Goldin', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Heritage: { label: 'Heritage', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  PWCC: { label: 'PWCC', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  MySlabs: { label: 'MySlabs', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const URGENCY_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  low: { label: 'Low', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  medium: { label: 'Medium', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  high: { label: 'High', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  critical: { label: 'Critical', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const ALERT_TYPE_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  under_market: { label: 'Under Market', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  ending_soon: { label: 'Ending Soon', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  low_competition: { label: 'Low Competition', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  price_drop: { label: 'Price Drop', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  rare_find: { label: 'Rare Find', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
};

// ---- Public API ----

export function getPlatformConfig(platform: AuctionPlatform): { label: string; text: string; bg: string; border: string } {
  return PLATFORM_CONFIG[platform];
}

export function getUrgencyConfig(urgency: string): { label: string; text: string; bg: string; border: string } {
  return URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG['low'];
}

export function getAlertTypeConfig(alertType: string): { label: string; text: string; bg: string; border: string } {
  return ALERT_TYPE_CONFIG[alertType] ?? ALERT_TYPE_CONFIG['under_market'];
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function getLiveAuctions(platform?: AuctionPlatform, sport?: string): LiveAuction[] {
  const cacheKey = `live_${platform ?? 'all'}_${sport ?? 'all'}`;
  const cached = loadData<LiveAuction[]>(cacheKey);
  if (cached) return cached;

  let result = LIVE_AUCTIONS;
  if (platform) result = result.filter(a => a.platform === platform);
  if (sport) result = result.filter(a => a.sport === sport);

  saveData(cacheKey, result);
  return result;
}

export function getLiveAuctionById(id: string): LiveAuction | undefined {
  const cached = loadData<LiveAuction>(`auction_${id}`);
  if (cached) return cached;

  const auction = LIVE_AUCTIONS.find(a => a.id === id);
  if (auction) saveData(`auction_${id}`, auction);
  return auction;
}

export function getBidRecommendations(platform?: AuctionPlatform): BidRecommendation[] {
  const cacheKey = platform ? `recs_${platform}` : 'recs_all';
  const cached = loadData<BidRecommendation[]>(cacheKey);
  if (cached) return cached;

  const result = platform ? BID_RECOMMENDATIONS.filter(r => r.platform === platform) : BID_RECOMMENDATIONS;
  saveData(cacheKey, result);
  return result;
}

export function getSniperAlerts(urgency?: string): SniperAlert[] {
  const cacheKey = urgency ? `alerts_${urgency}` : 'alerts_all';
  const cached = loadData<SniperAlert[]>(cacheKey);
  if (cached) return cached;

  const result = urgency ? SNIPER_ALERTS.filter(a => a.urgency === urgency) : SNIPER_ALERTS;
  saveData(cacheKey, result);
  return result;
}

export function getWatchedAuctions(status?: string): WatchedAuction[] {
  const cacheKey = status ? `watched_${status}` : 'watched_all';
  const cached = loadData<WatchedAuction[]>(cacheKey);
  if (cached) return cached;

  const result = status ? WATCHED_AUCTIONS.filter(w => w.status === status) : WATCHED_AUCTIONS;
  saveData(cacheKey, result);
  return result;
}

export function getEndingSoon(withinSeconds?: number): EndingSoonAuction[] {
  const threshold = withinSeconds ?? 7200; // default 2 hours
  const cacheKey = `ending_v2_${threshold}`;
  const cached = loadData<EndingSoonAuction[]>(cacheKey);
  if (cached) return cached;

  const result: EndingSoonAuction[] = LIVE_AUCTIONS
    .filter(a => a.timeRemaining <= threshold)
    .sort((a, b) => a.timeRemaining - b.timeRemaining)
    .map(a => ({
      title: a.title,
      platform: a.platform,
      currentBid: a.currentBid,
      timeRemaining: a.timeRemaining,
      bidCount: a.bidCount,
    }));

  saveData(cacheKey, result);
  return result;
}

export function getBidStrategies(): BidStrategyGuide[] {
  const cached = loadData<BidStrategyGuide[]>('strategies');
  if (cached) return cached;
  saveData('strategies', BID_STRATEGIES);
  return BID_STRATEGIES;
}

export function getAuctionHistory(_cardName?: string, _platform?: AuctionPlatform): AuctionHistoryRecord[] {
  return _getAuctionHistoryRecords();
}

export function getAuctionStats(listingsOrPlatform?: AuctionListing[] | AuctionPlatform): AuctionStats[] | { total: number; endingSoon: number; avgDealScore: number; totalValue: number } {
  // New overload: accept AuctionListing[] and return summary stats
  if (Array.isArray(listingsOrPlatform)) {
    const listings = listingsOrPlatform;
    if (listings.length === 0) return { total: 0, endingSoon: 0, avgDealScore: 0, totalValue: 0 };
    return {
      total: listings.length,
      endingSoon: listings.filter(l => l.timeRemaining <= 3600).length,
      avgDealScore: Math.round(listings.reduce((s, l) => s + l.dealScore, 0) / listings.length),
      totalValue: listings.reduce((s, l) => s + l.currentBid, 0),
    };
  }
  // Legacy overload: accept optional platform string
  const platform = listingsOrPlatform;
  const cacheKey = platform ? `stats_${platform}` : 'stats_all';
  const cached = loadData<AuctionStats[]>(cacheKey);
  if (cached) return cached;

  const result = platform ? AUCTION_STATS.filter(s => s.platform === platform) : AUCTION_STATS;
  saveData(cacheKey, result);
  return result;
}

export function getCompetitorBidders(platform?: AuctionPlatform): CompetitorBidder[] {
  const cacheKey = platform ? `competitors_${platform}` : 'competitors_all';
  const cached = loadData<CompetitorBidder[]>(cacheKey);
  if (cached) return cached;

  const result = platform ? COMPETITOR_BIDDERS.filter(c => c.platform === platform) : COMPETITOR_BIDDERS;
  saveData(cacheKey, result);
  return result;
}

export function getBidAnalysis(auctionId: string): BidAnalysis {
  const cached = loadData<BidAnalysis>(`analysis_${auctionId}`);
  if (cached) return cached;

  const auction = LIVE_AUCTIONS.find(a => a.id === auctionId);
  const bidHistory: { time: number; amount: number; bidder: string }[] = [];

  if (auction) {
    const increment = (auction.currentBid - auction.startingBid) / Math.max(auction.bidCount, 1);
    for (let i = 0; i < auction.bidCount; i++) {
      bidHistory.push({
        time: Math.round(auction.timeRemaining + (auction.bidCount - i) * 600),
        amount: Math.round(auction.startingBid + increment * (i + 1)),
        bidder: `bidder_${String.fromCharCode(65 + (i % 8))}`,
      });
    }
  }

  const analysis: BidAnalysis = {
    auctionId,
    bidHistory,
    avgBidIncrement: auction ? Math.round((auction.currentBid - auction.startingBid) / Math.max(auction.bidCount, 1)) : 0,
    sniperActivity: (auction?.bidCount ?? 0) > 15,
    projectedFinal: auction?.estimatedFinalPrice ?? 0,
    competitorCount: new Set(bidHistory.map(b => b.bidder)).size,
  };

  saveData(`analysis_${auctionId}`, analysis);
  return analysis;
}

export function searchAuctions(query: string): LiveAuction[] {
  const cacheKey = `search_${query.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = loadData<LiveAuction[]>(cacheKey);
  if (cached) return cached;

  const lower = query.toLowerCase();
  const result = LIVE_AUCTIONS.filter(a =>
    a.cardName.toLowerCase().includes(lower) ||
    a.title.toLowerCase().includes(lower) ||
    a.sport.toLowerCase().includes(lower)
  );

  saveData(cacheKey, result);
  return result;
}

export function getAuctionSummary(): AuctionSummary {
  const cached = loadData<AuctionSummary>('auction_summary_v2');
  if (cached) return cached;

  const avgDiscount = SNIPER_ALERTS.length > 0
    ? Math.round(SNIPER_ALERTS.reduce((sum, a) => sum + a.discount, 0) / SNIPER_ALERTS.length)
    : 14;

  const summary: AuctionSummary = {
    totalActive: LIVE_AUCTIONS.length,
    totalBidsPlaced: LIVE_AUCTIONS.reduce((sum, a) => sum + a.bidCount, 0),
    winRate: 68,
    avgSavings: avgDiscount > 0 ? avgDiscount : 14,
    sniperWins: 42,
    totalSaved: 12850,
  };

  saveData('auction_summary_v2', summary);
  return summary;
}

// ---- Adapter types & functions for AuctionSniper page (Phase 158) ----

export interface EndingSoonAuction {
  title: string;
  platform: AuctionPlatform;
  currentBid: number;
  bidCount: number;
  timeRemaining: number;
}

export interface AuctionByPlatform {
  platform: string;
  count: number;
  avgPrice: number;
}

export interface PlatformDistribution {
  platform: string;
  count: number;
}

export interface HistoricalBidPattern {
  timeLabel: string;
  avgBids: number;
  avgPrice: number;
}

export interface AuctionSummary {
  totalActive: number;
  totalBidsPlaced: number;
  winRate: number;
  avgSavings: number;
  sniperWins: number;
  totalSaved: number;
}

export function getAuctionsByPlatform(): AuctionByPlatform[] {
  const platformMap = new Map<string, { count: number; totalPrice: number }>();
  for (const a of LIVE_AUCTIONS) {
    const entry = platformMap.get(a.platform) ?? { count: 0, totalPrice: 0 };
    entry.count += 1;
    entry.totalPrice += a.currentBid;
    platformMap.set(a.platform, entry);
  }
  return Array.from(platformMap.entries()).map(([platform, data]) => ({
    platform,
    count: data.count,
    avgPrice: Math.round(data.totalPrice / data.count),
  }));
}

export function getPlatformDistribution(): PlatformDistribution[] {
  const platformMap = new Map<string, number>();
  for (const a of LIVE_AUCTIONS) {
    platformMap.set(a.platform, (platformMap.get(a.platform) ?? 0) + 1);
  }
  return Array.from(platformMap.entries()).map(([platform, count]) => ({
    platform,
    count,
  }));
}

export function getBidStrategyGuide(): BidStrategyGuide[] {
  return getBidStrategies();
}

export function getHistoricalBidPatterns(): HistoricalBidPattern[] {
  const labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  return labels.map((timeLabel, i) => ({
    timeLabel,
    avgBids: Math.round(8 + Math.sin(i * 0.8) * 6 + i * 1.5),
    avgPrice: Math.round(120 + Math.cos(i * 0.5) * 40 + i * 15),
  }));
}


// ---- Widget adapter functions ----

export function getAlerts(): { id: string; active: boolean; message: string }[] {
  return getSniperAlerts().map(a => ({
    id: a.id,
    active: a.urgency === 'high' || a.urgency === 'critical',
    message: a.message,
  }));
}

// ---- Modal types ----

export type BidPattern = 'organic' | 'shill_suspect' | 'proxy_war' | 'sniper_active';

export interface AuctionListing {
  id: string;
  platform: AuctionPlatform;
  player: string;
  cardDescription: string;
  grade: string;
  currentBid: number;
  bidCount: number;
  timeRemaining: number;
  endTime: string;
  sellerRating: number;
  estimatedFMV: number;
  dealScore: number;
  bidPattern: BidPattern;
  shillRisk: number;
  watchers: number;
  image: string;
  potentialSavings: number;
  itemName: string;
}

export interface BidHistoryAnalysis {
  auctionId: string;
  pattern: BidPattern;
  bids: { amount: number; bidder: string; isNewBidder: boolean; timestamp: string }[];
  avgBidIncrement: number;
  velocityChange: number;
  shillIndicators: string[];
}

export interface BidStrategy {
  auctionId: string;
  strategy: 'early_bid' | 'mid_game' | 'snipe' | 'proxy';
  maxBid: number;
  snipeTime: number;
  confidence: number;
  reasoning: string;
}

// ---- Modal data ----

const AUCTION_LISTING_DATA: AuctionListing[] = [
  { id: 'al_001', platform: 'eBay', player: 'Mike Trout', cardDescription: '2011 Topps Update RC #US175', grade: 'PSA 10', currentBid: 4200, bidCount: 28, timeRemaining: 1800, endTime: '2026-03-15T17:30:00Z', sellerRating: 99.2, estimatedFMV: 5500, dealScore: 78, bidPattern: 'organic', shillRisk: 12, watchers: 45, image: '', potentialSavings: 1300, itemName: '2011 Topps Update Mike Trout RC #US175 PSA 10' },
  { id: 'al_002', platform: 'Goldin', player: 'Victor Wembanyama', cardDescription: '2023 Panini Prizm Silver RC', grade: 'PSA 10', currentBid: 850, bidCount: 18, timeRemaining: 3600, endTime: '2026-03-15T18:00:00Z', sellerRating: 100, estimatedFMV: 1200, dealScore: 72, bidPattern: 'proxy_war', shillRisk: 25, watchers: 62, image: '', potentialSavings: 350, itemName: '2023 Panini Prizm Silver Victor Wembanyama RC PSA 10' },
  { id: 'al_003', platform: 'Heritage', player: 'Mickey Mantle', cardDescription: '1952 Topps #311', grade: 'PSA 4', currentBid: 85000, bidCount: 32, timeRemaining: 7200, endTime: '2026-03-15T19:00:00Z', sellerRating: 100, estimatedFMV: 125000, dealScore: 82, bidPattern: 'organic', shillRisk: 8, watchers: 210, image: '', potentialSavings: 40000, itemName: '1952 Topps Mickey Mantle #311 PSA 4' },
  { id: 'al_004', platform: 'eBay', player: 'Shohei Ohtani', cardDescription: '2018 Topps Chrome RC Auto', grade: 'PSA 10', currentBid: 28000, bidCount: 22, timeRemaining: 900, endTime: '2026-03-15T17:15:00Z', sellerRating: 98.5, estimatedFMV: 38000, dealScore: 75, bidPattern: 'sniper_active', shillRisk: 18, watchers: 88, image: '', potentialSavings: 10000, itemName: '2018 Topps Chrome Shohei Ohtani RC Auto PSA 10' },
  { id: 'al_005', platform: 'PWCC', player: 'Michael Jordan', cardDescription: '1986 Fleer RC #57', grade: 'PSA 8', currentBid: 19500, bidCount: 15, timeRemaining: 14400, endTime: '2026-03-15T21:00:00Z', sellerRating: 100, estimatedFMV: 26000, dealScore: 68, bidPattern: 'organic', shillRisk: 5, watchers: 72, image: '', potentialSavings: 6500, itemName: '1986 Fleer Michael Jordan RC #57 PSA 8' },
  { id: 'al_006', platform: 'eBay', player: 'Caleb Williams', cardDescription: '2024 Panini Prizm Silver RC', grade: 'PSA 10', currentBid: 380, bidCount: 24, timeRemaining: 600, endTime: '2026-03-15T17:10:00Z', sellerRating: 99.0, estimatedFMV: 550, dealScore: 70, bidPattern: 'shill_suspect', shillRisk: 65, watchers: 35, image: '', potentialSavings: 170, itemName: '2024 Panini Prizm Silver Caleb Williams RC PSA 10' },
  { id: 'al_007', platform: 'Goldin', player: 'Luka Doncic', cardDescription: '2022 Panini Flawless Patch Auto /25', grade: 'BGS 9', currentBid: 8500, bidCount: 19, timeRemaining: 10800, endTime: '2026-03-15T20:00:00Z', sellerRating: 100, estimatedFMV: 13000, dealScore: 74, bidPattern: 'organic', shillRisk: 10, watchers: 58, image: '', potentialSavings: 4500, itemName: '2022 Panini Flawless Luka Doncic Patch Auto /25 BGS 9' },
  { id: 'al_008', platform: 'eBay', player: 'Paul Skenes', cardDescription: '2024 Topps Chrome RC Auto /99', grade: 'PSA 10', currentBid: 1250, bidCount: 20, timeRemaining: 2400, endTime: '2026-03-15T17:40:00Z', sellerRating: 99.5, estimatedFMV: 1900, dealScore: 76, bidPattern: 'proxy_war', shillRisk: 30, watchers: 40, image: '', potentialSavings: 650, itemName: '2024 Topps Chrome Paul Skenes RC Auto /99 PSA 10' },
  { id: 'al_009', platform: 'Heritage', player: 'Babe Ruth', cardDescription: '1933 Goudey #53', grade: 'SGC 3', currentBid: 45000, bidCount: 28, timeRemaining: 86400, endTime: '2026-03-16T17:00:00Z', sellerRating: 100, estimatedFMV: 68000, dealScore: 80, bidPattern: 'organic', shillRisk: 3, watchers: 175, image: '', potentialSavings: 23000, itemName: '1933 Goudey Babe Ruth #53 SGC 3' },
  { id: 'al_010', platform: 'MySlabs', player: 'Connor Bedard', cardDescription: '2024 Upper Deck Young Guns RC', grade: 'PSA 10', currentBid: 280, bidCount: 16, timeRemaining: 1200, endTime: '2026-03-15T17:20:00Z', sellerRating: 97.8, estimatedFMV: 420, dealScore: 71, bidPattern: 'organic', shillRisk: 15, watchers: 22, image: '', potentialSavings: 140, itemName: '2024 Upper Deck Connor Bedard Young Guns RC PSA 10' },
  { id: 'al_011', platform: 'eBay', player: 'Jayden Daniels', cardDescription: '2024 Panini Prizm Silver RC', grade: 'PSA 10', currentBid: 185, bidCount: 14, timeRemaining: 3000, endTime: '2026-03-15T17:50:00Z', sellerRating: 98.8, estimatedFMV: 300, dealScore: 65, bidPattern: 'organic', shillRisk: 20, watchers: 18, image: '', potentialSavings: 115, itemName: '2024 Panini Prizm Silver Jayden Daniels RC PSA 10' },
  { id: 'al_012', platform: 'PWCC', player: 'Derek Jeter', cardDescription: '1993 SP Foil RC #279', grade: 'PSA 9', currentBid: 12500, bidCount: 13, timeRemaining: 28800, endTime: '2026-03-16T01:00:00Z', sellerRating: 100, estimatedFMV: 18500, dealScore: 73, bidPattern: 'sniper_active', shillRisk: 8, watchers: 65, image: '', potentialSavings: 6000, itemName: '1993 SP Foil Derek Jeter RC #279 PSA 9' },
  { id: 'al_013', platform: 'eBay', player: 'Gunnar Henderson', cardDescription: '2025 Topps Chrome Refractor Auto /499', grade: 'PSA 10', currentBid: 340, bidCount: 17, timeRemaining: 4800, endTime: '2026-03-15T18:20:00Z', sellerRating: 99.3, estimatedFMV: 520, dealScore: 69, bidPattern: 'organic', shillRisk: 22, watchers: 28, image: '', potentialSavings: 180, itemName: '2025 Topps Chrome Gunnar Henderson Refractor Auto /499 PSA 10' },
  { id: 'al_014', platform: 'Goldin', player: 'Trevor Lawrence', cardDescription: '2021 National Treasures RPA /99', grade: 'BGS 9', currentBid: 3200, bidCount: 11, timeRemaining: 43200, endTime: '2026-03-16T05:00:00Z', sellerRating: 100, estimatedFMV: 5000, dealScore: 67, bidPattern: 'organic', shillRisk: 14, watchers: 42, image: '', potentialSavings: 1800, itemName: '2021 National Treasures Trevor Lawrence RPA /99 BGS 9' },
  { id: 'al_015', platform: 'eBay', player: 'Julio Rodriguez', cardDescription: '2022 Topps Chrome RC Auto Gold /50', grade: 'PSA 10', currentBid: 5800, bidCount: 18, timeRemaining: 21600, endTime: '2026-03-15T23:00:00Z', sellerRating: 100, estimatedFMV: 8200, dealScore: 71, bidPattern: 'shill_suspect', shillRisk: 55, watchers: 50, image: '', potentialSavings: 2400, itemName: '2022 Topps Chrome Julio Rodriguez RC Auto Gold /50 PSA 10' },
];

function _getAuctionListings(): AuctionListing[] {
  const cached = loadData<AuctionListing[]>('auction_listings_v2');
  if (cached) return cached;
  const sorted = [...AUCTION_LISTING_DATA].sort((a, b) => a.timeRemaining - b.timeRemaining);
  saveData('auction_listings_v2', sorted);
  return sorted;
}

// ---- Modal functions ----

export function getActiveAuctions(): AuctionListing[] {
  return _getAuctionListings();
}

export function analyzeBidHistory(auctionId: string): BidHistoryAnalysis {
  const auction = _getAuctionListings().find(a => a.id === auctionId);
  if (!auction) {
    return {
      auctionId,
      pattern: 'organic',
      bids: [],
      avgBidIncrement: 0,
      velocityChange: 0,
      shillIndicators: [],
    };
  }

  const bidCount = auction.bidCount;
  const bids: BidHistoryAnalysis['bids'] = [];
  const bidders = ['card_shark_42', 'vintage_vault', 'rookie_hunter', 'grail_chaser', 'slabbed_up', 'top_loader', 'gem_mint_99'];
  let currentAmount = auction.currentBid * 0.3;
  const increment = (auction.currentBid - currentAmount) / Math.max(bidCount - 1, 1);

  for (let i = 0; i < bidCount; i++) {
    const jitter = increment * (0.6 + Math.sin(i * 1.5) * 0.4);
    currentAmount += i === 0 ? 0 : jitter;
    bids.push({
      amount: Math.round(Math.min(currentAmount, auction.currentBid) * 100) / 100,
      bidder: bidders[i % bidders.length],
      isNewBidder: i < 3 || i % 4 === 0,
      timestamp: new Date(Date.now() - (bidCount - i) * 600000).toISOString(),
    });
  }
  if (bids.length > 0) bids[bids.length - 1].amount = auction.currentBid;

  const increments = bids.slice(1).map((b, i) => b.amount - bids[i].amount);
  const avgInc = increments.length > 0 ? increments.reduce((s, v) => s + v, 0) / increments.length : 0;

  const shillIndicators: string[] = [];
  if (auction.shillRisk > 50) {
    shillIndicators.push('Rapid bid escalation detected in final bidding phase');
    shillIndicators.push('Same bidder pattern: losing bidder consistently raises by minimum increment');
  }
  if (auction.shillRisk > 30) {
    shillIndicators.push('New account bidding aggressively within first 24 hours');
  }

  return {
    auctionId,
    pattern: auction.bidPattern,
    bids,
    avgBidIncrement: Math.round(avgInc * 100) / 100,
    velocityChange: auction.shillRisk > 50 ? 85 : auction.shillRisk > 30 ? 35 : -10,
    shillIndicators,
  };
}

export function generateBidStrategy(auctionId: string, maxBudget: number): BidStrategy {
  const auction = _getAuctionListings().find(a => a.id === auctionId);
  if (!auction) {
    return {
      auctionId,
      strategy: 'snipe',
      maxBid: 0,
      snipeTime: 5,
      confidence: 0,
      reasoning: 'Auction not found.',
    };
  }

  const belowFMV = auction.currentBid < auction.estimatedFMV;
  const effectiveMax = Math.min(maxBudget, auction.estimatedFMV * 0.95);
  const maxBid = Math.min(effectiveMax, maxBudget);

  let strategy: BidStrategy['strategy'];
  let snipeTime: number;
  let confidence: number;
  let reasoning: string;

  if (auction.shillRisk > 60) {
    strategy = 'snipe';
    snipeTime = Math.min(5, Math.max(2, Math.round(auction.shillRisk / 20)));
    confidence = belowFMV ? Math.min(95, 40 + auction.dealScore * 0.5) : 25;
    reasoning = `High shill risk (${auction.shillRisk}%) detected. Recommending last-second snipe at ${snipeTime}s to avoid price manipulation. ${belowFMV ? 'Current bid is below FMV, making this a viable target.' : 'Caution: price may already be inflated.'}`;
  } else if (auction.timeRemaining < 1800) {
    strategy = 'snipe';
    snipeTime = 5;
    confidence = belowFMV ? Math.min(95, 50 + auction.dealScore * 0.4) : 30;
    reasoning = `Auction ending soon (${Math.floor(auction.timeRemaining / 60)}m remaining). Snipe strategy recommended to avoid triggering counter-bids. ${belowFMV ? 'Good value below FMV.' : 'Consider if price justifies the bid.'}`;
  } else if (auction.dealScore >= 70 && auction.bidCount < 10) {
    strategy = 'early_bid';
    snipeTime = 300;
    confidence = Math.min(95, 55 + auction.dealScore * 0.3);
    reasoning = `Strong deal score (${auction.dealScore}) with low competition (${auction.bidCount} bids). An early authoritative bid may discourage other bidders.`;
  } else if (auction.bidPattern === 'proxy_war') {
    strategy = 'proxy';
    snipeTime = 30;
    confidence = Math.min(95, 35 + auction.dealScore * 0.3);
    reasoning = 'Proxy war detected between bidders. Set a firm proxy bid at your max and let the system handle incremental bidding. Avoid emotional escalation.';
  } else {
    strategy = 'mid_game';
    snipeTime = 60;
    confidence = Math.min(95, 45 + auction.dealScore * 0.3);
    reasoning = `Standard auction dynamics. Place a competitive bid during mid-auction to establish presence, then monitor. Current bid is ${belowFMV ? 'below' : 'near'} fair market value.`;
  }

  confidence = Math.max(15, Math.round(confidence));
  if (maxBid < auction.currentBid) {
    confidence = Math.max(15, Math.round(confidence * 0.4));
    reasoning += ' Budget is below current bid — low probability of winning.';
  }

  return {
    auctionId,
    strategy,
    maxBid: Math.round(maxBid * 100) / 100,
    snipeTime,
    confidence,
    reasoning,
  };
}

// ---- Sniper stats (modal-compatible) ----

interface SniperStatsResult {
  winRate: number;
  totalBids: number;
  totalWins: number;
  totalTracked: number;
  totalWon: number;
  avgSavingsVsFMV: number;
  totalSaved: number;
  bestDeal: { player: string; savings: number; platform: AuctionPlatform };
}

export function getSniperStats(): SniperStatsResult {
  const history = _getAuctionHistoryRecords();
  const won = history.filter(h => h.won);
  const totalTracked = history.length;
  const totalWon = won.length;
  const winRate = totalTracked > 0 ? Math.round((totalWon / totalTracked) * 1000) / 10 : 0;
  const totalSaved = won.reduce((sum, h) => sum + h.savings, 0);
  const avgSavingsVsFMV = won.length > 0
    ? Math.round(won.reduce((sum, h) => sum + (h.estimatedFMV > 0 ? ((h.estimatedFMV - h.finalPrice) / h.estimatedFMV) * 100 : 0), 0) / won.length * 10) / 10
    : 0;

  let bestDeal = { player: 'N/A', savings: 0, platform: 'eBay' as AuctionPlatform };
  for (const h of won) {
    if (h.savings > bestDeal.savings) {
      bestDeal = { player: h.player, savings: h.savings, platform: h.platform };
    }
  }

  return {
    winRate,
    totalBids: totalTracked,
    totalWins: totalWon,
    totalTracked,
    totalWon,
    avgSavingsVsFMV,
    totalSaved,
    bestDeal,
  };
}

// ---- Auction history (modal-compatible) ----

export interface AuctionHistoryRecord {
  id: string;
  player: string;
  platform: AuctionPlatform;
  cardDescription: string;
  grade: string;
  finalPrice: number;
  estimatedFMV: number;
  maxBidPlaced: number;
  won: boolean;
  savings: number;
  endedAt: string;
}

const AUCTION_HISTORY_RECORDS: AuctionHistoryRecord[] = [
  { id: 'ahr_001', player: 'Mike Trout', platform: 'eBay', cardDescription: '2011 Topps Update RC #US175', grade: 'PSA 10', finalPrice: 4800, estimatedFMV: 5500, maxBidPlaced: 5200, won: true, savings: 700, endedAt: '2026-03-14T18:00:00Z' },
  { id: 'ahr_002', player: 'Victor Wembanyama', platform: 'Goldin', cardDescription: '2023 Panini Prizm Silver RC', grade: 'PSA 10', finalPrice: 1100, estimatedFMV: 1200, maxBidPlaced: 1150, won: true, savings: 100, endedAt: '2026-03-14T16:00:00Z' },
  { id: 'ahr_003', player: 'Shohei Ohtani', platform: 'eBay', cardDescription: '2018 Topps Chrome RC Auto', grade: 'PSA 10', finalPrice: 39000, estimatedFMV: 38000, maxBidPlaced: 36000, won: false, savings: 0, endedAt: '2026-03-13T20:00:00Z' },
  { id: 'ahr_004', player: 'Caleb Williams', platform: 'eBay', cardDescription: '2024 Panini Prizm Silver RC', grade: 'PSA 10', finalPrice: 480, estimatedFMV: 550, maxBidPlaced: 520, won: true, savings: 70, endedAt: '2026-03-13T17:00:00Z' },
  { id: 'ahr_005', player: 'Michael Jordan', platform: 'PWCC', cardDescription: '1986 Fleer RC #57', grade: 'PSA 8', finalPrice: 24000, estimatedFMV: 26000, maxBidPlaced: 25000, won: true, savings: 2000, endedAt: '2026-03-12T21:00:00Z' },
  { id: 'ahr_006', player: 'Paul Skenes', platform: 'eBay', cardDescription: '2024 Topps Chrome RC Auto /99', grade: 'PSA 10', finalPrice: 1850, estimatedFMV: 1900, maxBidPlaced: 1800, won: false, savings: 0, endedAt: '2026-03-12T18:00:00Z' },
  { id: 'ahr_007', player: 'Connor Bedard', platform: 'eBay', cardDescription: '2024 Upper Deck Young Guns RC', grade: 'PSA 10', finalPrice: 350, estimatedFMV: 420, maxBidPlaced: 400, won: true, savings: 70, endedAt: '2026-03-11T19:00:00Z' },
  { id: 'ahr_008', player: 'Luka Doncic', platform: 'Goldin', cardDescription: '2022 Panini Flawless Patch Auto /25', grade: 'BGS 9', finalPrice: 12800, estimatedFMV: 13000, maxBidPlaced: 12500, won: false, savings: 0, endedAt: '2026-03-11T16:00:00Z' },
  { id: 'ahr_009', player: 'Derek Jeter', platform: 'Heritage', cardDescription: '1993 SP Foil RC #279', grade: 'PSA 9', finalPrice: 16500, estimatedFMV: 18500, maxBidPlaced: 17500, won: true, savings: 2000, endedAt: '2026-03-10T20:00:00Z' },
  { id: 'ahr_010', player: 'Jayden Daniels', platform: 'eBay', cardDescription: '2024 Panini Prizm Silver RC', grade: 'PSA 10', finalPrice: 275, estimatedFMV: 300, maxBidPlaced: 290, won: true, savings: 25, endedAt: '2026-03-10T17:00:00Z' },
  { id: 'ahr_011', player: 'Julio Rodriguez', platform: 'PWCC', cardDescription: '2022 Topps Chrome RC Auto Gold /50', grade: 'PSA 10', finalPrice: 7800, estimatedFMV: 8200, maxBidPlaced: 8000, won: true, savings: 400, endedAt: '2026-03-09T22:00:00Z' },
  { id: 'ahr_012', player: 'Babe Ruth', platform: 'Heritage', cardDescription: '1933 Goudey #53', grade: 'SGC 3', finalPrice: 72000, estimatedFMV: 68000, maxBidPlaced: 65000, won: false, savings: 0, endedAt: '2026-03-09T18:00:00Z' },
  { id: 'ahr_013', player: 'Trevor Lawrence', platform: 'Goldin', cardDescription: '2021 National Treasures RPA /99', grade: 'BGS 9', finalPrice: 4600, estimatedFMV: 5000, maxBidPlaced: 4800, won: true, savings: 400, endedAt: '2026-03-08T20:00:00Z' },
  { id: 'ahr_014', player: 'Gunnar Henderson', platform: 'eBay', cardDescription: '2025 Topps Chrome Refractor Auto /499', grade: 'PSA 10', finalPrice: 490, estimatedFMV: 520, maxBidPlaced: 500, won: true, savings: 30, endedAt: '2026-03-08T17:00:00Z' },
  { id: 'ahr_015', player: 'Mickey Mantle', platform: 'Heritage', cardDescription: '1952 Topps #311', grade: 'PSA 4', finalPrice: 130000, estimatedFMV: 125000, maxBidPlaced: 120000, won: false, savings: 0, endedAt: '2026-03-07T20:00:00Z' },
  { id: 'ahr_016', player: 'Chet Holmgren', platform: 'eBay', cardDescription: '2023 Panini Prizm Silver RC', grade: 'PSA 10', finalPrice: 95, estimatedFMV: 115, maxBidPlaced: 110, won: true, savings: 20, endedAt: '2026-03-07T17:00:00Z' },
  { id: 'ahr_017', player: 'Patrick Mahomes', platform: 'eBay', cardDescription: '2023 Select Concourse Silver /199', grade: 'PSA 10', finalPrice: 165, estimatedFMV: 185, maxBidPlaced: 180, won: true, savings: 20, endedAt: '2026-03-06T19:00:00Z' },
  { id: 'ahr_018', player: 'Ethan Salas', platform: 'eBay', cardDescription: '2025 Bowman Chrome 1st Auto /150', grade: 'PSA 10', finalPrice: 720, estimatedFMV: 780, maxBidPlaced: 750, won: true, savings: 60, endedAt: '2026-03-06T17:00:00Z' },
  { id: 'ahr_019', player: 'Roberto Clemente', platform: 'Heritage', cardDescription: '1955 Topps RC #164', grade: 'PSA 5', finalPrice: 33000, estimatedFMV: 35000, maxBidPlaced: 32000, won: false, savings: 0, endedAt: '2026-03-05T20:00:00Z' },
  { id: 'ahr_020', player: 'Jackson Holliday', platform: 'eBay', cardDescription: '2024 Bowman Chrome 1st Auto', grade: 'PSA 10', finalPrice: 550, estimatedFMV: 620, maxBidPlaced: 600, won: true, savings: 70, endedAt: '2026-03-05T17:00:00Z' },
];

function _getAuctionHistoryRecords(): AuctionHistoryRecord[] {
  const cached = loadData<AuctionHistoryRecord[]>('auction_history_records_v2');
  if (cached) return cached;
  const sorted = [...AUCTION_HISTORY_RECORDS].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
  );
  saveData('auction_history_records_v2', sorted);
  return sorted;
}

// ---- Additional exports needed by components and tests ----

export function analyzeListing(listing: AuctionListing): AuctionListing & { strategy: string } {
  let strategy: string;
  if (listing.dealScore >= 75) strategy = 'snipe';
  else if (listing.dealScore >= 50) strategy = 'early_bid';
  else if (listing.dealScore >= 25) strategy = 'watch';
  else strategy = 'skip';
  return { ...listing, strategy };
}

export function getAuctionAlerts(listings: AuctionListing[]): { type: string; message: string; auctionId: string }[] {
  const alerts: { type: string; message: string; auctionId: string }[] = [];
  for (const l of listings) {
    if (l.timeRemaining < 600) {
      alerts.push({ type: 'ending', message: `${l.player} auction ending in ${Math.floor(l.timeRemaining / 60)}m`, auctionId: l.id });
    }
    if (l.shillRisk >= 60) {
      alerts.push({ type: 'shill', message: `Shill risk ${l.shillRisk}% on ${l.player}`, auctionId: l.id });
    }
    if (l.dealScore >= 80) {
      alerts.push({ type: 'deal', message: `Deal score ${l.dealScore} on ${l.player}`, auctionId: l.id });
    }
  }
  return alerts;
}

export function generateMockAuctions(_existing: AuctionListing[]): AuctionListing[] {
  return getActiveAuctions();
}
