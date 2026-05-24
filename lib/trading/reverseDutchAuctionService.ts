// Reverse Dutch Auction Engine Service

// ---- Types ----

export interface DutchAuction {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  grade: string;
  gradingCompany: 'PSA' | 'BGS' | 'SGC' | 'CGC';
  imageUrl?: string;
  openingPrice: number;
  currentPrice: number;
  floorPrice: number;
  decrementAmount: number;
  decrementInterval: string;
  nextDecrement: string;
  decrementCount: number;
  maxDecrements: number;
  seller: string;
  sellerRating: number;
  startedAt: string;
  expiresAt: string;
  watcherCount: number;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
  fairMarketValue: number;
  discountVsFMV: number;
}

export interface DutchAuctionBid {
  auctionId: string;
  bidderId: string;
  bidPrice: number;
  savedVsOpening: number;
  timestamp: string;
}

export interface DutchAuctionHistory {
  auctionId: string;
  cardName: string;
  openingPrice: number;
  finalPrice: number;
  decrementsTaken: number;
  totalTimeDays: number;
  buyerSaving: number;
  sellerResult: 'satisfied' | 'accepted floor' | 'expired';
}

export interface DutchAuctionStats {
  totalActive: number;
  avgDiscount: number;
  avgDecrementsToSale: number;
  buyerAvgSaving: number;
  successRate: number;
  totalVolumeThisMonth: number;
}

export interface DutchAuctionAlert {
  auctionId: string;
  cardName: string;
  message: string;
  currentPrice: number;
  fairMarketValue: number;
  nextDecrement: string;
  savings: number;
}

export interface MyListing {
  id: string;
  cardName: string;
  openingPrice: number;
  currentPrice: number;
  floorPrice: number;
  decrementAmount: number;
  decrementInterval: string;
  watcherCount: number;
  status: 'active' | 'sold' | 'expired';
  startedAt: string;
}

// ---- Mock Data ----

const NOW = new Date('2026-03-18T14:00:00Z');

function hoursFromNow(hours: number): string {
  const d = new Date(NOW.getTime() + hours * 3600 * 1000);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date(NOW.getTime() - days * 86400 * 1000);
  return d.toISOString();
}

