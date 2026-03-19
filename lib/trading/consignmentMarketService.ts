import { store } from '../dal/syncStore';

// Consignment Marketplace Service — manage consignment houses, listings, fee comparison

// ── Types ──────────────────────────────────────────────────────────────

export interface FeeTier {
  tier: string;
  minValue: number;
  maxValue: number;
  feePercent: number;
}

export interface ConsignmentHouse {
  id: string;
  name: string;
  logo: string;
  description: string;
  feeStructure: FeeTier[];
  avgSellThrough: number;
  avgDaysToSell: number;
  specialties: string[];
  minConsignmentValue: number;
  paymentTerms: string;
  rating: number;
  reviewCount: number;
  website: string;
}

export interface ConsignmentListing {
  id: string;
  houseId: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  grade: string;
  estimatedValue: number;
  reservePrice: number;
  status: 'pending' | 'listed' | 'sold' | 'returned' | 'expired';
  listedDate: string;
  soldDate?: string;
  soldPrice?: number;
  fees: number;
  netProceeds?: number;
}

export interface ConsignmentComparison {
  cardValue: number;
  houses: {
    houseId: string;
    name: string;
    fee: number;
    feePercent: number;
    estimatedNet: number;
    avgDaysToSell: number;
    sellThrough: number;
  }[];
}

export interface ConsignmentStats {
  totalConsigned: number;
  activeListing: number;
  totalSold: number;
  totalNetProceeds: number;
  avgFeePercent: number;
  avgDaysToSell: number;
}

