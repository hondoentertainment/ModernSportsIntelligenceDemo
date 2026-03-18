import { store } from './dal/syncStore';

// P2P Marketplace — Peer-to-Peer Trading Marketplace
// Community-driven sports card trading with listings, offers, reputation system,
// deal scoring, and marketplace analytics.

import {
  fetchCounterparties,
  fetchListingOffers,
  fetchMarketplaceListings,
  insertTrustEvent,
  upsertCounterpartyProfile,
  upsertListingOffer,
  upsertMarketplaceListing,
} from './differentiatorData';

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type ListingStatus = 'active' | 'sold' | 'pending';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
export type Sport = 'Basketball' | 'Baseball' | 'Football' | 'Hockey' | 'Soccer';
export type CardGrade = 'PSA 10' | 'PSA 9' | 'PSA 8' | 'PSA 7' | 'BGS 9.5' | 'BGS 10' | 'SGC 10' | 'SGC 9.5' | 'Raw';
export type CardCondition = 'Mint' | 'Near Mint' | 'Excellent' | 'Very Good' | 'Good' | 'Fair';

export interface Listing {
  id: string;
  seller: string;
  sellerId: string;
  player: string;
  cardDescription: string;
  askingPrice: number;
  marketValue: number;
  images: string[];
  sport: Sport;
  grade: CardGrade;
  condition: CardCondition;
  createdAt: string;
  status: ListingStatus;
  views: number;
  watchers: number;
  offerCount: number;
  year: number;
  set: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyer: string;
  buyerId: string;
  amount: number;
  status: OfferStatus;
  message: string;
  createdAt: string;
  expiresAt: string;
  listingTitle: string;
}

export interface SellerProfile {
  id: string;
  username: string;
  rating: number;
  totalSales: number;
  totalVolume: number;
  memberSince: string;
  verified: boolean;
  avatar: string;
  responseTime: string;
  completionRate: number;
  activeListing: number;
}

export interface MarketplaceStats {
  activeListings: number;
  totalVolume: number;
  avgPrice: number;
  totalSellers: number;
  totalOffers: number;
  avgDealScore: number;
  listingsLast24h: number;
  salesLast7d: number;
}

// ── Storage ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_p2p_marketplace_v1';

function loadStorage(): { listings: Listing[]; offers: Offer[]; sellers: SellerProfile[] } | null {
  return store.get<{ listings: Listing[]; offers: Offer[]; sellers: SellerProfile[] } | null>(STORAGE_KEY, null);
}

function _saveStorage(data: { listings: Listing[]; offers: Offer[]; sellers: SellerProfile[] }): void {
  store.set(STORAGE_KEY, data);
}

// ── Mock Sellers ────────────────────────────────────────────────────────────────

const MOCK_SELLERS: SellerProfile[] = [
  { id: 'S001', username: 'CardVaultKing', rating: 4.9, totalSales: 342, totalVolume: 187400, memberSince: '2021-03-15', verified: true, avatar: '👑', responseTime: '< 1 hour', completionRate: 99.1, activeListing: 18 },
  { id: 'S002', username: 'SlabMaster99', rating: 4.8, totalSales: 278, totalVolume: 145200, memberSince: '2020-11-02', verified: true, avatar: '🏆', responseTime: '< 2 hours', completionRate: 98.5, activeListing: 12 },
  { id: 'S003', username: 'RookieHunter', rating: 4.7, totalSales: 195, totalVolume: 98700, memberSince: '2022-01-20', verified: true, avatar: '🎯', responseTime: '< 3 hours', completionRate: 97.8, activeListing: 9 },
  { id: 'S004', username: 'GradedGems', rating: 4.6, totalSales: 167, totalVolume: 82300, memberSince: '2022-06-11', verified: true, avatar: '💎', responseTime: '< 4 hours', completionRate: 96.2, activeListing: 14 },
  { id: 'S005', username: 'VintageVault', rating: 4.5, totalSales: 134, totalVolume: 214800, memberSince: '2019-08-03', verified: true, avatar: '🏛️', responseTime: '< 6 hours', completionRate: 95.0, activeListing: 7 },
  { id: 'S006', username: 'HoopsDreams', rating: 4.4, totalSales: 89, totalVolume: 45600, memberSince: '2023-02-14', verified: false, avatar: '🏀', responseTime: '< 8 hours', completionRate: 94.3, activeListing: 6 },
  { id: 'S007', username: 'DiamondDeals', rating: 4.3, totalSales: 76, totalVolume: 38200, memberSince: '2023-05-22', verified: false, avatar: '⚾', responseTime: '< 12 hours', completionRate: 93.1, activeListing: 5 },
  { id: 'S008', username: 'GridironCards', rating: 4.2, totalSales: 61, totalVolume: 29400, memberSince: '2023-09-10', verified: false, avatar: '🏈', responseTime: '< 24 hours', completionRate: 91.8, activeListing: 4 },
];