const ACTIVE_AUCTIONS: DutchAuction[] = [
  {
    id: 'rda-001',
    cardName: '2003-04 Upper Deck Exquisite LeBron James Rookie Patch Auto #/99',
    player: 'LeBron James',
    sport: 'Basketball',
    year: 2003,
    set: 'Upper Deck Exquisite',
    grade: '9',
    gradingCompany: 'PSA',
    openingPrice: 48000,
    currentPrice: 36000,
    floorPrice: 28000,
    decrementAmount: 2000,
    decrementInterval: '12 hours',
    nextDecrement: hoursFromNow(3.5),
    decrementCount: 6,
    maxDecrements: 10,
    seller: 'VaultKing_Cards',
    sellerRating: 4.9,
    startedAt: daysAgo(3),
    expiresAt: hoursFromNow(48),
    watcherCount: 214,
    status: 'active',
    fairMarketValue: 42000,
    discountVsFMV: 14.3,
  },
  {
    id: 'rda-002',
    cardName: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    sport: 'Baseball',
    year: 1952,
    set: 'Topps',
    grade: '6',
    gradingCompany: 'PSA',
    openingPrice: 120000,
    currentPrice: 105000,
    floorPrice: 85000,
    decrementAmount: 5000,
    decrementInterval: '24 hours',
    nextDecrement: hoursFromNow(18),
    decrementCount: 3,
    maxDecrements: 7,
    seller: 'VintageVault88',
    sellerRating: 5.0,
    startedAt: daysAgo(3),
    expiresAt: hoursFromNow(96),
    watcherCount: 488,
    status: 'active',
    fairMarketValue: 115000,
    discountVsFMV: 8.7,
  },
  {
    id: 'rda-003',
    cardName: '2000 Bowman Chrome Tom Brady Rookie Auto #/100',
    player: 'Tom Brady',
    sport: 'Football',
    year: 2000,
    set: 'Bowman Chrome',
    grade: '9.5',
    gradingCompany: 'BGS',
    openingPrice: 22000,
    currentPrice: 14500,
    floorPrice: 10000,
    decrementAmount: 1500,
    decrementInterval: '6 hours',
    nextDecrement: hoursFromNow(1.2),
    decrementCount: 5,
    maxDecrements: 8,
    seller: 'GridironGems',
    sellerRating: 4.8,
    startedAt: daysAgo(1.25),
    expiresAt: hoursFromNow(18),
    watcherCount: 167,
    status: 'active',
    fairMarketValue: 19500,
    discountVsFMV: 25.6,
  },
  {
    id: 'rda-004',
    cardName: '2009-10 National Treasures Stephen Curry Rookie Patch Auto #/99',
    player: 'Stephen Curry',
    sport: 'Basketball',
    year: 2009,
    set: 'National Treasures',
    grade: '8.5',
    gradingCompany: 'BGS',
    openingPrice: 35000,
    currentPrice: 33500,
    floorPrice: 22000,
    decrementAmount: 1500,
    decrementInterval: '8 hours',
    nextDecrement: hoursFromNow(6.8),
    decrementCount: 1,
    maxDecrements: 9,
    seller: 'NBACardCo',
    sellerRating: 4.7,
    startedAt: daysAgo(0.35),
    expiresAt: hoursFromNow(72),
    watcherCount: 312,
    status: 'active',
    fairMarketValue: 38000,
    discountVsFMV: 11.8,
  },
  {
    id: 'rda-005',
    cardName: '1986-87 Fleer Michael Jordan Rookie #57',
    player: 'Michael Jordan',
    sport: 'Basketball',
    year: 1986,
    set: 'Fleer',
    grade: '8',
    gradingCompany: 'PSA',
    openingPrice: 18500,
    currentPrice: 11500,
    floorPrice: 8000,
    decrementAmount: 1000,
    decrementInterval: '6 hours',
    nextDecrement: hoursFromNow(0.75),
    decrementCount: 7,
    maxDecrements: 10,
    seller: 'Jordan_Only',
    sellerRating: 4.6,
    startedAt: daysAgo(1.75),
    expiresAt: hoursFromNow(12),
    watcherCount: 391,
    status: 'active',
    fairMarketValue: 14000,
    discountVsFMV: 17.9,
  },
  {
    id: 'rda-006',
    cardName: '2011 Topps Update Mike Trout Rookie #US175',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2011,
    set: 'Topps Update',
    grade: '10',
    gradingCompany: 'PSA',
    openingPrice: 9500,
    currentPrice: 9500,
    floorPrice: 6000,
    decrementAmount: 500,
    decrementInterval: '6 hours',
    nextDecrement: hoursFromNow(5.5),
    decrementCount: 0,
    maxDecrements: 7,
    seller: 'AngelsFan_Cards',
    sellerRating: 4.9,
    startedAt: daysAgo(0.1),
    expiresAt: hoursFromNow(42),
    watcherCount: 98,
    status: 'active',
    fairMarketValue: 9800,
    discountVsFMV: 3.1,
  },
  {
    id: 'rda-007',
    cardName: '2018-19 Prizm Luka Doncic Silver Rookie #280',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2018,
    set: 'Prizm',
    grade: '10',
    gradingCompany: 'PSA',
    openingPrice: 7200,
    currentPrice: 5700,
    floorPrice: 3500,
    decrementAmount: 300,
    decrementInterval: '6 hours',
    nextDecrement: hoursFromNow(2.1),
    decrementCount: 5,
    maxDecrements: 12,
    seller: 'MavsCardShop',
    sellerRating: 4.8,
    startedAt: daysAgo(1.25),
    expiresAt: hoursFromNow(36),
    watcherCount: 221,
    status: 'active',
    fairMarketValue: 6800,
    discountVsFMV: 16.2,
  },
  {
    id: 'rda-008',
    cardName: '1979 Topps Wayne Gretzky Rookie #18',
    player: 'Wayne Gretzky',
    sport: 'Hockey',
    year: 1979,
    set: 'Topps',
    grade: '7',
    gradingCompany: 'PSA',
    openingPrice: 14000,
    currentPrice: 11750,
    floorPrice: 9000,
    decrementAmount: 750,
    decrementInterval: '12 hours',
    nextDecrement: hoursFromNow(9.3),
    decrementCount: 3,
    maxDecrements: 7,
    seller: 'IceCardVault',
    sellerRating: 4.7,
    startedAt: daysAgo(1.5),
    expiresAt: hoursFromNow(48),
    watcherCount: 143,
    status: 'active',
    fairMarketValue: 13200,
    discountVsFMV: 10.9,
  },
  {
    id: 'rda-009',
    cardName: '2020 Topps Chrome Justin Herbert Auto Rookie #RA-JH',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Topps Chrome',
    grade: '10',
    gradingCompany: 'PSA',
    openingPrice: 3200,
    currentPrice: 2750,
    floorPrice: 1800,
    decrementAmount: 150,
    decrementInterval: '8 hours',
    nextDecrement: hoursFromNow(4.6),
    decrementCount: 3,
    maxDecrements: 9,
    seller: 'ChargersCardCo',
    sellerRating: 4.5,
    startedAt: daysAgo(1),
    expiresAt: hoursFromNow(48),
    watcherCount: 77,
    status: 'active',
    fairMarketValue: 3000,
    discountVsFMV: 8.3,
  },
  {
    id: 'rda-010',
    cardName: '2021 Panini Prizm Ja Morant Silver #65',
    player: 'Ja Morant',
    sport: 'Basketball',
    year: 2021,
    set: 'Prizm',
    grade: '10',
    gradingCompany: 'BGS',
    openingPrice: 2800,
    currentPrice: 1750,
    floorPrice: 1200,
    decrementAmount: 150,
    decrementInterval: '6 hours',
    nextDecrement: hoursFromNow(1.9),
    decrementCount: 7,
    maxDecrements: 11,
    seller: 'GrizzlyCardCave',
    sellerRating: 4.6,
    startedAt: daysAgo(1.75),
    expiresAt: hoursFromNow(16),
    watcherCount: 109,
    status: 'active',
    fairMarketValue: 2400,
    discountVsFMV: 27.1,
  },
];