export interface HouseReview {
  id: string;
  houseId: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'msi_consignment_market';
const LISTINGS_KEY = `${STORAGE_PREFIX}_listings`;

// ── Mock Data ──────────────────────────────────────────────────────────

const CONSIGNMENT_HOUSES: ConsignmentHouse[] = [
  {
    id: 'pwcc',
    name: 'PWCC Marketplace',
    logo: '/logos/pwcc.png',
    description: 'Premier auction house for high-end sports cards with weekly auctions and vault storage.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 2500, feePercent: 10 },
      { tier: 'Premium', minValue: 2500, maxValue: 10000, feePercent: 8 },
      { tier: 'Elite', minValue: 10000, maxValue: Infinity, feePercent: 5 },
    ],
    avgSellThrough: 0.92,
    avgDaysToSell: 14,
    specialties: ['Baseball', 'Basketball', 'Vintage', 'High-End Modern'],
    minConsignmentValue: 250,
    paymentTerms: 'Net 30 after auction close',
    rating: 4.6,
    reviewCount: 1842,
    website: 'https://pwccmarketplace.com',
  },
  {
    id: 'heritage',
    name: 'Heritage Auctions',
    logo: '/logos/heritage.png',
    description: 'World-renowned auction house specializing in vintage and ultra-premium sports cards.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 5000, feePercent: 15 },
      { tier: 'Premium', minValue: 5000, maxValue: 25000, feePercent: 10 },
      { tier: 'Signature', minValue: 25000, maxValue: Infinity, feePercent: 7 },
    ],
    avgSellThrough: 0.95,
    avgDaysToSell: 45,
    specialties: ['Vintage', 'Pre-War', 'Ultra High-End', 'Complete Sets'],
    minConsignmentValue: 1000,
    paymentTerms: 'Net 45 after auction close',
    rating: 4.8,
    reviewCount: 3256,
    website: 'https://ha.com',
  },
  {
    id: 'goldin',
    name: 'Goldin Auctions',
    logo: '/logos/goldin.png',
    description: 'Leading auction house for modern and high-profile sports memorabilia and cards.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 5000, feePercent: 12 },
      { tier: 'Premium', minValue: 5000, maxValue: 20000, feePercent: 9 },
      { tier: 'Elite', minValue: 20000, maxValue: Infinity, feePercent: 6 },
    ],
    avgSellThrough: 0.90,
    avgDaysToSell: 21,
    specialties: ['Basketball', 'Football', 'Modern', 'Memorabilia'],
    minConsignmentValue: 500,
    paymentTerms: 'Net 30 after auction close',
    rating: 4.5,
    reviewCount: 1456,
    website: 'https://goldinauctions.com',
  },
  {
    id: 'myslabs',
    name: 'MySlabs',
    logo: '/logos/myslabs.png',
    description: 'Digital marketplace for graded cards with instant consignment and fast sales.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 1000, feePercent: 8 },
      { tier: 'Premium', minValue: 1000, maxValue: 5000, feePercent: 6 },
      { tier: 'VIP', minValue: 5000, maxValue: Infinity, feePercent: 4 },
    ],
    avgSellThrough: 0.78,
    avgDaysToSell: 10,
    specialties: ['Modern', 'Basketball', 'Football', 'Graded Cards'],
    minConsignmentValue: 50,
    paymentTerms: 'Net 7 after sale',
    rating: 4.2,
    reviewCount: 892,
    website: 'https://myslabs.com',
  },
  {
    id: 'comc',
    name: 'COMC',
    logo: '/logos/comc.png',
    description: 'Check Out My Cards — large volume consignment with fixed-price listings and vault storage.',
    feeStructure: [
      { tier: 'Basic', minValue: 0, maxValue: 500, feePercent: 7 },
      { tier: 'Standard', minValue: 500, maxValue: 2000, feePercent: 5 },
      { tier: 'Pro', minValue: 2000, maxValue: Infinity, feePercent: 3.5 },
    ],
    avgSellThrough: 0.70,
    avgDaysToSell: 30,
    specialties: ['Low-Mid Value', 'Bulk', 'Modern', 'Raw Cards'],
    minConsignmentValue: 1,
    paymentTerms: 'Net 14 after sale',
    rating: 3.9,
    reviewCount: 2104,
    website: 'https://comc.com',
  },
  {
    id: 'probstein',
    name: 'Probstein123',
    logo: '/logos/probstein.png',
    description: 'High-volume eBay consignment seller with competitive rates and fast turnaround.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 1000, feePercent: 15 },
      { tier: 'Premium', minValue: 1000, maxValue: 5000, feePercent: 12 },
      { tier: 'VIP', minValue: 5000, maxValue: Infinity, feePercent: 9 },
    ],
    avgSellThrough: 0.88,
    avgDaysToSell: 7,
    specialties: ['Baseball', 'Basketball', 'All Sports', 'High Volume'],
    minConsignmentValue: 25,
    paymentTerms: 'Net 21 after auction close',
    rating: 4.3,
    reviewCount: 5210,
    website: 'https://probstein123.com',
  },
  {
    id: 'lelands',
    name: 'Lelands',
    logo: '/logos/lelands.png',
    description: 'Premium auction house with over 70 years of history in sports collectibles.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 10000, feePercent: 12 },
      { tier: 'Premium', minValue: 10000, maxValue: 50000, feePercent: 8 },
      { tier: 'Elite', minValue: 50000, maxValue: Infinity, feePercent: 5 },
    ],
    avgSellThrough: 0.91,
    avgDaysToSell: 35,
    specialties: ['Vintage', 'Memorabilia', 'Game-Used', 'Historical'],
    minConsignmentValue: 500,
    paymentTerms: 'Net 45 after auction close',
    rating: 4.7,
    reviewCount: 978,
    website: 'https://lelands.com',
  },
  {
    id: 'scp',
    name: 'SCP Auctions',
    logo: '/logos/scp.png',
    description: 'Specializing in high-end vintage and game-used sports memorabilia auctions.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 5000, feePercent: 14 },
      { tier: 'Premium', minValue: 5000, maxValue: 25000, feePercent: 10 },
      { tier: 'Marquee', minValue: 25000, maxValue: Infinity, feePercent: 6 },
    ],
    avgSellThrough: 0.89,
    avgDaysToSell: 40,
    specialties: ['Game-Used', 'Autographs', 'Vintage', 'Championship Items'],
    minConsignmentValue: 750,
    paymentTerms: 'Net 60 after auction close',
    rating: 4.4,
    reviewCount: 654,
    website: 'https://scpauctions.com',
  },
  {
    id: 'pristine',
    name: 'Pristine Auction',
    logo: '/logos/pristine.png',
    description: 'Daily online auctions for sports cards and memorabilia at all price points.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 500, feePercent: 18 },
      { tier: 'Plus', minValue: 500, maxValue: 2000, feePercent: 14 },
      { tier: 'Premium', minValue: 2000, maxValue: Infinity, feePercent: 10 },
    ],
    avgSellThrough: 0.85,
    avgDaysToSell: 5,
    specialties: ['Modern', 'All Sports', 'Low-Mid Value', 'Daily Deals'],
    minConsignmentValue: 10,
    paymentTerms: 'Net 14 after auction close',
    rating: 3.8,
    reviewCount: 1340,
    website: 'https://pristineauction.com',
  },
  {
    id: 'relayx',
    name: 'Rally / Alt Marketplace',
    logo: '/logos/rally.png',
    description: 'Fractional ownership marketplace for ultra high-end sports cards and memorabilia.',
    feeStructure: [
      { tier: 'Standard', minValue: 0, maxValue: 50000, feePercent: 8 },
      { tier: 'Premium', minValue: 50000, maxValue: 250000, feePercent: 5 },
      { tier: 'Institutional', minValue: 250000, maxValue: Infinity, feePercent: 3 },
    ],
    avgSellThrough: 0.75,
    avgDaysToSell: 60,
    specialties: ['Ultra High-End', 'Investment Grade', 'Fractional', 'Trophy Cards'],
    minConsignmentValue: 10000,
    paymentTerms: 'Net 30 after offering closes',
    rating: 4.1,
    reviewCount: 312,
    website: 'https://rallyrd.com',
  },
];