// ── Mock Listings ───────────────────────────────────────────────────────────────

const MOCK_LISTINGS: Listing[] = [
  {
    id: 'L001', seller: 'CardVaultKing', sellerId: 'S001', player: 'Luka Doncic',
    cardDescription: '2018-19 Panini Prizm Silver #280 Rookie', askingPrice: 1850, marketValue: 2100,
    images: ['/cards/doncic-prizm.jpg'], sport: 'Basketball', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-10T14:30:00Z', status: 'active', views: 342, watchers: 28, offerCount: 4, year: 2018, set: 'Panini Prizm',
  },
  {
    id: 'L002', seller: 'SlabMaster99', sellerId: 'S002', player: 'Victor Wembanyama',
    cardDescription: '2023-24 Panini Prizm Silver #225 Rookie', askingPrice: 3200, marketValue: 3500,
    images: ['/cards/wemby-prizm.jpg'], sport: 'Basketball', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-09T10:15:00Z', status: 'active', views: 891, watchers: 67, offerCount: 9, year: 2023, set: 'Panini Prizm',
  },
  {
    id: 'L003', seller: 'RookieHunter', sellerId: 'S003', player: 'Shohei Ohtani',
    cardDescription: '2018 Topps Chrome Update #HMT1 Rookie', askingPrice: 2400, marketValue: 2750,
    images: ['/cards/ohtani-chrome.jpg'], sport: 'Baseball', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-08T08:45:00Z', status: 'active', views: 567, watchers: 41, offerCount: 6, year: 2018, set: 'Topps Chrome',
  },
  {
    id: 'L004', seller: 'GradedGems', sellerId: 'S004', player: 'Patrick Mahomes',
    cardDescription: '2017 Panini Prizm Silver #269 Rookie', askingPrice: 4100, marketValue: 4500,
    images: ['/cards/mahomes-prizm.jpg'], sport: 'Football', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-07T16:20:00Z', status: 'active', views: 723, watchers: 55, offerCount: 7, year: 2017, set: 'Panini Prizm',
  },
  {
    id: 'L005', seller: 'VintageVault', sellerId: 'S005', player: 'Michael Jordan',
    cardDescription: '1986-87 Fleer #57 Rookie', askingPrice: 28500, marketValue: 32000,
    images: ['/cards/jordan-fleer.jpg'], sport: 'Basketball', grade: 'PSA 8', condition: 'Near Mint',
    createdAt: '2026-03-06T11:00:00Z', status: 'active', views: 1243, watchers: 89, offerCount: 3, year: 1986, set: 'Fleer',
  },
  {
    id: 'L006', seller: 'CardVaultKing', sellerId: 'S001', player: 'Jayson Tatum',
    cardDescription: '2017-18 Panini Prizm Silver #16 Rookie', askingPrice: 620, marketValue: 700,
    images: ['/cards/tatum-prizm.jpg'], sport: 'Basketball', grade: 'PSA 9', condition: 'Mint',
    createdAt: '2026-03-10T09:00:00Z', status: 'active', views: 198, watchers: 15, offerCount: 2, year: 2017, set: 'Panini Prizm',
  },
  {
    id: 'L007', seller: 'HoopsDreams', sellerId: 'S006', player: 'Connor McDavid',
    cardDescription: '2015-16 Upper Deck Young Guns #201 Rookie', askingPrice: 1100, marketValue: 1350,
    images: ['/cards/mcdavid-yg.jpg'], sport: 'Hockey', grade: 'BGS 9.5', condition: 'Mint',
    createdAt: '2026-03-09T15:30:00Z', status: 'active', views: 312, watchers: 22, offerCount: 3, year: 2015, set: 'Upper Deck',
  },
  {
    id: 'L008', seller: 'DiamondDeals', sellerId: 'S007', player: 'Juan Soto',
    cardDescription: '2018 Topps Update #US300 Rookie', askingPrice: 380, marketValue: 420,
    images: ['/cards/soto-topps.jpg'], sport: 'Baseball', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-08T12:10:00Z', status: 'active', views: 145, watchers: 11, offerCount: 1, year: 2018, set: 'Topps Update',
  },
  {
    id: 'L009', seller: 'GridironCards', sellerId: 'S008', player: 'Caleb Williams',
    cardDescription: '2024 Panini Prizm Silver #301 Rookie', askingPrice: 750, marketValue: 850,
    images: ['/cards/williams-prizm.jpg'], sport: 'Football', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-07T19:45:00Z', status: 'active', views: 478, watchers: 35, offerCount: 5, year: 2024, set: 'Panini Prizm',
  },
  {
    id: 'L010', seller: 'SlabMaster99', sellerId: 'S002', player: 'Jude Bellingham',
    cardDescription: '2020-21 Topps Chrome UCL #74 Rookie', askingPrice: 560, marketValue: 650,
    images: ['/cards/bellingham-chrome.jpg'], sport: 'Soccer', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-06T07:30:00Z', status: 'active', views: 267, watchers: 19, offerCount: 2, year: 2020, set: 'Topps Chrome UCL',
  },
  {
    id: 'L011', seller: 'RookieHunter', sellerId: 'S003', player: 'Anthony Edwards',
    cardDescription: '2020-21 Panini Prizm Silver #258 Rookie', askingPrice: 920, marketValue: 1050,
    images: ['/cards/edwards-prizm.jpg'], sport: 'Basketball', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-05T13:20:00Z', status: 'active', views: 389, watchers: 30, offerCount: 4, year: 2020, set: 'Panini Prizm',
  },
  {
    id: 'L012', seller: 'GradedGems', sellerId: 'S004', player: 'Ken Griffey Jr.',
    cardDescription: '1989 Upper Deck #1 Rookie', askingPrice: 1650, marketValue: 1900,
    images: ['/cards/griffey-ud.jpg'], sport: 'Baseball', grade: 'PSA 9', condition: 'Mint',
    createdAt: '2026-03-04T10:00:00Z', status: 'active', views: 534, watchers: 38, offerCount: 3, year: 1989, set: 'Upper Deck',
  },
  {
    id: 'L013', seller: 'VintageVault', sellerId: 'S005', player: 'Wayne Gretzky',
    cardDescription: '1979-80 O-Pee-Chee #18 Rookie', askingPrice: 45000, marketValue: 52000,
    images: ['/cards/gretzky-opc.jpg'], sport: 'Hockey', grade: 'PSA 7', condition: 'Very Good',
    createdAt: '2026-03-03T09:00:00Z', status: 'active', views: 2145, watchers: 112, offerCount: 2, year: 1979, set: 'O-Pee-Chee',
  },
  {
    id: 'L014', seller: 'CardVaultKing', sellerId: 'S001', player: 'Chet Holmgren',
    cardDescription: '2022-23 Panini Prizm Silver #251 Rookie', askingPrice: 185, marketValue: 210,
    images: ['/cards/holmgren-prizm.jpg'], sport: 'Basketball', grade: 'PSA 10', condition: 'Mint',
    createdAt: '2026-03-11T08:15:00Z', status: 'active', views: 92, watchers: 7, offerCount: 1, year: 2022, set: 'Panini Prizm',
  },
  {
    id: 'L015', seller: 'CardVaultKing', sellerId: 'S001', player: 'Ja Morant',
    cardDescription: '2019-20 Panini Prizm Silver #249 Rookie', askingPrice: 480, marketValue: 520,
    images: ['/cards/morant-prizm.jpg'], sport: 'Basketball', grade: 'PSA 9', condition: 'Mint',
    createdAt: '2026-03-02T14:00:00Z', status: 'sold', views: 412, watchers: 31, offerCount: 6, year: 2019, set: 'Panini Prizm',
  },
  {
    id: 'L016', seller: 'HoopsDreams', sellerId: 'S006', player: 'Erling Haaland',
    cardDescription: '2019-20 Topps Chrome Bundesliga #72 Rookie', askingPrice: 890, marketValue: 980,
    images: ['/cards/haaland-chrome.jpg'], sport: 'Soccer', grade: 'BGS 9.5', condition: 'Mint',
    createdAt: '2026-03-01T11:30:00Z', status: 'pending', views: 356, watchers: 25, offerCount: 3, year: 2019, set: 'Topps Chrome',
  },
];

