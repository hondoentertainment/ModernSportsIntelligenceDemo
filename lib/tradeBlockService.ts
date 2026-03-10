import { CardInventory, Sport } from '../types';

// ---- Types ----

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'expired';

export interface TradeBlockListing {
  id: string;
  cardId: string;
  askPrice: number;
  minAcceptable: number;
  preferences: string;
  listedAt: string;
  isActive: boolean;
}

export interface TradeOffer {
  id: string;
  listingId: string;
  cardId: string;
  offererName: string;
  offererReputation: number; // 1-5 stars
  offerAmount: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
  respondedAt?: string;
  counterAmount?: number;
}

export interface TradeHistory {
  id: string;
  cardId: string;
  player: string;
  sport: Sport;
  askPrice: number;
  finalPrice: number;
  purchasePrice: number;
  offererName: string;
  completedAt: string;
  roi: number;
}

export interface PackageDeal {
  id: string;
  cardIds: string[];
  cards: Array<{ id: string; player: string; sport: Sport; currentValue: number }>;
  combinedValue: number;
  packagePrice: number;
  discount: number;
  fairnessScore: number; // 0-100
  suggestedAsk: number;
}

// ---- Constants ----

const STORAGE_LISTINGS = 'msi_trade_block';
const STORAGE_OFFERS = 'msi_trade_offers';
const STORAGE_HISTORY = 'msi_trade_history';

const OFFERER_FIRST_NAMES = [
  'Marcus', 'Jalen', 'Derek', 'Tony', 'Carlos',
  'Brandon', 'Nate', 'Victor', 'Kai', 'Leo',
  'Aiden', 'Caleb', 'Ethan', 'Ryu', 'Omar',
  'Deshawn', 'Isaiah', 'Malik', 'Terrence', 'Hector',
];

const OFFERER_LAST_NAMES = [
  'Rivera', 'Johnson', 'Chen', 'Williams', 'Nakamura',
  'Garcia', 'Thompson', 'Mitchell', 'Kim', 'Petrov',
  'Barnes', 'Sullivan', 'Okafor', 'Reeves', 'Santos',
  'Harrington', 'DeLuca', 'Park', 'Molina', 'Cross',
];

const OFFER_MESSAGES = [
  'Interested in this card for my PC. Let me know!',
  'Fair offer based on recent comps.',
  'Looking to add this to my collection. Firm on price.',
  'Will pay quickly via PayPal. Can we work something out?',
  'Great card! Hope my offer is competitive.',
  'Been looking for this one. Willing to negotiate.',
  'Solid offer based on eBay sold listings.',
  'Would love to add this to my set build.',
  'Cash ready. Can do a quick deal.',
  'Serious buyer here. Let me know your thoughts.',
];

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function seededInt(seed: number, offset: number, min: number, max: number): number {
  return Math.floor(seededRange(seed, offset, min, max));
}

// ---- localStorage helpers ----

function loadListings(): TradeBlockListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_LISTINGS);
    if (!raw) return [];
    return JSON.parse(raw) as TradeBlockListing[];
  } catch {
    return [];
  }
}

function saveListings(listings: TradeBlockListing[]): void {
  try {
    localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(listings));
  } catch {
    // quota exceeded
  }
}

function loadOffers(): TradeOffer[] {
  try {
    const raw = localStorage.getItem(STORAGE_OFFERS);
    if (!raw) return [];
    return JSON.parse(raw) as TradeOffer[];
  } catch {
    return [];
  }
}

function saveOffers(offers: TradeOffer[]): void {
  try {
    localStorage.setItem(STORAGE_OFFERS, JSON.stringify(offers));
  } catch {
    // quota exceeded
  }
}

function loadHistory(): TradeHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as TradeHistory[];
  } catch {
    return [];
  }
}

function saveHistory(history: TradeHistory[]): void {
  try {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
  } catch {
    // quota exceeded
  }
}

// ---- Trade Block Management ----