const MOCK_LISTINGS: ConsignmentListing[] = [
  {
    id: 'cl-001',
    houseId: 'pwcc',
    cardName: '2020 Prizm Justin Herbert RC PSA 10',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    estimatedValue: 850,
    reservePrice: 700,
    status: 'listed',
    listedDate: '2025-12-01',
    fees: 85,
    netProceeds: undefined,
  },
  {
    id: 'cl-002',
    houseId: 'heritage',
    cardName: '1952 Topps Mickey Mantle #311 PSA 4',
    player: 'Mickey Mantle',
    sport: 'Baseball',
    year: 1952,
    set: 'Topps',
    grade: 'PSA 4',
    estimatedValue: 125000,
    reservePrice: 100000,
    status: 'sold',
    listedDate: '2025-10-15',
    soldDate: '2025-11-20',
    soldPrice: 132000,
    fees: 9240,
    netProceeds: 122760,
  },
  {
    id: 'cl-003',
    houseId: 'goldin',
    cardName: '2018 Prizm Luka Doncic RC PSA 10',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2018,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    estimatedValue: 4200,
    reservePrice: 3500,
    status: 'listed',
    listedDate: '2025-12-10',
    fees: 504,
    netProceeds: undefined,
  },
  {
    id: 'cl-004',
    houseId: 'myslabs',
    cardName: '2023 Topps Chrome Victor Wembanyama RC BGS 9.5',
    player: 'Victor Wembanyama',
    sport: 'Basketball',
    year: 2023,
    set: 'Topps Chrome',
    grade: 'BGS 9.5',
    estimatedValue: 620,
    reservePrice: 500,
    status: 'pending',
    listedDate: '2025-12-18',
    fees: 49.6,
    netProceeds: undefined,
  },
  {
    id: 'cl-005',
    houseId: 'comc',
    cardName: '2022 Topps Series 1 Julio Rodriguez RC',
    player: 'Julio Rodriguez',
    sport: 'Baseball',
    year: 2022,
    set: 'Topps Series 1',
    grade: 'Raw NM-MT',
    estimatedValue: 45,
    reservePrice: 30,
    status: 'sold',
    listedDate: '2025-09-01',
    soldDate: '2025-10-05',
    soldPrice: 42,
    fees: 2.94,
    netProceeds: 39.06,
  },
  {
    id: 'cl-006',
    houseId: 'probstein',
    cardName: '2019 Mosaic Ja Morant RC PSA 10',
    player: 'Ja Morant',
    sport: 'Basketball',
    year: 2019,
    set: 'Panini Mosaic',
    grade: 'PSA 10',
    estimatedValue: 180,
    reservePrice: 140,
    status: 'sold',
    listedDate: '2025-11-01',
    soldDate: '2025-11-08',
    soldPrice: 195,
    fees: 29.25,
    netProceeds: 165.75,
  },
  {
    id: 'cl-007',
    houseId: 'lelands',
    cardName: '1986 Fleer Michael Jordan RC PSA 8',
    player: 'Michael Jordan',
    sport: 'Basketball',
    year: 1986,
    set: 'Fleer',
    grade: 'PSA 8',
    estimatedValue: 28000,
    reservePrice: 25000,
    status: 'listed',
    listedDate: '2025-12-05',
    fees: 2240,
    netProceeds: undefined,
  },
  {
    id: 'cl-008',
    houseId: 'pristine',
    cardName: '2021 Donruss Optic Trevor Lawrence RC PSA 9',
    player: 'Trevor Lawrence',
    sport: 'Football',
    year: 2021,
    set: 'Donruss Optic',
    grade: 'PSA 9',
    estimatedValue: 75,
    reservePrice: 50,
    status: 'returned',
    listedDate: '2025-08-01',
    fees: 0,
    netProceeds: undefined,
  },
  {
    id: 'cl-009',
    houseId: 'pwcc',
    cardName: '2003 Topps Chrome LeBron James RC PSA 9',
    player: 'LeBron James',
    sport: 'Basketball',
    year: 2003,
    set: 'Topps Chrome',
    grade: 'PSA 9',
    estimatedValue: 18500,
    reservePrice: 16000,
    status: 'sold',
    listedDate: '2025-10-01',
    soldDate: '2025-10-14',
    soldPrice: 19200,
    fees: 960,
    netProceeds: 18240,
  },
  {
    id: 'cl-010',
    houseId: 'goldin',
    cardName: '2020 National Treasures Joe Burrow RPA /99 BGS 9',
    player: 'Joe Burrow',
    sport: 'Football',
    year: 2020,
    set: 'National Treasures',
    grade: 'BGS 9',
    estimatedValue: 8500,
    reservePrice: 7000,
    status: 'expired',
    listedDate: '2025-07-01',
    fees: 0,
    netProceeds: undefined,
  },
];