// ── Mock Offers ─────────────────────────────────────────────────────────────────

const MOCK_OFFERS: Offer[] = [
  { id: 'O001', listingId: 'L001', buyer: 'SneakerFlips23', buyerId: 'B001', amount: 1700, status: 'pending', message: 'Would you take $1,700? Can pay immediately.', createdAt: '2026-03-11T10:00:00Z', expiresAt: '2026-03-14T10:00:00Z', listingTitle: 'Luka Doncic 2018-19 Prizm Silver PSA 10' },
  { id: 'O002', listingId: 'L001', buyer: 'InvestorMike', buyerId: 'B002', amount: 1750, status: 'pending', message: 'Serious buyer. Willing to do $1,750.', createdAt: '2026-03-11T14:00:00Z', expiresAt: '2026-03-14T14:00:00Z', listingTitle: 'Luka Doncic 2018-19 Prizm Silver PSA 10' },
  { id: 'O003', listingId: 'L002', buyer: 'WembyFan2024', buyerId: 'B003', amount: 2900, status: 'pending', message: 'Big fan — please consider my offer!', createdAt: '2026-03-10T16:30:00Z', expiresAt: '2026-03-13T16:30:00Z', listingTitle: 'Victor Wembanyama 2023-24 Prizm Silver PSA 10' },
  { id: 'O004', listingId: 'L002', buyer: 'SlabCollector', buyerId: 'B004', amount: 3000, status: 'countered', message: 'Meet me at $3,000?', createdAt: '2026-03-10T09:00:00Z', expiresAt: '2026-03-13T09:00:00Z', listingTitle: 'Victor Wembanyama 2023-24 Prizm Silver PSA 10' },
  { id: 'O005', listingId: 'L004', buyer: 'ChiefsKingdom', buyerId: 'B005', amount: 3800, status: 'pending', message: 'Huge Chiefs fan. Would love to add this to my PC.', createdAt: '2026-03-09T20:00:00Z', expiresAt: '2026-03-12T20:00:00Z', listingTitle: 'Patrick Mahomes 2017 Prizm Silver PSA 10' },
  { id: 'O006', listingId: 'L005', buyer: 'VintageKing55', buyerId: 'B006', amount: 26000, status: 'rejected', message: 'Would you consider $26K?', createdAt: '2026-03-08T11:00:00Z', expiresAt: '2026-03-11T11:00:00Z', listingTitle: 'Michael Jordan 1986-87 Fleer #57 PSA 8' },
  { id: 'O007', listingId: 'L009', buyer: 'BearsNation', buyerId: 'B007', amount: 680, status: 'pending', message: 'Ready to pay ASAP.', createdAt: '2026-03-09T12:00:00Z', expiresAt: '2026-03-12T12:00:00Z', listingTitle: 'Caleb Williams 2024 Prizm Silver PSA 10' },
  { id: 'O008', listingId: 'L011', buyer: 'AntManFan', buyerId: 'B008', amount: 850, status: 'pending', message: 'Fair offer — lmk!', createdAt: '2026-03-07T15:00:00Z', expiresAt: '2026-03-10T15:00:00Z', listingTitle: 'Anthony Edwards 2020-21 Prizm Silver PSA 10' },
  { id: 'O009', listingId: 'L015', buyer: 'GrizzFanatic', buyerId: 'B009', amount: 480, status: 'accepted', message: 'Deal!', createdAt: '2026-03-03T09:00:00Z', expiresAt: '2026-03-06T09:00:00Z', listingTitle: 'Ja Morant 2019-20 Prizm Silver PSA 9' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

function dealScore(listing: Listing): number {
  if (listing.marketValue <= 0) return 50;
  const discount = ((listing.marketValue - listing.askingPrice) / listing.marketValue) * 100;
  return Math.min(99, Math.max(1, Math.round(50 + discount * 2)));
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function getActiveListings(): Listing[] {
  const stored = loadStorage();
  const listings = stored?.listings ?? MOCK_LISTINGS;
  return listings.filter(l => l.status === 'active').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAllListings(): Listing[] {
  const stored = loadStorage();
  return stored?.listings ?? MOCK_LISTINGS;
}

export function getMyListings(sellerId: string = 'S001'): Listing[] {
  const stored = loadStorage();
  const listings = stored?.listings ?? MOCK_LISTINGS;
  return listings.filter(l => l.sellerId === sellerId);
}

export function getOffers(listingId?: string): Offer[] {
  const stored = loadStorage();
  const offers = stored?.offers ?? MOCK_OFFERS;
  if (listingId) return offers.filter(o => o.listingId === listingId);
  return offers;
}

export function getMyOffers(buyerId: string = 'B001'): Offer[] {
  const stored = loadStorage();
  const offers = stored?.offers ?? MOCK_OFFERS;
  return offers.filter(o => o.buyerId === buyerId);
}

export function getTopSellers(): SellerProfile[] {
  const stored = loadStorage();
  const sellers = stored?.sellers ?? MOCK_SELLERS;
  return [...sellers].sort((a, b) => b.rating - a.rating);
}

export function getSellerProfile(sellerId: string): SellerProfile | undefined {
  const stored = loadStorage();
  const sellers = stored?.sellers ?? MOCK_SELLERS;
  return sellers.find(s => s.id === sellerId);
}

export function getMarketplaceStats(): MarketplaceStats {
  const listings = getAllListings();
  const active = listings.filter(l => l.status === 'active');
  const sold = listings.filter(l => l.status === 'sold');
  const offers = getOffers();
  const totalVolume = sold.reduce((sum, l) => sum + l.askingPrice, 0) + active.reduce((sum, l) => sum + l.askingPrice, 0);
  const avgPrice = active.length > 0 ? Math.round(active.reduce((s, l) => s + l.askingPrice, 0) / active.length) : 0;
  const now = Date.now();
  const last24h = active.filter(l => now - new Date(l.createdAt).getTime() < 86400000).length;
  const last7d = sold.filter(l => now - new Date(l.createdAt).getTime() < 604800000).length;

  return {
    activeListings: active.length,
    totalVolume,
    avgPrice,
    totalSellers: MOCK_SELLERS.length,
    totalOffers: offers.filter(o => o.status === 'pending').length,
    avgDealScore: Math.round(active.reduce((s, l) => s + dealScore(l), 0) / (active.length || 1)),
    listingsLast24h: last24h,
    salesLast7d: last7d,
  };
}

export function getListingDealScore(listing: Listing): number {
  return dealScore(listing);
}

export function getListingsByFilters(filters: {
  sport?: Sport;
  minPrice?: number;
  maxPrice?: number;
  grade?: CardGrade;
  condition?: CardCondition;
  search?: string;
}): Listing[] {
  let results = getActiveListings();
  if (filters.sport) results = results.filter(l => l.sport === filters.sport);
  if (filters.minPrice !== undefined) results = results.filter(l => l.askingPrice >= filters.minPrice!);
  if (filters.maxPrice !== undefined) results = results.filter(l => l.askingPrice <= filters.maxPrice!);
  if (filters.grade) results = results.filter(l => l.grade === filters.grade);
  if (filters.condition) results = results.filter(l => l.condition === filters.condition);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(l =>
      l.player.toLowerCase().includes(q) ||
      l.cardDescription.toLowerCase().includes(q) ||
      l.seller.toLowerCase().includes(q)
    );
  }
  return results;
}

// ── Cross-reference: Deal Room (Phase 85) ────────────────────────────────────
// Bridge functions to escalate P2P listings into encrypted deal rooms

import {
  getDealRooms,
  createDealRoom,
  getDealFlowStats,
  type DealRoom,
  type DealFlowStats,
} from './dealRoomService';

export interface ListingWithDealRoomOption {
  listing: Listing;
  dealScore: number;
  eligibleForDealRoom: boolean;
  existingDealRoom: DealRoom | null;
  dealRoomReason: string;
}

/**
 * Enriches P2P listings with Deal Room (Phase 85) integration.
 * High-value listings can be escalated to encrypted deal rooms
 * for institutional-grade negotiations.
 */
export function getListingsWithDealRoomOptions(): ListingWithDealRoomOption[] {
  const listings = getActiveListings();
  const dealRooms = getDealRooms();

  return listings.map(listing => {
    const score = dealScore(listing);
    const eligibleForDealRoom = listing.askingPrice >= 1000;

    // Check if a deal room already exists for this card/player
    const existingDealRoom = dealRooms.find(room =>
      room.card.player === listing.player &&
      room.status !== 'closed' && room.status !== 'expired'
    ) || null;

    let dealRoomReason: string;
    if (existingDealRoom) {
      dealRoomReason = `Active deal room exists: "${existingDealRoom.title}" (${existingDealRoom.status})`;
    } else if (!eligibleForDealRoom) {
      dealRoomReason = 'Card value below $1,000 — standard P2P listing recommended';
    } else if (listing.askingPrice >= 10000) {
      dealRoomReason = 'High-value card — encrypted deal room recommended for institutional buyers';
    } else {
      dealRoomReason = 'Eligible for deal room — useful for private negotiations with verified buyers';
    }

    return {
      listing,
      dealScore: score,
      eligibleForDealRoom,
      existingDealRoom,
      dealRoomReason,
    };
  });
}

/**
 * Escalates a P2P listing to an encrypted Deal Room.
 */
export function escalateToDealRoom(listing: Listing): DealRoom {
  return createDealRoom(
    {
      player: listing.player,
      description: listing.cardDescription,
      grade: listing.grade,
      estimatedValue: listing.marketValue,
    },
    'sell',
    listing.askingPrice,
  );
}

export function getCombinedMarketStats(): MarketplaceStats & { dealFlow: DealFlowStats } {
  const stats = getMarketplaceStats();
  const dealFlow = getDealFlowStats();
  return { ...stats, dealFlow };
}

export default {
  getActiveListings,
  getAllListings,
  getMyListings,
  getOffers,
  getMyOffers,
  getTopSellers,
  getSellerProfile,
  getMarketplaceStats,
  getListingDealScore,
  getListingsByFilters,
  getListingsWithDealRoomOptions,
  escalateToDealRoom,
  getCombinedMarketStats,
};

function mapVenueToSport(venueSport?: string): Sport {
  switch (venueSport) {
    case 'Baseball':
    case 'Football':
    case 'Hockey':
    case 'Soccer':
      return venueSport;
    default:
      return 'Basketball';
  }
}

function mapRiskToVerified(trustScore: number): boolean {
  return trustScore >= 70;
}

function mapCounterpartyToSellerProfile(counterparty: Awaited<ReturnType<typeof fetchCounterparties>>[number]): SellerProfile {
  return {
    id: counterparty.id,
    username: counterparty.displayName,
    rating: Number((counterparty.trustScore / 20).toFixed(1)),
    totalSales: counterparty.successfulDeals,
    totalVolume: counterparty.totalVolumeUsd || 0,
    memberSince: counterparty.createdAt,
    verified: mapRiskToVerified(counterparty.trustScore),
    avatar: '🤝',
    responseTime: counterparty.avgResponseHours ? `< ${Math.max(1, Math.round(counterparty.avgResponseHours))} hour${counterparty.avgResponseHours >= 2 ? 's' : ''}` : '< 24 hours',
    completionRate: Math.max(0, 100 - (counterparty.disputedDeals * 5)),
    activeListing: 0,
  };
}

function mapListingRecordToListing(record: Awaited<ReturnType<typeof fetchMarketplaceListings>>[number], sellerName?: string): Listing {
  return {
    id: record.id,
    seller: sellerName || 'MSI Market',
    sellerId: record.counterpartyId || record.ownerUserId || 'market',
    player: record.player,
    cardDescription: record.cardDescription,
    askingPrice: record.askingPrice,
    marketValue: record.estimatedMarketValue || record.askingPrice,
    images: record.imageUrl ? [record.imageUrl] : [],
    sport: mapVenueToSport(record.sport),
    grade: (record.grade as CardGrade) || 'Raw',
    condition: (record.condition as CardCondition) || 'Near Mint',
    createdAt: record.createdAt,
    status: record.status as ListingStatus,
    views: Number(record.metadata?.views || 0),
    watchers: Number(record.metadata?.watchers || 0),
    offerCount: Number(record.metadata?.offerCount || 0),
    year: record.year || new Date().getFullYear(),
    set: record.setName || 'Unknown Set',
  };
}

function mapOfferRecordToOffer(record: Awaited<ReturnType<typeof fetchListingOffers>>[number], listingTitle: string): Offer {
  return {
    id: record.id,
    listingId: record.listingId,
    buyer: ((record as any).metadata?.buyerName as string) || 'Marketplace Buyer',
    buyerId: record.buyerCounterpartyId || 'buyer',
    amount: record.amount,
    status: record.status,
    message: record.message || '',
    createdAt: record.createdAt,
    expiresAt: record.expiresAt || new Date(Date.now() + 3 * 86400000).toISOString(),
    listingTitle,
  };
}

export async function getActiveListingsAsync(userId?: string): Promise<Listing[]> {
  const [listings, counterparties] = await Promise.all([
    fetchMarketplaceListings(userId),
    fetchCounterparties(userId),
  ]);
  const sellerMap = new Map(counterparties.map(counterparty => [counterparty.id, counterparty.displayName]));
  return listings
    .filter(listing => listing.status === 'active')
    .map(listing => mapListingRecordToListing(listing, sellerMap.get(listing.counterpartyId || '')))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTopSellersAsync(userId?: string): Promise<SellerProfile[]> {
  const [counterparties, listings] = await Promise.all([
    fetchCounterparties(userId),
    fetchMarketplaceListings(userId),
  ]);
  const counts = listings.reduce<Record<string, number>>((acc, listing) => {
    const key = listing.counterpartyId || '';
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return counterparties
    .map(counterparty => ({
      ...mapCounterpartyToSellerProfile(counterparty),
      activeListing: counts[counterparty.id] || 0,
    }))
    .sort((a, b) => b.rating - a.rating);
}

export async function getOffersAsync(listingId?: string): Promise<Offer[]> {
  const [offers, listings] = await Promise.all([
    fetchListingOffers(listingId),
    fetchMarketplaceListings(),
  ]);
  const listingMap = new Map(listings.map(listing => [listing.id, listing.title]));
  return offers.map(offer => mapOfferRecordToOffer(offer, listingMap.get(offer.listingId) || 'Marketplace Listing'));
}

export async function createMarketplaceListing(input: {
  ownerUserId?: string | null;
  sellerName: string;
  marketplaceVenue?: 'ebay' | 'private' | 'internal';
  title: string;
  player: string;
  cardDescription: string;
  sport: Sport;
  askingPrice: number;
  estimatedMarketValue?: number;
  year?: number;
  set?: string;
  grade?: CardGrade;
  condition?: CardCondition;
  imageUrl?: string;
  listingUrl?: string;
}): Promise<Listing> {
  const sellerProfile = {
    id: crypto.randomUUID(),
    ownerUserId: input.ownerUserId || null,
    displayName: input.sellerName,
    marketplaceVenue: input.marketplaceVenue || 'internal',
    verificationTier: 'verified' as const,
    trustScore: 78,
    reputationScore: 80,
    successfulDeals: 0,
    disputedDeals: 0,
    riskLevel: 'low' as const,
    createdAt: new Date().toISOString(),
  };
  await upsertCounterpartyProfile(sellerProfile);

  const listingRecord = {
    id: crypto.randomUUID(),
    ownerUserId: input.ownerUserId || null,
    counterpartyId: sellerProfile.id,
    sourceVenue: input.marketplaceVenue || 'internal',
    title: input.title,
    player: input.player,
    cardDescription: input.cardDescription,
    sport: input.sport,
    year: input.year,
    setName: input.set,
    grade: input.grade,
    condition: input.condition,
    askingPrice: input.askingPrice,
    estimatedMarketValue: input.estimatedMarketValue,
    currency: 'USD',
    status: 'active' as const,
    listingUrl: input.listingUrl,
    imageUrl: input.imageUrl,
    metadata: { views: 0, watchers: 0, offerCount: 0 },
    createdAt: new Date().toISOString(),
  };

  await upsertMarketplaceListing(listingRecord);
  return mapListingRecordToListing(listingRecord, sellerProfile.displayName);
}

export async function submitMarketplaceOffer(input: {
  ownerUserId?: string | null;
  listing: Listing;
  buyerName: string;
  amount: number;
  message: string;
}): Promise<Offer> {
  const buyerProfile = {
    id: crypto.randomUUID(),
    ownerUserId: input.ownerUserId || null,
    displayName: input.buyerName,
    marketplaceVenue: 'private' as const,
    verificationTier: 'verified' as const,
    trustScore: 72,
    reputationScore: 74,
    successfulDeals: 0,
    disputedDeals: 0,
    riskLevel: 'medium' as const,
    createdAt: new Date().toISOString(),
  };
  await upsertCounterpartyProfile(buyerProfile);

  const record = {
    id: crypto.randomUUID(),
    listingId: input.listing.id,
    buyerCounterpartyId: buyerProfile.id,
    sellerCounterpartyId: input.listing.sellerId,
    amount: input.amount,
    currency: 'USD',
    status: 'pending' as const,
    message: input.message,
    sourceVenue: 'private' as const,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
  };

  await upsertListingOffer(record, input.ownerUserId);
  await insertTrustEvent({
    id: crypto.randomUUID(),
    counterpartyId: buyerProfile.id,
    eventType: 'offer_accepted',
    impactScore: 2,
    referenceType: 'offer',
    referenceId: record.id,
    notes: `Offer submitted for ${input.listing.player}`,
    createdAt: new Date().toISOString(),
  }, input.ownerUserId);

  return mapOfferRecordToOffer(record, `${input.listing.player} ${input.listing.cardDescription}`);
}