const AUCTION_HISTORY: DutchAuctionHistory[] = [
  {
    auctionId: 'rda-h001',
    cardName: '2003 Topps Chrome LeBron James Rookie #111 PSA 10',
    openingPrice: 12000,
    finalPrice: 8500,
    decrementsTaken: 7,
    totalTimeDays: 3.5,
    buyerSaving: 3500,
    sellerResult: 'satisfied',
  },
  {
    auctionId: 'rda-h002',
    cardName: '1969 Topps Reggie Jackson Rookie #260 PSA 7',
    openingPrice: 6800,
    finalPrice: 4800,
    decrementsTaken: 4,
    totalTimeDays: 4,
    buyerSaving: 2000,
    sellerResult: 'satisfied',
  },
  {
    auctionId: 'rda-h003',
    cardName: '2019 Prizm Zion Williamson Silver Rookie PSA 10',
    openingPrice: 4500,
    finalPrice: 2200,
    decrementsTaken: 10,
    totalTimeDays: 2.5,
    buyerSaving: 2300,
    sellerResult: 'accepted floor',
  },
  {
    auctionId: 'rda-h004',
    cardName: '1996-97 Topps Chrome Kobe Bryant Rookie #138 BGS 9.5',
    openingPrice: 8800,
    finalPrice: 7600,
    decrementsTaken: 3,
    totalTimeDays: 1.5,
    buyerSaving: 1200,
    sellerResult: 'satisfied',
  },
  {
    auctionId: 'rda-h005',
    cardName: '2016 Bowman Chrome Corey Seager Auto #/500 PSA 9',
    openingPrice: 1800,
    finalPrice: 900,
    decrementsTaken: 9,
    totalTimeDays: 5,
    buyerSaving: 900,
    sellerResult: 'accepted floor',
  },
  {
    auctionId: 'rda-h006',
    cardName: '2021 Topps Chrome Julio Rodriguez Auto Rookie PSA 10',
    openingPrice: 2200,
    finalPrice: 1550,
    decrementsTaken: 5,
    totalTimeDays: 2,
    buyerSaving: 650,
    sellerResult: 'satisfied',
  },
  {
    auctionId: 'rda-h007',
    cardName: '1958 Topps Jim Brown Rookie #62 PSA 5',
    openingPrice: 9500,
    finalPrice: 9500,
    decrementsTaken: 0,
    totalTimeDays: 0.5,
    buyerSaving: 0,
    sellerResult: 'satisfied',
  },
  {
    auctionId: 'rda-h008',
    cardName: '2020 Prizm Patrick Mahomes Silver PSA 10',
    openingPrice: 3800,
    finalPrice: 2800,
    decrementsTaken: 4,
    totalTimeDays: 1.3,
    buyerSaving: 1000,
    sellerResult: 'satisfied',
  },
];

const MY_LISTINGS: MyListing[] = [
  {
    id: 'my-001',
    cardName: '2022 Prizm Sauce Gardner Silver Rookie PSA 10',
    openingPrice: 950,
    currentPrice: 800,
    floorPrice: 500,
    decrementAmount: 50,
    decrementInterval: '8 hours',
    watcherCount: 23,
    status: 'active',
    startedAt: daysAgo(1),
  },
  {
    id: 'my-002',
    cardName: '2018 National Treasures Patrick Mahomes RPA #/99 BGS 9',
    openingPrice: 18000,
    currentPrice: 16500,
    floorPrice: 12000,
    decrementAmount: 750,
    decrementInterval: '12 hours',
    watcherCount: 88,
    status: 'active',
    startedAt: daysAgo(1),
  },
  {
    id: 'my-003',
    cardName: '2000-01 Topps Chrome Dwyane Wade Rookie #253 PSA 9',
    openingPrice: 2400,
    currentPrice: 2400,
    floorPrice: 1500,
    decrementAmount: 100,
    decrementInterval: '6 hours',
    watcherCount: 11,
    status: 'active',
    startedAt: daysAgo(0.05),
  },
];