const MOCK_REVIEWS: HouseReview[] = [
  { id: 'r-001', houseId: 'pwcc', reviewer: 'CardCollector92', rating: 5, comment: 'Excellent results, sold above estimate. Fast communication.', date: '2025-11-15' },
  { id: 'r-002', houseId: 'pwcc', reviewer: 'InvestorMike', rating: 4, comment: 'Good sell-through but payment took a full 30 days.', date: '2025-10-22' },
  { id: 'r-003', houseId: 'heritage', reviewer: 'VintageKing', rating: 5, comment: 'Best auction house for vintage. Premium prices every time.', date: '2025-11-01' },
  { id: 'r-004', houseId: 'heritage', reviewer: 'MantelFan', rating: 5, comment: 'My 1952 Topps sold for over estimate. Worth the higher fees.', date: '2025-09-18' },
  { id: 'r-005', houseId: 'goldin', reviewer: 'HoopsTrader', rating: 4, comment: 'Great for basketball cards. Audience is very engaged.', date: '2025-12-01' },
  { id: 'r-006', houseId: 'goldin', reviewer: 'ModernCollector', rating: 5, comment: 'Sold my Luka for 15% above estimated value. Impressive.', date: '2025-11-10' },
  { id: 'r-007', houseId: 'myslabs', reviewer: 'QuickFlip', rating: 4, comment: 'Fast sales, low fees. Perfect for mid-range slabs.', date: '2025-10-05' },
  { id: 'r-008', houseId: 'myslabs', reviewer: 'SlabDealer', rating: 3, comment: 'Easy to use but sell-through rate could be better.', date: '2025-09-20' },
  { id: 'r-009', houseId: 'comc', reviewer: 'BulkSender', rating: 4, comment: 'Best option for large volume low-value cards. Vault is great.', date: '2025-11-25' },
  { id: 'r-010', houseId: 'comc', reviewer: 'SetBuilder', rating: 3, comment: 'Slow to sell but fees are the lowest. Good for patient sellers.', date: '2025-08-15' },
  { id: 'r-011', houseId: 'probstein', reviewer: 'eBayPro', rating: 5, comment: 'Fastest turnaround in the business. Cards sell in days.', date: '2025-12-08' },
  { id: 'r-012', houseId: 'probstein', reviewer: 'CardFlipKing', rating: 4, comment: 'Good results for mid-range cards. Fees are fair for eBay exposure.', date: '2025-10-30' },
  { id: 'r-013', houseId: 'lelands', reviewer: 'VintagePro', rating: 5, comment: 'Fantastic for high-end vintage. Professional catalog presentation.', date: '2025-09-12' },
  { id: 'r-014', houseId: 'scp', reviewer: 'MemorabiliaBuff', rating: 4, comment: 'Great for game-used items. Slower payment terms though.', date: '2025-11-05' },
  { id: 'r-015', houseId: 'pristine', reviewer: 'DailyDeals', rating: 3, comment: 'High fees for lower-value cards but sells very quickly.', date: '2025-10-15' },
  { id: 'r-016', houseId: 'relayx', reviewer: 'InvestorPro', rating: 4, comment: 'Interesting fractional model for trophy cards. Slow process though.', date: '2025-08-28' },
];