export function addToTradeBlock(
  cardId: string,
  askPrice: number,
  minAcceptable: number,
  preferences: string,
): TradeBlockListing {
  const listings = loadListings();

  // Remove existing listing for this card if any
  const filtered = listings.filter(l => l.cardId !== cardId);

  const listing: TradeBlockListing = {
    id: `tb-${cardId}-${Date.now()}`,
    cardId,
    askPrice,
    minAcceptable,
    preferences,
    listedAt: new Date().toISOString(),
    isActive: true,
  };

  filtered.push(listing);
  saveListings(filtered);
  return listing;
}

export function removeFromTradeBlock(cardId: string): void {
  const listings = loadListings();
  const updated = listings.filter(l => l.cardId !== cardId);
  saveListings(updated);

  // Also remove any pending offers for this card
  const offers = loadOffers();
  const updatedOffers = offers.map(o =>
    o.cardId === cardId && o.status === 'pending'
      ? { ...o, status: 'expired' as OfferStatus, respondedAt: new Date().toISOString() }
      : o,
  );
  saveOffers(updatedOffers);
}

export function getTradeBlock(): TradeBlockListing[] {
  return loadListings().filter(l => l.isActive);
}

// ---- Simulated Offer Generation ----

export function generateSimulatedOffers(
  listings: TradeBlockListing[],
  inventory: CardInventory[],
): TradeOffer[] {
  if (listings.length === 0) return [];

  const seed = dateSeed();
  const existingOffers = loadOffers();
  const newOffers: TradeOffer[] = [];

  for (const listing of listings) {
    if (!listing.isActive) continue;

    const card = inventory.find(c => c.id === listing.cardId);
    if (!card) continue;

    const cardHash = hashString(listing.cardId + card.player);
    const cardSeed = seed + cardHash;

    // Generate 3-8 offers per listing deterministically
    const offerCount = seededInt(cardSeed, 10, 3, 9);

    for (let i = 0; i < offerCount; i++) {
      const offerId = `offer-${listing.cardId}-${seed}-${i}`;

      // Skip if this offer already exists
      if (existingOffers.some(o => o.id === offerId)) continue;

      const firstIdx = seededInt(cardSeed, 20 + i * 10, 0, OFFERER_FIRST_NAMES.length);
      const lastIdx = seededInt(cardSeed, 21 + i * 10, 0, OFFERER_LAST_NAMES.length);
      const offererName = `${OFFERER_FIRST_NAMES[firstIdx]} ${OFFERER_LAST_NAMES[lastIdx]}`;

      const reputation = Math.round(seededRange(cardSeed, 22 + i * 10, 1, 5) * 10) / 10;

      // Offer amount: range from 60% to 120% of ask price, skewed toward lower
      const offerRatio = seededRange(cardSeed, 23 + i * 10, 0.6, 1.2);
      const offerAmount = Math.round(listing.askPrice * offerRatio * 100) / 100;

      const msgIdx = seededInt(cardSeed, 24 + i * 10, 0, OFFER_MESSAGES.length);

      // Determine offer age (0-72 hours ago)
      const hoursAgo = seededRange(cardSeed, 25 + i * 10, 0, 72);
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - hoursAgo);

      newOffers.push({
        id: offerId,
        listingId: listing.id,
        cardId: listing.cardId,
        offererName,
        offererReputation: Math.min(5, Math.max(1, reputation)),
        offerAmount,
        message: OFFER_MESSAGES[msgIdx],
        status: 'pending',
        createdAt: createdAt.toISOString(),
      });
    }
  }

  if (newOffers.length > 0) {
    const allOffers = [...existingOffers, ...newOffers];
    saveOffers(allOffers);
  }

  // Return all pending offers for the given listings
  const listingCardIds = new Set(listings.map(l => l.cardId));
  return [...existingOffers, ...newOffers]
    .filter(o => listingCardIds.has(o.cardId) && o.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ---- Offer Evaluation ----

export function evaluateOffer(
  offer: TradeOffer,
  listing: TradeBlockListing,
  card: CardInventory,
): { recommendation: 'accept' | 'counter' | 'decline'; confidence: number; reasoning: string } {
  const marketValue = card.currentValue ?? card.purchasePrice;
  const scarcity = card.scarcityIndex ?? 50;
  const liquidity = card.liquidityScore ?? 50;

  const offerToAsk = offer.offerAmount / listing.askPrice;
  const offerToMarket = offer.offerAmount / marketValue;
  const offerToMin = offer.offerAmount / listing.minAcceptable;

  // Score components
  let score = 0;
  const reasons: string[] = [];

  // Price analysis
  if (offerToAsk >= 0.95) {
    score += 40;
    reasons.push(`Offer is ${(offerToAsk * 100).toFixed(0)}% of ask price - excellent`);
  } else if (offerToAsk >= 0.85) {
    score += 25;
    reasons.push(`Offer is ${(offerToAsk * 100).toFixed(0)}% of ask price - reasonable`);
  } else if (offerToAsk >= 0.70) {
    score += 10;
    reasons.push(`Offer is ${(offerToAsk * 100).toFixed(0)}% of ask price - below target`);
  } else {
    score -= 10;
    reasons.push(`Offer is only ${(offerToAsk * 100).toFixed(0)}% of ask price - lowball`);
  }

  // Market value comparison
  if (offerToMarket >= 1.1) {
    score += 30;
    reasons.push('Offer exceeds current market value');
  } else if (offerToMarket >= 0.9) {
    score += 15;
    reasons.push('Offer is near market value');
  } else {
    score -= 5;
    reasons.push('Offer is below market value');
  }

  // Scarcity factor - rare cards should command higher premiums
  if (scarcity > 75) {
    score -= 10;
    reasons.push('High scarcity card - hold for premium');
  } else if (scarcity < 30) {
    score += 10;
    reasons.push('Low scarcity - good liquidity play');
  }

  // Buyer reputation
  if (offer.offererReputation >= 4.5) {
    score += 10;
    reasons.push(`Buyer reputation is excellent (${offer.offererReputation.toFixed(1)} stars)`);
  } else if (offer.offererReputation < 3.0) {
    score -= 10;
    reasons.push(`Buyer reputation is low (${offer.offererReputation.toFixed(1)} stars) - higher risk`);
  }

  // Minimum acceptable check
  if (offerToMin < 1.0) {
    score -= 20;
    reasons.push('Offer is below your minimum acceptable price');
  }

  // Liquidity factor
  if (liquidity < 30 && offerToAsk >= 0.80) {
    score += 10;
    reasons.push('Low liquidity card - consider accepting reasonable offers');
  }

  // Determine recommendation
  let recommendation: 'accept' | 'counter' | 'decline';
  let confidence: number;

  if (score >= 50) {
    recommendation = 'accept';
    confidence = Math.min(95, 60 + score - 50);
  } else if (score >= 15) {
    recommendation = 'counter';
    confidence = Math.min(85, 50 + score);
  } else {
    recommendation = 'decline';
    confidence = Math.min(90, 60 + Math.abs(score));
  }

  return {
    recommendation,
    confidence,
    reasoning: reasons.join('. ') + '.',
  };
}

// ---- Offer Actions ----

export function acceptOffer(offerId: string): void {
  const offers = loadOffers();
  const offerIdx = offers.findIndex(o => o.id === offerId);
  if (offerIdx === -1) return;

  const offer = offers[offerIdx];
  offers[offerIdx] = {
    ...offer,
    status: 'accepted',
    respondedAt: new Date().toISOString(),
  };

  // Expire other pending offers for the same card
  for (let i = 0; i < offers.length; i++) {
    if (i !== offerIdx && offers[i].cardId === offer.cardId && offers[i].status === 'pending') {
      offers[i] = { ...offers[i], status: 'expired', respondedAt: new Date().toISOString() };
    }
  }

  saveOffers(offers);

  // Remove from trade block
  const listings = loadListings();
  const updatedListings = listings.filter(l => l.cardId !== offer.cardId);
  saveListings(updatedListings);

  // Add to trade history - need card info from listing
  const listing = listings.find(l => l.cardId === offer.cardId);
  if (listing) {
    const history = loadHistory();
    history.push({
      id: `th-${offer.cardId}-${Date.now()}`,
      cardId: offer.cardId,
      player: '',  // Will be enriched when displayed
      sport: 'Baseball',  // Default; enriched at display time
      askPrice: listing.askPrice,
      finalPrice: offer.offerAmount,
      purchasePrice: 0,  // Enriched at display time
      offererName: offer.offererName,
      completedAt: new Date().toISOString(),
      roi: 0,  // Enriched at display time
    });
    saveHistory(history);
  }
}

export function declineOffer(offerId: string): void {
  const offers = loadOffers();
  const updated = offers.map(o =>
    o.id === offerId
      ? { ...o, status: 'declined' as OfferStatus, respondedAt: new Date().toISOString() }
      : o,
  );
  saveOffers(updated);
}

export function counterOffer(offerId: string, counterAmount: number): void {
  const offers = loadOffers();
  const updated = offers.map(o =>
    o.id === offerId
      ? {
          ...o,
          status: 'countered' as OfferStatus,
          respondedAt: new Date().toISOString(),
          counterAmount,
        }
      : o,
  );
  saveOffers(updated);
}

// ---- Package Deals ----

export function createPackageDeal(cardIds: string[], inventory: CardInventory[]): PackageDeal {
  const cards = inventory
    .filter(c => cardIds.includes(c.id))
    .map(c => ({
      id: c.id,
      player: c.player,
      sport: c.sport,
      currentValue: c.currentValue ?? c.purchasePrice,
    }));

  const combinedValue = cards.reduce((sum, c) => sum + c.currentValue, 0);

  // Bundle discount: 5-15% depending on count
  const discountRate = Math.min(0.15, 0.05 + cards.length * 0.02);
  const discount = Math.round(combinedValue * discountRate * 100) / 100;
  const packagePrice = Math.round((combinedValue - discount) * 100) / 100;

  // Fairness score based on spread of card values
  const values = cards.map(c => c.currentValue);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const spread = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;
  // Packages with more even value distribution score higher
  const fairnessScore = Math.round(Math.max(20, 100 - spread * 60 - discountRate * 100));

  const suggestedAsk = Math.round(packagePrice * 1.05 * 100) / 100;

  return {
    id: `pkg-${Date.now()}`,
    cardIds,
    cards,
    combinedValue: Math.round(combinedValue * 100) / 100,
    packagePrice,
    discount,
    fairnessScore: Math.min(100, fairnessScore),
    suggestedAsk,
  };
}

// ---- Trade History ----

export function getTradeHistory(): TradeHistory[] {
  return loadHistory().sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

// ---- Trade Stats ----

export function getTradeStats(inventory: CardInventory[]): {
  activeListings: number;
  pendingOffers: number;
  completedTrades: number;
  avgTradeROI: number;
} {
  const listings = getTradeBlock();
  const offers = loadOffers().filter(o => o.status === 'pending');
  const history = loadHistory();

  // Enrich history ROI with inventory data
  let totalROI = 0;
  let roiCount = 0;
  for (const trade of history) {
    const card = inventory.find(c => c.id === trade.cardId);
    if (card) {
      const purchasePrice = card.purchasePrice;
      if (purchasePrice > 0) {
        const roi = ((trade.finalPrice - purchasePrice) / purchasePrice) * 100;
        totalROI += roi;
        roiCount++;
      }
    }
  }

  return {
    activeListings: listings.length,
    pendingOffers: offers.length,
    completedTrades: history.length,
    avgTradeROI: roiCount > 0 ? Math.round((totalROI / roiCount) * 100) / 100 : 0,
  };
}