// ---- Price trajectory helper ----
function buildPriceTrajectory(auction: DutchAuction): { step: string; price: number; fmv: number }[] {
  const points = [];
  for (let i = 0; i <= auction.maxDecrements; i++) {
    const price = Math.max(auction.openingPrice - i * auction.decrementAmount, auction.floorPrice);
    points.push({
      step: i === 0 ? 'Open' : `T-${i}`,
      price,
      fmv: auction.fairMarketValue,
    });
    if (price === auction.floorPrice) break;
  }
  return points;
}

// ---- Exported Functions ----

export function getActiveAuctions(): DutchAuction[] {
  return ACTIVE_AUCTIONS;
}

export function getAuctionById(id: string): DutchAuction | undefined {
  return ACTIVE_AUCTIONS.find(a => a.id === id);
}

export function getDutchAuctionStats(): DutchAuctionStats {
  const active = ACTIVE_AUCTIONS.filter(a => a.status === 'active');
  const avgDiscount = active.reduce((s, a) => s + ((a.openingPrice - a.currentPrice) / a.openingPrice) * 100, 0) / active.length;
  const avgDecrementsToSale = AUCTION_HISTORY.reduce((s, h) => s + h.decrementsTaken, 0) / AUCTION_HISTORY.length;
  const buyerAvgSaving = AUCTION_HISTORY.reduce((s, h) => s + h.buyerSaving, 0) / AUCTION_HISTORY.length;
  const successRate = (AUCTION_HISTORY.filter(h => h.sellerResult !== 'expired').length / AUCTION_HISTORY.length) * 100;
  const totalVolumeThisMonth = AUCTION_HISTORY.reduce((s, h) => s + h.finalPrice, 0) + active.reduce((s, a) => s + a.currentPrice, 0);
  return {
    totalActive: active.length,
    avgDiscount: parseFloat(avgDiscount.toFixed(1)),
    avgDecrementsToSale: parseFloat(avgDecrementsToSale.toFixed(1)),
    buyerAvgSaving: Math.round(buyerAvgSaving),
    successRate: parseFloat(successRate.toFixed(1)),
    totalVolumeThisMonth: Math.round(totalVolumeThisMonth),
  };
}

export function getDutchAuctionAlerts(): DutchAuctionAlert[] {
  return ACTIVE_AUCTIONS.filter(a => {
    const remainingDecrements = a.maxDecrements - a.decrementCount;
    const discountFromFMV = ((a.fairMarketValue - a.currentPrice) / a.fairMarketValue) * 100;
    return remainingDecrements <= 3 || discountFromFMV >= 15;
  }).map(a => {
    const discountFromFMV = ((a.fairMarketValue - a.currentPrice) / a.fairMarketValue) * 100;
    const remainingDecrements = a.maxDecrements - a.decrementCount;
    let message: string;
    if (remainingDecrements <= 2) {
      message = `Only ${remainingDecrements} decrements left before floor — buy now or lose it!`;
    } else if (discountFromFMV >= 20) {
      message = `${discountFromFMV.toFixed(0)}% below fair market value — exceptional deal window open`;
    } else {
      message = `Approaching floor — ${remainingDecrements} drops remaining at current pace`;
    }
    return {
      auctionId: a.id,
      cardName: a.cardName,
      message,
      currentPrice: a.currentPrice,
      fairMarketValue: a.fairMarketValue,
      nextDecrement: a.nextDecrement,
      savings: a.fairMarketValue - a.currentPrice,
    };
  });
}

export function getAuctionHistory(): DutchAuctionHistory[] {
  return AUCTION_HISTORY;
}

export function getMyListings(): MyListing[] {
  return MY_LISTINGS;
}

export function getPriceTrajectory(auctionId: string): { step: string; price: number; fmv: number }[] {
  const auction = getAuctionById(auctionId);
  if (!auction) return [];
  return buildPriceTrajectory(auction);
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

export function formatCountdown(isoDate: string): string {
  const now = new Date('2026-03-18T14:00:00Z').getTime();
  const target = new Date(isoDate).getTime();
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