// ── Helper Functions ───────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getStatusColor(status: ConsignmentListing['status']): string {
  switch (status) {
    case 'pending': return 'text-yellow-400';
    case 'listed': return 'text-blue-400';
    case 'sold': return 'text-green-400';
    case 'returned': return 'text-orange-400';
    case 'expired': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getStatusLabel(status: ConsignmentListing['status']): string {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'listed': return 'Active Listing';
    case 'sold': return 'Sold';
    case 'returned': return 'Returned';
    case 'expired': return 'Expired';
    default: return 'Unknown';
  }
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 4.0) return 'text-blue-400';
  if (rating >= 3.5) return 'text-yellow-400';
  return 'text-red-400';
}

// ── Core Functions ─────────────────────────────────────────────────────

function getApplicableFeePercent(house: ConsignmentHouse, value: number): number {
  for (const tier of house.feeStructure) {
    if (value >= tier.minValue && value < tier.maxValue) {
      return tier.feePercent;
    }
  }
  // fallback to last tier
  return house.feeStructure[house.feeStructure.length - 1].feePercent;
}

export function getConsignmentHouses(): ConsignmentHouse[] {
  return [...CONSIGNMENT_HOUSES];
}

export function getHouseById(id: string): ConsignmentHouse | undefined {
  return CONSIGNMENT_HOUSES.find(h => h.id === id);
}

export function getMyListings(): ConsignmentListing[] {
  if (store.has(LISTINGS_KEY)) {
    return store.get<ConsignmentListing[]>(LISTINGS_KEY, [...MOCK_LISTINGS]);
  }
  return [...MOCK_LISTINGS];
}

export function addListing(listing: ConsignmentListing): ConsignmentListing[] {
  const listings = getMyListings();
  listings.push(listing);
  store.set(LISTINGS_KEY, listings);
  return listings;
}

export function updateListing(id: string, updates: Partial<ConsignmentListing>): ConsignmentListing[] {
  const listings = getMyListings();
  const idx = listings.findIndex(l => l.id === id);
  if (idx !== -1) {
    listings[idx] = { ...listings[idx], ...updates };
  }
  store.set(LISTINGS_KEY, listings);
  return listings;
}

