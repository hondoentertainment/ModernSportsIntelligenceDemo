import { CardInventory, Sport } from '../types';

// ── Interfaces ──────────────────────────────────────────────────────────────────

export interface AuctionListing {
  id: string;
  player: string;
  year: number;
  manufacturer: string;
  set: string;
  sport: Sport;
  grade: string;
  currentBid: number;
  bidCount: number;
  startPrice: number;
  estimatedValue: number;
  timeRemaining: number; // seconds
  endTime: string;       // ISO date
  seller: string;
  condition: string;
  image: string;
  watchers: number;
  isHot: boolean;
}

export type SniperStrategy = 'snipe' | 'early_bid' | 'watch' | 'skip';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CompetitionLevel = 'low' | 'medium' | 'high' | 'fierce';

export interface SniperAnalysis {
  listing: AuctionListing;
  fairValue: number;
  maxBid: number;
  confidence: number;       // 0-100
  strategy: SniperStrategy;
  bidTiming: number;         // seconds before end
  expectedSavings: number;
  riskLevel: RiskLevel;
  competitionLevel: CompetitionLevel;
  rationale: string;
}

export type AuctionAlertType = 'ending_soon' | 'price_drop' | 'below_value' | 'new_listing';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AuctionAlert {
  id: string;
  listingId: string;
  type: AuctionAlertType;
  message: string;
  severity: AlertSeverity;
  createdAt: string;
}