export function compareHouses(cardValue: number): ConsignmentComparison {
  const houses = CONSIGNMENT_HOUSES
    .filter(h => cardValue >= h.minConsignmentValue)
    .map(h => {
      const feePercent = getApplicableFeePercent(h, cardValue);
      const fee = cardValue * (feePercent / 100);
      return {
        houseId: h.id,
        name: h.name,
        fee: Math.round(fee * 100) / 100,
        feePercent,
        estimatedNet: Math.round((cardValue - fee) * 100) / 100,
        avgDaysToSell: h.avgDaysToSell,
        sellThrough: h.avgSellThrough,
      };
    })
    .sort((a, b) => a.feePercent - b.feePercent);

  return { cardValue, houses };
}

export function getConsignmentStats(): ConsignmentStats {
  const listings = getMyListings();
  const sold = listings.filter(l => l.status === 'sold');
  const active = listings.filter(l => l.status === 'listed' || l.status === 'pending');

  const totalNetProceeds = sold.reduce((sum, l) => sum + (l.netProceeds ?? 0), 0);
  const totalSoldPrice = sold.reduce((sum, l) => sum + (l.soldPrice ?? 0), 0);
  const totalFees = sold.reduce((sum, l) => sum + l.fees, 0);

  const avgFeePercent = totalSoldPrice > 0 ? (totalFees / totalSoldPrice) * 100 : 0;

  // calculate average days to sell for sold items
  const daysToSell = sold
    .filter(l => l.listedDate && l.soldDate)
    .map(l => {
      const listed = new Date(l.listedDate).getTime();
      const soldDate = new Date(l.soldDate!).getTime();
      return Math.ceil((soldDate - listed) / (1000 * 60 * 60 * 24));
    });
  const avgDays = daysToSell.length > 0
    ? daysToSell.reduce((a, b) => a + b, 0) / daysToSell.length
    : 0;

  return {
    totalConsigned: listings.length,
    activeListing: active.length,
    totalSold: sold.length,
    totalNetProceeds: Math.round(totalNetProceeds * 100) / 100,
    avgFeePercent: Math.round(avgFeePercent * 100) / 100,
    avgDaysToSell: Math.round(avgDays * 100) / 100,
  };
}

export function getBestHouseFor(cardValue: number, sport: string): ConsignmentHouse | undefined {
  const eligible = CONSIGNMENT_HOUSES.filter(h =>
    cardValue >= h.minConsignmentValue &&
    h.specialties.some(s => s.toLowerCase() === sport.toLowerCase() || s.toLowerCase().includes(sport.toLowerCase()))
  );

  if (eligible.length === 0) return undefined;

  // Score: low fee + high sell-through + high rating
  return eligible.sort((a, b) => {
    const aFee = getApplicableFeePercent(a, cardValue);
    const bFee = getApplicableFeePercent(b, cardValue);
    const aScore = (a.avgSellThrough * 40) + ((5 - aFee / 5) * 30) + (a.rating * 30 / 5);
    const bScore = (b.avgSellThrough * 40) + ((5 - bFee / 5) * 30) + (b.rating * 30 / 5);
    return bScore - aScore;
  })[0];
}

export function getRecentSales(): ConsignmentListing[] {
  const listings = getMyListings();
  return listings
    .filter(l => l.status === 'sold')
    .sort((a, b) => new Date(b.soldDate!).getTime() - new Date(a.soldDate!).getTime());
}

export function getFeeCalculation(houseId: string, value: number): { house: string; value: number; feePercent: number; fee: number; net: number } | undefined {
  const house = CONSIGNMENT_HOUSES.find(h => h.id === houseId);
  if (!house) return undefined;

  const feePercent = getApplicableFeePercent(house, value);
  const fee = Math.round(value * (feePercent / 100) * 100) / 100;
  const net = Math.round((value - fee) * 100) / 100;

  return { house: house.name, value, feePercent, fee, net };
}

export function getHouseReviews(houseId: string): HouseReview[] {
  return MOCK_REVIEWS.filter(r => r.houseId === houseId);
}