export interface AuctionStats {
  totalActive: number;
  endingSoon: number;
  avgDiscount: number;
  totalPotentialSavings: number;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_watched_auctions';
const ONE_HOUR = 3600;
const SIX_HOURS = 21600;

// ── Deterministic seeding helpers ───────────────────────────────────────────────

function dateHash(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Mock data pools ─────────────────────────────────────────────────────────────

const MOCK_PLAYERS: Record<Sport, string[]> = {
  Baseball: ['Mike Trout', 'Shohei Ohtani', 'Juan Soto', 'Ronald Acuna Jr.', 'Julio Rodriguez'],
  Basketball: ['Luka Doncic', 'Victor Wembanyama', 'Jayson Tatum', 'Anthony Edwards', 'Ja Morant'],
  Football: ['Patrick Mahomes', 'Josh Allen', 'Lamar Jackson', 'CJ Stroud', 'Caleb Williams'],
  Hockey: ['Connor McDavid', 'Auston Matthews', 'Connor Bedard', 'Cale Makar', 'Nathan MacKinnon'],
  Soccer: ['Jude Bellingham', 'Kylian Mbappe', 'Erling Haaland', 'Lamine Yamal', 'Vinicius Jr.'],
};

const MANUFACTURERS = ['Topps', 'Panini', 'Upper Deck', 'Bowman', 'Donruss'];
const SETS = ['Chrome', 'Prizm', 'Select', 'Optic', 'Mosaic', 'National Treasures', 'Heritage', 'Inception'];
const GRADES = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'SGC 10', 'PSA 8', 'Raw NM'];
const SELLERS = ['cardking99', 'gradedgems', 'sportscards_hq', 'elite_collector', 'slab_city', 'hobby_vault', 'platinum_pulls', 'grail_hunter'];
const CONDITIONS = ['Gem Mint', 'Mint', 'Near Mint', 'Excellent', 'Raw'];

// ── Service functions ───────────────────────────────────────────────────────────

/**
 * Generate 8-12 simulated live auctions deterministically seeded by today's date.
 * Incorporates cards the user owns to create relevant auctions.
 */
export function generateMockAuctions(inventory: CardInventory[]): AuctionListing[] {
  const now = new Date();
  const seed = dateHash(now);
  const rand = seededRandom(seed);

  const count = 8 + Math.floor(rand() * 5); // 8-12 listings
  const listings: AuctionListing[] = [];

  for (let i = 0; i < count; i++) {
    const useInventoryCard = inventory.length > 0 && rand() < 0.4;
    const refCard = useInventoryCard
      ? inventory[Math.floor(rand() * inventory.length)]
      : null;

    const sport: Sport = refCard?.sport ?? (['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'] as Sport[])[Math.floor(rand() * 5)];
    const players = MOCK_PLAYERS[sport];
    const player = refCard?.player ?? players[Math.floor(rand() * players.length)];
    const year = refCard?.year ?? (2018 + Math.floor(rand() * 7));
    const manufacturer = refCard?.manufacturer ?? MANUFACTURERS[Math.floor(rand() * MANUFACTURERS.length)];
    const set = refCard?.set ?? SETS[Math.floor(rand() * SETS.length)];
    const grade = (refCard?.isGraded && refCard?.grade)
      ? `${refCard.gradingCompany ?? 'PSA'} ${refCard.grade}`
      : GRADES[Math.floor(rand() * GRADES.length)];

    const baseValue = refCard?.currentValue
      ? refCard.currentValue * (0.6 + rand() * 0.8)
      : 20 + Math.floor(rand() * 980);

    const estimatedValue = Math.round(baseValue * 100) / 100;
    const bidRatio = 0.4 + rand() * 0.55; // 40-95% of value
    const currentBid = Math.round(estimatedValue * bidRatio * 100) / 100;
    const startPrice = Math.round(currentBid * (0.3 + rand() * 0.4) * 100) / 100;
    const bidCount = Math.floor(rand() * 30);

    // Time remaining: some ending soon, some far out
    const timeCategory = rand();
    let timeRemaining: number;
    if (timeCategory < 0.25) {
      timeRemaining = Math.floor(rand() * ONE_HOUR); // <1hr
    } else if (timeCategory < 0.5) {
      timeRemaining = ONE_HOUR + Math.floor(rand() * (SIX_HOURS - ONE_HOUR)); // 1-6hr
    } else {
      timeRemaining = SIX_HOURS + Math.floor(rand() * 3 * 86400); // 6hr-3d
    }

    const endTime = new Date(now.getTime() + timeRemaining * 1000).toISOString();
    const watchers = Math.floor(rand() * 40);
    const isHot = watchers > 20 || bidCount > 15;

    listings.push({
      id: `auction-${seed}-${i}`,
      player,
      year,
      manufacturer,
      set,
      sport,
      grade,
      currentBid,
      bidCount,
      startPrice,
      estimatedValue,
      timeRemaining,
      endTime,
      seller: SELLERS[Math.floor(rand() * SELLERS.length)],
      condition: CONDITIONS[Math.floor(rand() * CONDITIONS.length)],
      image: '',
      watchers,
      isHot,
    });
  }

  return listings;
}

/**
 * Determine competition level from auction metrics.
 */
function getCompetitionLevel(listing: AuctionListing): CompetitionLevel {
  const score = listing.bidCount * 2 + listing.watchers;
  if (score >= 50) return 'fierce';
  if (score >= 25) return 'high';
  if (score >= 10) return 'medium';
  return 'low';
}

/**
 * Analyze a listing and return the optimal sniper strategy.
 */
export function analyzeListing(listing: AuctionListing): SniperAnalysis {
  const competitionLevel = getCompetitionLevel(listing);
  const fairValue = listing.estimatedValue;
  const bidPct = listing.currentBid / fairValue;

  let strategy: SniperStrategy;
  let rationale: string;
  let riskLevel: RiskLevel;

  // Determine strategy
  if (bidPct > 0.95) {
    strategy = 'skip';
    rationale = 'Current bid is at or above fair market value. No margin for profit.';
    riskLevel = 'high';
  } else if (listing.timeRemaining < ONE_HOUR && listing.bidCount < 10) {
    strategy = 'snipe';
    rationale = `Auction ending soon with only ${listing.bidCount} bids. Low competition creates a snipe window.`;
    riskLevel = 'low';
  } else if (bidPct < 0.6 && listing.watchers < 10) {
    strategy = 'early_bid';
    rationale = 'Significantly undervalued with low watcher count. An early bid may deter competition.';
    riskLevel = 'medium';
  } else if (bidPct < 0.85) {
    strategy = 'watch';
    rationale = 'Fair value range. Monitor for last-minute opportunity or if competition drops.';
    riskLevel = 'medium';
  } else {
    strategy = 'skip';
    rationale = 'Price is near estimated value with significant competition. Limited upside.';
    riskLevel = 'high';
  }

  // Adjust risk for fierce competition
  if (competitionLevel === 'fierce' && strategy !== 'skip') {
    riskLevel = 'high';
    rationale += ' High competition detected — proceed with caution.';
  }

  const maxBid = calculateOptimalBid(listing);
  const bidTiming = getBidTimingRecommendation(listing);
  const expectedSavings = Math.max(0, Math.round((fairValue - maxBid) * 100) / 100);

  // Confidence scoring
  let confidence = 50;
  if (strategy === 'snipe') confidence = 70 + (listing.bidCount < 5 ? 15 : 0) + (listing.watchers < 5 ? 10 : 0);
  if (strategy === 'early_bid') confidence = 60 + (bidPct < 0.5 ? 20 : 10);
  if (strategy === 'watch') confidence = 40 + (bidPct < 0.7 ? 15 : 0);
  if (strategy === 'skip') confidence = 80; // high confidence in the recommendation to skip
  confidence = Math.min(100, Math.max(0, confidence));

  return {
    listing,
    fairValue,
    maxBid,
    confidence,
    strategy,
    bidTiming,
    expectedSavings,
    riskLevel,
    competitionLevel,
    rationale,
  };
}

/**
 * Calculate the optimal maximum bid price.
 * Returns 85-95% of estimated value depending on competition level.
 */
export function calculateOptimalBid(listing: AuctionListing): number {
  const competition = getCompetitionLevel(listing);

  let bidPct: number;
  switch (competition) {
    case 'fierce': bidPct = 0.95; break;
    case 'high':   bidPct = 0.92; break;
    case 'medium': bidPct = 0.89; break;
    case 'low':    bidPct = 0.85; break;
  }

  const optimalBid = Math.round(listing.estimatedValue * bidPct * 100) / 100;
  // Never bid below the current bid
  return Math.max(optimalBid, listing.currentBid + 0.50);
}

/**
 * Generate alerts for active listings.
 */
export function getAuctionAlerts(listings: AuctionListing[]): AuctionAlert[] {
  const alerts: AuctionAlert[] = [];
  const now = new Date().toISOString();

  for (const listing of listings) {
    // Ending soon (< 1 hour)
    if (listing.timeRemaining < ONE_HOUR && listing.timeRemaining > 0) {
      const mins = Math.floor(listing.timeRemaining / 60);
      alerts.push({
        id: `alert-ending-${listing.id}`,
        listingId: listing.id,
        type: 'ending_soon',
        message: `${listing.player} ${listing.year} ${listing.grade} ending in ${mins} minutes!`,
        severity: listing.timeRemaining < 600 ? 'critical' : 'warning',
        createdAt: now,
      });
    }

    // Below value (< 70% of estimated value)
    if (listing.currentBid < listing.estimatedValue * 0.7) {
      const discount = Math.round((1 - listing.currentBid / listing.estimatedValue) * 100);
      alerts.push({
        id: `alert-value-${listing.id}`,
        listingId: listing.id,
        type: 'below_value',
        message: `${listing.player} is ${discount}% below estimated value ($${listing.currentBid} vs $${listing.estimatedValue.toFixed(2)})`,
        severity: discount > 40 ? 'critical' : 'warning',
        createdAt: now,
      });
    }

    // Price drop heuristic: if bid is below start price (simulated)
    if (listing.currentBid < listing.startPrice * 1.1 && listing.bidCount > 3) {
      alerts.push({
        id: `alert-pricedrop-${listing.id}`,
        listingId: listing.id,
        type: 'price_drop',
        message: `${listing.player} has barely moved from start price despite ${listing.bidCount} bids`,
        severity: 'info',
        createdAt: now,
      });
    }

    // Hot new listing
    if (listing.isHot && listing.timeRemaining > SIX_HOURS) {
      alerts.push({
        id: `alert-new-${listing.id}`,
        listingId: listing.id,
        type: 'new_listing',
        message: `Hot listing: ${listing.player} ${listing.year} ${listing.grade} with ${listing.watchers} watchers`,
        severity: 'info',
        createdAt: now,
      });
    }
  }

  return alerts;
}

/**
 * Get the optimal seconds-before-end to place a bid.
 * Returns 3-30 seconds depending on competition level.
 */
export function getBidTimingRecommendation(listing: AuctionListing): number {
  const competition = getCompetitionLevel(listing);

  switch (competition) {
    case 'fierce': return 3;   // Last possible second
    case 'high':   return 7;   // Very tight window
    case 'medium': return 15;  // Moderate buffer
    case 'low':    return 30;  // Comfortable window
  }
}

/**
 * Compute summary statistics across all active listings.
 */
export function getAuctionStats(listings: AuctionListing[]): AuctionStats {
  if (listings.length === 0) {
    return { totalActive: 0, endingSoon: 0, avgDiscount: 0, totalPotentialSavings: 0 };
  }

  const endingSoon = listings.filter(l => l.timeRemaining < ONE_HOUR).length;

  const discounts = listings.map(l => {
    if (l.estimatedValue <= 0) return 0;
    return Math.max(0, (l.estimatedValue - l.currentBid) / l.estimatedValue);
  });
  const avgDiscount = Math.round((discounts.reduce((a, b) => a + b, 0) / discounts.length) * 100);

  const totalPotentialSavings = Math.round(
    listings.reduce((sum, l) => sum + Math.max(0, l.estimatedValue - l.currentBid), 0) * 100
  ) / 100;

  return {
    totalActive: listings.length,
    endingSoon,
    avgDiscount,
    totalPotentialSavings,
  };
}

// ── localStorage persistence ────────────────────────────────────────────────────

export function getWatchedAuctions(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function watchAuction(listingId: string): void {
  const watched = getWatchedAuctions();
  if (!watched.includes(listingId)) {
    watched.push(listingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }
}

export function unwatchAuction(listingId: string): void {
  const watched = getWatchedAuctions().filter(id => id !== listingId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
}

export function isAuctionWatched(listingId: string): boolean {
  return getWatchedAuctions().includes(listingId);
}
