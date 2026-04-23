// @ts-nocheck
// Condition Census Tracker Service
// Intelligence network tracking known population of top-condition examples

export interface OwnerProfile {
  id: string;
  type: 'dealer' | 'collector' | 'institution' | 'auction_house' | 'unknown';
  name: string;
  region: string;
  acquisitionDate: string;
  acquisitionVenue: string;
  acquisitionPrice: number;
  confidence: number; // 0-100 confidence in owner identification
  publicProfile: boolean;
  estimatedNetWorth?: string;
  knownHoldings?: number;
}

export interface KnownExample {
  id: string;
  serialIdentifier: string; // e.g., PSA cert number
  grade: string;
  grader: 'PSA' | 'BGS' | 'SGC' | 'CGC';
  lastSaleVenue: string;
  lastSaleDate: string;
  lastSalePrice: number;
  currentOwner: OwnerProfile;
  provenanceChain: {
    owner: string;
    dateAcquired: string;
    venue: string;
    price: number;
  }[];
  condition: string;
  notes: string;
  imageUrl?: string;
  lastVerified: string;
}

export interface SurfaceProbability {
  cardId: string;
  sixMonthProbability: number;
  twelveMonthProbability: number;
  twentyFourMonthProbability: number;
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }[];
  nextLikelyVenue: string;
  estimatedNextPrice: number;
  historicalSurfaceRate: number; // average times per year one appears
}

export interface PopulationReport {
  cardId: string;
  cardName: string;
  year: number;
  manufacturer: string;
  cardNumber: string;
  sport: string;
  totalGraded: number;
  psa10Pop: number;
  psa9Pop: number;
  bgs10Pop: number;
  bgs95Pop: number;
  sgc10Pop: number;
  estimatedUngraded: number;
  estimatedSurviving: number;
  popHistory: {
    date: string;
    psa10: number;
    psa9: number;
    bgs10: number;
    bgs95: number;
    totalGraded: number;
  }[];
  lastUpdated: string;
}

export interface CensusCard {
  id: string;
  playerName: string;
  cardName: string;
  year: number;
  manufacturer: string;
  cardNumber: string;
  sport: 'basketball' | 'baseball' | 'football' | 'hockey' | 'soccer' | 'multi-sport';
  imageUrl: string;
  totalPop: number;
  topGradePop: number;
  topGrade: string;
  grader: string;
  estimatedSurviving: number;
  lastSalePrice: number;
  lastSaleDate: string;
  lastSaleVenue: string;
  rarityScore: number; // 1-100
  knownExamples: KnownExample[];
  surfaceProbability: SurfaceProbability;
  populationReport: PopulationReport;
  ownerDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  marketTrend: 'rising' | 'stable' | 'declining';
  category: 'ultra-rare' | 'rare' | 'scarce' | 'limited';
}

// --- Mock Data ---

const mockOwners: Record<string, OwnerProfile> = {
  privateCollector1: {
    id: 'own-001',
    type: 'collector',
    name: 'Private West Coast Collector',
    region: 'California, USA',
    acquisitionDate: '2024-08-15',
    acquisitionVenue: 'Heritage Auctions',
    acquisitionPrice: 3936000,
    confidence: 82,
    publicProfile: false,
    estimatedNetWorth: '$50M+',
    knownHoldings: 340,
  },
  dealer1: {
    id: 'own-002',
    type: 'dealer',
    name: 'PWCC Marketplace',
    region: 'Oregon, USA',
    acquisitionDate: '2023-11-20',
    acquisitionVenue: 'Private Sale',
    acquisitionPrice: 2100000,
    confidence: 95,
    publicProfile: true,
    knownHoldings: 12000,
  },
  institution1: {
    id: 'own-003',
    type: 'institution',
    name: 'Metropolitan Museum Sports Collection',
    region: 'New York, USA',
    acquisitionDate: '2022-05-10',
    acquisitionVenue: 'Sotheby\'s',
    acquisitionPrice: 5200000,
    confidence: 98,
    publicProfile: true,
    knownHoldings: 85,
  },
  unknown1: {
    id: 'own-004',
    type: 'unknown',
    name: 'Unknown (Asian Market)',
    region: 'East Asia',
    acquisitionDate: '2023-03-01',
    acquisitionVenue: 'Goldin Auctions',
    acquisitionPrice: 1850000,
    confidence: 25,
    publicProfile: false,
  },
  collector2: {
    id: 'own-005',
    type: 'collector',
    name: 'Ken Goldin Private Holdings',
    region: 'New Jersey, USA',
    acquisitionDate: '2024-02-28',
    acquisitionVenue: 'Goldin Auctions',
    acquisitionPrice: 4600000,
    confidence: 90,
    publicProfile: true,
    estimatedNetWorth: '$100M+',
    knownHoldings: 520,
  },
  auctionHouse1: {
    id: 'own-006',
    type: 'auction_house',
    name: 'Heritage Auctions Consignment',
    region: 'Texas, USA',
    acquisitionDate: '2025-01-15',
    acquisitionVenue: 'Consignment',
    acquisitionPrice: 0,
    confidence: 100,
    publicProfile: true,
    knownHoldings: 5000,
  },
  dealer2: {
    id: 'own-007',
    type: 'dealer',
    name: 'Probstein123',
    region: 'New Jersey, USA',
    acquisitionDate: '2024-06-10',
    acquisitionVenue: 'eBay Private',
    acquisitionPrice: 890000,
    confidence: 75,
    publicProfile: true,
    knownHoldings: 8000,
  },
  collector3: {
    id: 'own-008',
    type: 'collector',
    name: 'Anonymous European Collector',
    region: 'Switzerland',
    acquisitionDate: '2023-09-22',
    acquisitionVenue: 'Christie\'s',
    acquisitionPrice: 3200000,
    confidence: 40,
    publicProfile: false,
    estimatedNetWorth: '$200M+',
    knownHoldings: 120,
  },
};

function buildPopHistory(baseData: { psa10: number; psa9: number; bgs10: number; bgs95: number; total: number }) {
  const history = [];
  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  for (let i = 0; i < years.length; i++) {
    const factor = 0.7 + (i * 0.05);
    history.push({
      date: `${years[i]}-01-01`,
      psa10: Math.round(baseData.psa10 * factor),
      psa9: Math.round(baseData.psa9 * factor),
      bgs10: Math.round(baseData.bgs10 * factor),
      bgs95: Math.round(baseData.bgs95 * factor),
      totalGraded: Math.round(baseData.total * factor),
    });
  }
  return history;
}

function buildProvenanceChain(entries: { owner: string; date: string; venue: string; price: number }[]) {
  return entries.map(e => ({
    owner: e.owner,
    dateAcquired: e.date,
    venue: e.venue,
    price: e.price,
  }));
}

const censusCards: CensusCard[] = [
  {
    id: 'census-001',
    playerName: 'Michael Jordan',
    cardName: '1986 Fleer Michael Jordan #57',
    year: 1986,
    manufacturer: 'Fleer',
    cardNumber: '#57',
    sport: 'basketball',
    imageUrl: '/cards/jordan-fleer-86.jpg',
    totalPop: 8923,
    topGradePop: 316,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 25000,
    lastSalePrice: 3936000,
    lastSaleDate: '2024-08-15',
    lastSaleVenue: 'Heritage Auctions',
    rarityScore: 72,
    marketTrend: 'stable',
    category: 'limited',
    knownExamples: [
      {
        id: 'ex-001', serialIdentifier: 'PSA-10842756', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Heritage Auctions', lastSaleDate: '2024-08-15', lastSalePrice: 3936000,
        currentOwner: mockOwners.privateCollector1,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '1986-11-01', venue: 'Retail', price: 0 },
          { owner: 'Midwest Dealer', date: '1998-03-15', venue: 'Card Show', price: 1200 },
          { owner: 'PWCC Marketplace', date: '2016-07-20', venue: 'PWCC Auction', price: 120000 },
          { owner: 'Private West Coast Collector', date: '2024-08-15', venue: 'Heritage Auctions', price: 3936000 },
        ]),
        condition: 'Flawless centering, razor-sharp corners, pristine surface',
        notes: '47 known PSA 10 examples tracked by census. Last surfaced at Heritage Auctions 2024.',
        lastVerified: '2025-02-01',
      },
      {
        id: 'ex-002', serialIdentifier: 'PSA-08431290', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Goldin Auctions', lastSaleDate: '2023-03-01', lastSalePrice: 1850000,
        currentOwner: mockOwners.unknown1,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '1986-12-01', venue: 'Retail', price: 0 },
          { owner: 'East Coast Collector', date: '2003-06-10', venue: 'eBay', price: 8500 },
          { owner: 'Unknown (Asian Market)', date: '2023-03-01', venue: 'Goldin Auctions', price: 1850000 },
        ]),
        condition: 'Excellent centering, strong corners, clean reverse',
        notes: 'Shipped internationally after sale. Current location unconfirmed.',
        lastVerified: '2023-04-15',
      },
      {
        id: 'ex-003', serialIdentifier: 'PSA-12003847', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'PWCC Marketplace', lastSaleDate: '2021-05-22', lastSalePrice: 738000,
        currentOwner: mockOwners.dealer1,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '1987-01-15', venue: 'Retail', price: 0 },
          { owner: 'PWCC Marketplace', date: '2021-05-22', venue: 'PWCC Auction', price: 738000 },
        ]),
        condition: 'Strong eye appeal, slight off-center to left within tolerance',
        notes: 'Currently held in PWCC vault. May surface in upcoming premium auction.',
        lastVerified: '2025-01-20',
      },
    ],
    surfaceProbability: {
      cardId: 'census-001',
      sixMonthProbability: 34,
      twelveMonthProbability: 58,
      twentyFourMonthProbability: 79,
      factors: [
        { factor: 'Market Liquidity', impact: 'positive', weight: 0.3, description: 'High demand ensures quick sales' },
        { factor: 'Owner Tenure', impact: 'negative', weight: 0.25, description: 'Recent buyers unlikely to flip quickly' },
        { factor: 'Auction Calendar', impact: 'positive', weight: 0.2, description: 'Heritage and Goldin premium events upcoming' },
        { factor: 'Price Trend', impact: 'neutral', weight: 0.15, description: 'Stable prices reduce urgency to sell' },
        { factor: 'Economic Conditions', impact: 'negative', weight: 0.1, description: 'High-net-worth collectors holding assets' },
      ],
      nextLikelyVenue: 'Heritage Auctions',
      estimatedNextPrice: 4100000,
      historicalSurfaceRate: 2.3,
    },
    populationReport: {
      cardId: 'census-001', cardName: '1986 Fleer Michael Jordan #57', year: 1986,
      manufacturer: 'Fleer', cardNumber: '#57', sport: 'basketball',
      totalGraded: 8923, psa10Pop: 316, psa9Pop: 2841, bgs10Pop: 4, bgs95Pop: 187, sgc10Pop: 12,
      estimatedUngraded: 16000, estimatedSurviving: 25000,
      popHistory: buildPopHistory({ psa10: 316, psa9: 2841, bgs10: 4, bgs95: 187, total: 8923 }),
      lastUpdated: '2025-03-01',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 180, percentage: 57 },
      { type: 'Dealers', count: 63, percentage: 20 },
      { type: 'Institutions', count: 16, percentage: 5 },
      { type: 'Auction Houses', count: 9, percentage: 3 },
      { type: 'Unknown', count: 48, percentage: 15 },
    ],
  },
  {
    id: 'census-002',
    playerName: 'Mickey Mantle',
    cardName: '1952 Topps Mickey Mantle #311',
    year: 1952,
    manufacturer: 'Topps',
    cardNumber: '#311',
    sport: 'baseball',
    imageUrl: '/cards/mantle-topps-52.jpg',
    totalPop: 1814,
    topGradePop: 6,
    topGrade: 'PSA 9',
    grader: 'PSA',
    estimatedSurviving: 3500,
    lastSalePrice: 12600000,
    lastSaleDate: '2022-08-28',
    lastSaleVenue: 'Heritage Auctions',
    rarityScore: 99,
    marketTrend: 'rising',
    category: 'ultra-rare',
    knownExamples: [
      {
        id: 'ex-010', serialIdentifier: 'PSA-01234567', grade: 'PSA 9', grader: 'PSA',
        lastSaleVenue: 'Heritage Auctions', lastSaleDate: '2022-08-28', lastSalePrice: 12600000,
        currentOwner: mockOwners.collector2,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Purchase', date: '1952-06-01', venue: 'Retail', price: 0.05 },
          { owner: 'Estate Collection', date: '1985-01-01', venue: 'Estate Sale', price: 25000 },
          { owner: 'Heritage Auctions', date: '2022-08-28', venue: 'Heritage Auctions', price: 12600000 },
        ]),
        condition: 'Near-flawless for the era. Exceptional color registration.',
        notes: 'Highest-graded example of the most iconic baseball card. Only 6 PSA 9s exist, no PSA 10.',
        lastVerified: '2025-01-10',
      },
    ],
    surfaceProbability: {
      cardId: 'census-002',
      sixMonthProbability: 5,
      twelveMonthProbability: 12,
      twentyFourMonthProbability: 22,
      factors: [
        { factor: 'Extreme Rarity', impact: 'negative', weight: 0.4, description: 'Only 6 PSA 9s — owners rarely part with them' },
        { factor: 'Trophy Asset Status', impact: 'negative', weight: 0.3, description: 'Held as centerpiece collection items' },
        { factor: 'Record Price Potential', impact: 'positive', weight: 0.2, description: 'Could break $15M barrier' },
        { factor: 'Generational Wealth Transfer', impact: 'positive', weight: 0.1, description: 'Aging collectors may liquidate' },
      ],
      nextLikelyVenue: 'Heritage Auctions',
      estimatedNextPrice: 15000000,
      historicalSurfaceRate: 0.3,
    },
    populationReport: {
      cardId: 'census-002', cardName: '1952 Topps Mickey Mantle #311', year: 1952,
      manufacturer: 'Topps', cardNumber: '#311', sport: 'baseball',
      totalGraded: 1814, psa10Pop: 0, psa9Pop: 6, bgs10Pop: 0, bgs95Pop: 0, sgc10Pop: 0,
      estimatedUngraded: 1700, estimatedSurviving: 3500,
      popHistory: buildPopHistory({ psa10: 0, psa9: 6, bgs10: 0, bgs95: 0, total: 1814 }),
      lastUpdated: '2025-02-15',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 3, percentage: 50 },
      { type: 'Institutions', count: 2, percentage: 33 },
      { type: 'Unknown', count: 1, percentage: 17 },
    ],
  },
  {
    id: 'census-003',
    playerName: 'Tom Brady',
    cardName: '2000 Playoff Contenders Tom Brady #144 Auto',
    year: 2000,
    manufacturer: 'Playoff Contenders',
    cardNumber: '#144',
    sport: 'football',
    imageUrl: '/cards/brady-contenders-00.jpg',
    totalPop: 487,
    topGradePop: 21,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 600,
    lastSalePrice: 3107000,
    lastSaleDate: '2024-04-12',
    lastSaleVenue: 'Lelands Auctions',
    rarityScore: 94,
    marketTrend: 'rising',
    category: 'ultra-rare',
    knownExamples: [
      {
        id: 'ex-020', serialIdentifier: 'PSA-44218903', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Lelands Auctions', lastSaleDate: '2024-04-12', lastSalePrice: 3107000,
        currentOwner: mockOwners.collector3,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '2000-09-15', venue: 'Hobby Shop', price: 0 },
          { owner: 'New England Collector', date: '2005-02-10', venue: 'eBay', price: 1500 },
          { owner: 'Anonymous European Collector', date: '2024-04-12', venue: 'Lelands Auctions', price: 3107000 },
        ]),
        condition: 'Perfect auto, flawless surface, gem centering',
        notes: 'Championship ticket auto. One of 21 PSA 10s from limited print run.',
        lastVerified: '2024-12-01',
      },
      {
        id: 'ex-021', serialIdentifier: 'PSA-33109276', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Goldin Auctions', lastSaleDate: '2021-06-05', lastSalePrice: 1820000,
        currentOwner: mockOwners.dealer2,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '2000-10-01', venue: 'Hobby Shop', price: 0 },
          { owner: 'Probstein123', date: '2021-06-05', venue: 'Goldin Auctions', price: 1820000 },
        ]),
        condition: 'Strong auto, clean surface, near-perfect centering',
        notes: 'Dealer inventory. May appear in future auction consignment.',
        lastVerified: '2025-02-20',
      },
    ],
    surfaceProbability: {
      cardId: 'census-003',
      sixMonthProbability: 22,
      twelveMonthProbability: 41,
      twentyFourMonthProbability: 63,
      factors: [
        { factor: 'Retirement Premium', impact: 'positive', weight: 0.3, description: 'Post-career demand remains high' },
        { factor: 'Auto Condition Variance', impact: 'neutral', weight: 0.2, description: 'Auto quality varies across examples' },
        { factor: 'Dealer Holdings', impact: 'positive', weight: 0.25, description: 'Several held by dealers for resale' },
        { factor: 'Market Timing', impact: 'positive', weight: 0.25, description: 'Football card market cyclically strong' },
      ],
      nextLikelyVenue: 'Goldin Auctions',
      estimatedNextPrice: 3400000,
      historicalSurfaceRate: 1.5,
    },
    populationReport: {
      cardId: 'census-003', cardName: '2000 Playoff Contenders Tom Brady #144 Auto', year: 2000,
      manufacturer: 'Playoff Contenders', cardNumber: '#144', sport: 'football',
      totalGraded: 487, psa10Pop: 21, psa9Pop: 134, bgs10Pop: 0, bgs95Pop: 28, sgc10Pop: 2,
      estimatedUngraded: 115, estimatedSurviving: 600,
      popHistory: buildPopHistory({ psa10: 21, psa9: 134, bgs10: 0, bgs95: 28, total: 487 }),
      lastUpdated: '2025-02-28',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 10, percentage: 48 },
      { type: 'Dealers', count: 6, percentage: 28 },
      { type: 'Institutions', count: 1, percentage: 5 },
      { type: 'Unknown', count: 4, percentage: 19 },
    ],
  },
  {
    id: 'census-004',
    playerName: 'Mike Trout',
    cardName: '2011 Topps Update Mike Trout #US175',
    year: 2011,
    manufacturer: 'Topps Update',
    cardNumber: '#US175',
    sport: 'baseball',
    imageUrl: '/cards/trout-topps-11.jpg',
    totalPop: 5621,
    topGradePop: 982,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 50000,
    lastSalePrice: 3936000,
    lastSaleDate: '2023-12-15',
    lastSaleVenue: 'Goldin Auctions',
    rarityScore: 55,
    marketTrend: 'declining',
    category: 'limited',
    knownExamples: [
      {
        id: 'ex-030', serialIdentifier: 'PSA-55109823', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Goldin Auctions', lastSaleDate: '2023-12-15', lastSalePrice: 3936000,
        currentOwner: mockOwners.privateCollector1,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '2011-10-01', venue: 'Hobby Shop', price: 0 },
          { owner: 'Private West Coast Collector', date: '2023-12-15', venue: 'Goldin Auctions', price: 3936000 },
        ]),
        condition: 'Perfect centering, pristine surface, gem corners',
        notes: 'High pop but strong demand keeps prices elevated.',
        lastVerified: '2025-01-05',
      },
    ],
    surfaceProbability: {
      cardId: 'census-004',
      sixMonthProbability: 78,
      twelveMonthProbability: 95,
      twentyFourMonthProbability: 99,
      factors: [
        { factor: 'High Population', impact: 'positive', weight: 0.4, description: '982 PSA 10s means frequent availability' },
        { factor: 'Active Market', impact: 'positive', weight: 0.3, description: 'Regular auction appearances' },
        { factor: 'Injury Concerns', impact: 'positive', weight: 0.2, description: 'Some holders may sell on uncertainty' },
        { factor: 'Modern Card Liquidity', impact: 'positive', weight: 0.1, description: 'Modern cards trade frequently' },
      ],
      nextLikelyVenue: 'eBay',
      estimatedNextPrice: 350000,
      historicalSurfaceRate: 8.5,
    },
    populationReport: {
      cardId: 'census-004', cardName: '2011 Topps Update Mike Trout #US175', year: 2011,
      manufacturer: 'Topps Update', cardNumber: '#US175', sport: 'baseball',
      totalGraded: 5621, psa10Pop: 982, psa9Pop: 2340, bgs10Pop: 18, bgs95Pop: 312, sgc10Pop: 45,
      estimatedUngraded: 44000, estimatedSurviving: 50000,
      popHistory: buildPopHistory({ psa10: 982, psa9: 2340, bgs10: 18, bgs95: 312, total: 5621 }),
      lastUpdated: '2025-03-01',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 550, percentage: 56 },
      { type: 'Dealers', count: 245, percentage: 25 },
      { type: 'Institutions', count: 29, percentage: 3 },
      { type: 'Auction Houses', count: 39, percentage: 4 },
      { type: 'Unknown', count: 119, percentage: 12 },
    ],
  },
  {
    id: 'census-005',
    playerName: 'LeBron James',
    cardName: '2003 Topps Chrome LeBron James #111',
    year: 2003,
    manufacturer: 'Topps Chrome',
    cardNumber: '#111',
    sport: 'basketball',
    imageUrl: '/cards/lebron-chrome-03.jpg',
    totalPop: 4210,
    topGradePop: 218,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 15000,
    lastSalePrice: 420000,
    lastSaleDate: '2024-11-08',
    lastSaleVenue: 'Heritage Auctions',
    rarityScore: 76,
    marketTrend: 'rising',
    category: 'scarce',
    knownExamples: [],
    surfaceProbability: {
      cardId: 'census-005', sixMonthProbability: 62, twelveMonthProbability: 85, twentyFourMonthProbability: 96,
      factors: [
        { factor: 'Active Player Premium', impact: 'positive', weight: 0.3, description: 'Career milestones drive demand spikes' },
        { factor: 'High Liquidity', impact: 'positive', weight: 0.35, description: 'Frequently traded at all levels' },
        { factor: 'Retirement Speculation', impact: 'positive', weight: 0.2, description: 'Approaching end of career drives urgency' },
        { factor: 'Chrome Condition Sensitivity', impact: 'neutral', weight: 0.15, description: 'Surface scratches common on chrome' },
      ],
      nextLikelyVenue: 'Goldin Auctions', estimatedNextPrice: 450000, historicalSurfaceRate: 5.2,
    },
    populationReport: {
      cardId: 'census-005', cardName: '2003 Topps Chrome LeBron James #111', year: 2003,
      manufacturer: 'Topps Chrome', cardNumber: '#111', sport: 'basketball',
      totalGraded: 4210, psa10Pop: 218, psa9Pop: 1850, bgs10Pop: 8, bgs95Pop: 145, sgc10Pop: 15,
      estimatedUngraded: 10800, estimatedSurviving: 15000,
      popHistory: buildPopHistory({ psa10: 218, psa9: 1850, bgs10: 8, bgs95: 145, total: 4210 }),
      lastUpdated: '2025-03-01',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 125, percentage: 57 },
      { type: 'Dealers', count: 48, percentage: 22 },
      { type: 'Institutions', count: 9, percentage: 4 },
      { type: 'Unknown', count: 36, percentage: 17 },
    ],
  },
  {
    id: 'census-006',
    playerName: 'Wayne Gretzky',
    cardName: '1979 O-Pee-Chee Wayne Gretzky #18',
    year: 1979,
    manufacturer: 'O-Pee-Chee',
    cardNumber: '#18',
    sport: 'hockey',
    imageUrl: '/cards/gretzky-opc-79.jpg',
    totalPop: 3540,
    topGradePop: 2,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 12000,
    lastSalePrice: 3750000,
    lastSaleDate: '2024-10-02',
    lastSaleVenue: 'Heritage Auctions',
    rarityScore: 98,
    marketTrend: 'rising',
    category: 'ultra-rare',
    knownExamples: [
      {
        id: 'ex-060', serialIdentifier: 'PSA-99120034', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Heritage Auctions', lastSaleDate: '2024-10-02', lastSalePrice: 3750000,
        currentOwner: mockOwners.institution1,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Purchase', date: '1979-11-01', venue: 'Corner Store', price: 0.15 },
          { owner: 'Canadian Estate', date: '2000-01-15', venue: 'Estate Sale', price: 50000 },
          { owner: 'Metropolitan Museum Sports Collection', date: '2024-10-02', venue: 'Heritage Auctions', price: 3750000 },
        ]),
        condition: 'Virtually flawless. Exceptional for the era.',
        notes: 'One of only 2 PSA 10s. Institutional acquisition — unlikely to resurface.',
        lastVerified: '2025-02-15',
      },
    ],
    surfaceProbability: {
      cardId: 'census-006', sixMonthProbability: 2, twelveMonthProbability: 5, twentyFourMonthProbability: 9,
      factors: [
        { factor: 'Institutional Lock-up', impact: 'negative', weight: 0.5, description: 'Both PSA 10s held by institutions' },
        { factor: 'Only 2 Exist', impact: 'negative', weight: 0.3, description: 'Extreme scarcity limits surface opportunities' },
        { factor: 'Record Price Ceiling', impact: 'positive', weight: 0.2, description: 'Potential to break hockey card records' },
      ],
      nextLikelyVenue: 'Heritage Auctions', estimatedNextPrice: 5000000, historicalSurfaceRate: 0.15,
    },
    populationReport: {
      cardId: 'census-006', cardName: '1979 O-Pee-Chee Wayne Gretzky #18', year: 1979,
      manufacturer: 'O-Pee-Chee', cardNumber: '#18', sport: 'hockey',
      totalGraded: 3540, psa10Pop: 2, psa9Pop: 68, bgs10Pop: 0, bgs95Pop: 5, sgc10Pop: 0,
      estimatedUngraded: 8500, estimatedSurviving: 12000,
      popHistory: buildPopHistory({ psa10: 2, psa9: 68, bgs10: 0, bgs95: 5, total: 3540 }),
      lastUpdated: '2025-02-20',
    },
    ownerDistribution: [
      { type: 'Institutions', count: 2, percentage: 100 },
    ],
  },
  {
    id: 'census-007',
    playerName: 'Kobe Bryant',
    cardName: '1996 Topps Chrome Kobe Bryant #138',
    year: 1996,
    manufacturer: 'Topps Chrome',
    cardNumber: '#138',
    sport: 'basketball',
    imageUrl: '/cards/kobe-chrome-96.jpg',
    totalPop: 6120,
    topGradePop: 189,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 20000,
    lastSalePrice: 525000,
    lastSaleDate: '2024-09-20',
    lastSaleVenue: 'Goldin Auctions',
    rarityScore: 78,
    marketTrend: 'rising',
    category: 'scarce',
    knownExamples: [],
    surfaceProbability: {
      cardId: 'census-007', sixMonthProbability: 55, twelveMonthProbability: 80, twentyFourMonthProbability: 94,
      factors: [
        { factor: 'Memorial Premium', impact: 'negative', weight: 0.35, description: 'Collectors hold as tribute pieces' },
        { factor: 'Moderate Population', impact: 'positive', weight: 0.3, description: '189 PSA 10s provides some liquidity' },
        { factor: 'Price Appreciation', impact: 'positive', weight: 0.35, description: 'Steady climb motivates profit-taking' },
      ],
      nextLikelyVenue: 'Heritage Auctions', estimatedNextPrice: 560000, historicalSurfaceRate: 3.8,
    },
    populationReport: {
      cardId: 'census-007', cardName: '1996 Topps Chrome Kobe Bryant #138', year: 1996,
      manufacturer: 'Topps Chrome', cardNumber: '#138', sport: 'basketball',
      totalGraded: 6120, psa10Pop: 189, psa9Pop: 2480, bgs10Pop: 6, bgs95Pop: 198, sgc10Pop: 22,
      estimatedUngraded: 13900, estimatedSurviving: 20000,
      popHistory: buildPopHistory({ psa10: 189, psa9: 2480, bgs10: 6, bgs95: 198, total: 6120 }),
      lastUpdated: '2025-03-01',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 112, percentage: 59 },
      { type: 'Dealers', count: 38, percentage: 20 },
      { type: 'Institutions', count: 8, percentage: 4 },
      { type: 'Unknown', count: 31, percentage: 17 },
    ],
  },
  {
    id: 'census-008',
    playerName: 'Patrick Mahomes',
    cardName: '2017 Panini Prizm Patrick Mahomes #269',
    year: 2017,
    manufacturer: 'Panini Prizm',
    cardNumber: '#269',
    sport: 'football',
    imageUrl: '/cards/mahomes-prizm-17.jpg',
    totalPop: 7840,
    topGradePop: 1420,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 80000,
    lastSalePrice: 78000,
    lastSaleDate: '2025-01-28',
    lastSaleVenue: 'eBay',
    rarityScore: 38,
    marketTrend: 'stable',
    category: 'limited',
    knownExamples: [],
    surfaceProbability: {
      cardId: 'census-008', sixMonthProbability: 99, twelveMonthProbability: 100, twentyFourMonthProbability: 100,
      factors: [
        { factor: 'Mass Population', impact: 'positive', weight: 0.5, description: '1420 PSA 10s — always available' },
        { factor: 'Active Player', impact: 'positive', weight: 0.3, description: 'Career performance drives constant trading' },
        { factor: 'Modern Card Volume', impact: 'positive', weight: 0.2, description: 'Modern era production volume is high' },
      ],
      nextLikelyVenue: 'eBay', estimatedNextPrice: 80000, historicalSurfaceRate: 45.0,
    },
    populationReport: {
      cardId: 'census-008', cardName: '2017 Panini Prizm Patrick Mahomes #269', year: 2017,
      manufacturer: 'Panini Prizm', cardNumber: '#269', sport: 'football',
      totalGraded: 7840, psa10Pop: 1420, psa9Pop: 3210, bgs10Pop: 32, bgs95Pop: 580, sgc10Pop: 88,
      estimatedUngraded: 72000, estimatedSurviving: 80000,
      popHistory: buildPopHistory({ psa10: 1420, psa9: 3210, bgs10: 32, bgs95: 580, total: 7840 }),
      lastUpdated: '2025-03-05',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 780, percentage: 55 },
      { type: 'Dealers', count: 398, percentage: 28 },
      { type: 'Institutions', count: 14, percentage: 1 },
      { type: 'Auction Houses', count: 57, percentage: 4 },
      { type: 'Unknown', count: 171, percentage: 12 },
    ],
  },
  {
    id: 'census-009',
    playerName: 'Shohei Ohtani',
    cardName: '2018 Topps Chrome Shohei Ohtani #150',
    year: 2018,
    manufacturer: 'Topps Chrome',
    cardNumber: '#150',
    sport: 'baseball',
    imageUrl: '/cards/ohtani-chrome-18.jpg',
    totalPop: 4850,
    topGradePop: 645,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 35000,
    lastSalePrice: 150000,
    lastSaleDate: '2025-02-14',
    lastSaleVenue: 'Goldin Auctions',
    rarityScore: 48,
    marketTrend: 'rising',
    category: 'limited',
    knownExamples: [],
    surfaceProbability: {
      cardId: 'census-009', sixMonthProbability: 92, twelveMonthProbability: 99, twentyFourMonthProbability: 100,
      factors: [
        { factor: 'International Demand', impact: 'positive', weight: 0.35, description: 'Massive Japanese collector base creates liquidity' },
        { factor: 'Career Peak', impact: 'positive', weight: 0.35, description: 'Current performance driving demand' },
        { factor: 'High Population', impact: 'positive', weight: 0.3, description: '645 PSA 10s ensures availability' },
      ],
      nextLikelyVenue: 'Goldin Auctions', estimatedNextPrice: 165000, historicalSurfaceRate: 12.0,
    },
    populationReport: {
      cardId: 'census-009', cardName: '2018 Topps Chrome Shohei Ohtani #150', year: 2018,
      manufacturer: 'Topps Chrome', cardNumber: '#150', sport: 'baseball',
      totalGraded: 4850, psa10Pop: 645, psa9Pop: 2100, bgs10Pop: 14, bgs95Pop: 290, sgc10Pop: 38,
      estimatedUngraded: 30000, estimatedSurviving: 35000,
      popHistory: buildPopHistory({ psa10: 645, psa9: 2100, bgs10: 14, bgs95: 290, total: 4850 }),
      lastUpdated: '2025-03-10',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 380, percentage: 59 },
      { type: 'Dealers', count: 148, percentage: 23 },
      { type: 'Institutions', count: 13, percentage: 2 },
      { type: 'Unknown', count: 104, percentage: 16 },
    ],
  },
  {
    id: 'census-010',
    playerName: 'Luka Doncic',
    cardName: '2018 Panini Prizm Luka Doncic #280',
    year: 2018,
    manufacturer: 'Panini Prizm',
    cardNumber: '#280',
    sport: 'basketball',
    imageUrl: '/cards/doncic-prizm-18.jpg',
    totalPop: 6320,
    topGradePop: 1180,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 55000,
    lastSalePrice: 52000,
    lastSaleDate: '2025-02-28',
    lastSaleVenue: 'eBay',
    rarityScore: 42,
    marketTrend: 'stable',
    category: 'limited',
    knownExamples: [],
    surfaceProbability: {
      cardId: 'census-010', sixMonthProbability: 98, twelveMonthProbability: 100, twentyFourMonthProbability: 100,
      factors: [
        { factor: 'High Population', impact: 'positive', weight: 0.45, description: '1180 PSA 10s — readily available' },
        { factor: 'Young Superstar', impact: 'positive', weight: 0.35, description: 'Active career keeps trading volume high' },
        { factor: 'Modern Production', impact: 'positive', weight: 0.2, description: 'High print run era card' },
      ],
      nextLikelyVenue: 'eBay', estimatedNextPrice: 54000, historicalSurfaceRate: 35.0,
    },
    populationReport: {
      cardId: 'census-010', cardName: '2018 Panini Prizm Luka Doncic #280', year: 2018,
      manufacturer: 'Panini Prizm', cardNumber: '#280', sport: 'basketball',
      totalGraded: 6320, psa10Pop: 1180, psa9Pop: 2890, bgs10Pop: 22, bgs95Pop: 410, sgc10Pop: 55,
      estimatedUngraded: 48700, estimatedSurviving: 55000,
      popHistory: buildPopHistory({ psa10: 1180, psa9: 2890, bgs10: 22, bgs95: 410, total: 6320 }),
      lastUpdated: '2025-03-08',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 650, percentage: 55 },
      { type: 'Dealers', count: 318, percentage: 27 },
      { type: 'Institutions', count: 12, percentage: 1 },
      { type: 'Auction Houses', count: 47, percentage: 4 },
      { type: 'Unknown', count: 153, percentage: 13 },
    ],
  },
  {
    id: 'census-011',
    playerName: 'Ken Griffey Jr.',
    cardName: '1989 Upper Deck Ken Griffey Jr. #1',
    year: 1989,
    manufacturer: 'Upper Deck',
    cardNumber: '#1',
    sport: 'baseball',
    imageUrl: '/cards/griffey-ud-89.jpg',
    totalPop: 12400,
    topGradePop: 1850,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 100000,
    lastSalePrice: 18000,
    lastSaleDate: '2025-03-01',
    lastSaleVenue: 'eBay',
    rarityScore: 28,
    marketTrend: 'stable',
    category: 'limited',
    knownExamples: [],
    surfaceProbability: {
      cardId: 'census-011', sixMonthProbability: 100, twelveMonthProbability: 100, twentyFourMonthProbability: 100,
      factors: [
        { factor: 'Massive Population', impact: 'positive', weight: 0.5, description: '1850 PSA 10s — always available' },
        { factor: 'Iconic Status', impact: 'positive', weight: 0.3, description: 'Nostalgia-driven constant demand' },
        { factor: 'Affordable Entry', impact: 'positive', weight: 0.2, description: 'Price point attracts frequent trading' },
      ],
      nextLikelyVenue: 'eBay', estimatedNextPrice: 18500, historicalSurfaceRate: 60.0,
    },
    populationReport: {
      cardId: 'census-011', cardName: '1989 Upper Deck Ken Griffey Jr. #1', year: 1989,
      manufacturer: 'Upper Deck', cardNumber: '#1', sport: 'baseball',
      totalGraded: 12400, psa10Pop: 1850, psa9Pop: 5200, bgs10Pop: 45, bgs95Pop: 820, sgc10Pop: 110,
      estimatedUngraded: 87600, estimatedSurviving: 100000,
      popHistory: buildPopHistory({ psa10: 1850, psa9: 5200, bgs10: 45, bgs95: 820, total: 12400 }),
      lastUpdated: '2025-03-10',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 1100, percentage: 59 },
      { type: 'Dealers', count: 462, percentage: 25 },
      { type: 'Institutions', count: 19, percentage: 1 },
      { type: 'Auction Houses', count: 74, percentage: 4 },
      { type: 'Unknown', count: 195, percentage: 11 },
    ],
  },
  {
    id: 'census-012',
    playerName: 'Lionel Messi',
    cardName: '2004 Panini Mega Cracks Lionel Messi #71',
    year: 2004,
    manufacturer: 'Panini Mega Cracks',
    cardNumber: '#71',
    sport: 'soccer',
    imageUrl: '/cards/messi-megacracks-04.jpg',
    totalPop: 312,
    topGradePop: 8,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 2000,
    lastSalePrice: 1020000,
    lastSaleDate: '2024-06-18',
    lastSaleVenue: 'Goldin Auctions',
    rarityScore: 96,
    marketTrend: 'rising',
    category: 'ultra-rare',
    knownExamples: [
      {
        id: 'ex-120', serialIdentifier: 'PSA-77201485', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Goldin Auctions', lastSaleDate: '2024-06-18', lastSalePrice: 1020000,
        currentOwner: mockOwners.collector3,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '2004-09-01', venue: 'Kiosk (Barcelona)', price: 0.50 },
          { owner: 'Spanish Collector', date: '2015-03-10', venue: 'Private Sale', price: 5000 },
          { owner: 'Anonymous European Collector', date: '2024-06-18', venue: 'Goldin Auctions', price: 1020000 },
        ]),
        condition: 'Exceptional centering, clean surface, vivid color',
        notes: 'One of 8 known PSA 10s. Soccer card market rapidly appreciating.',
        lastVerified: '2025-01-30',
      },
    ],
    surfaceProbability: {
      cardId: 'census-012', sixMonthProbability: 8, twelveMonthProbability: 18, twentyFourMonthProbability: 32,
      factors: [
        { factor: 'Low Population', impact: 'negative', weight: 0.4, description: 'Only 8 PSA 10s limits opportunities' },
        { factor: 'Global Demand', impact: 'positive', weight: 0.3, description: 'Worldwide soccer fan base creates premium demand' },
        { factor: 'European Collector Base', impact: 'negative', weight: 0.2, description: 'European collectors tend to hold longer' },
        { factor: 'Post-Career Transition', impact: 'positive', weight: 0.1, description: 'Retirement may trigger some profit-taking' },
      ],
      nextLikelyVenue: 'Goldin Auctions', estimatedNextPrice: 1200000, historicalSurfaceRate: 0.8,
    },
    populationReport: {
      cardId: 'census-012', cardName: '2004 Panini Mega Cracks Lionel Messi #71', year: 2004,
      manufacturer: 'Panini Mega Cracks', cardNumber: '#71', sport: 'soccer',
      totalGraded: 312, psa10Pop: 8, psa9Pop: 42, bgs10Pop: 0, bgs95Pop: 6, sgc10Pop: 1,
      estimatedUngraded: 1700, estimatedSurviving: 2000,
      popHistory: buildPopHistory({ psa10: 8, psa9: 42, bgs10: 0, bgs95: 6, total: 312 }),
      lastUpdated: '2025-02-28',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 5, percentage: 63 },
      { type: 'Dealers', count: 1, percentage: 12 },
      { type: 'Unknown', count: 2, percentage: 25 },
    ],
  },
  {
    id: 'census-013',
    playerName: 'Derek Jeter',
    cardName: '1993 SP Derek Jeter #279',
    year: 1993,
    manufacturer: 'SP',
    cardNumber: '#279',
    sport: 'baseball',
    imageUrl: '/cards/jeter-sp-93.jpg',
    totalPop: 4580,
    topGradePop: 76,
    topGrade: 'PSA 10',
    grader: 'PSA',
    estimatedSurviving: 18000,
    lastSalePrice: 369000,
    lastSaleDate: '2024-07-22',
    lastSaleVenue: 'Heritage Auctions',
    rarityScore: 82,
    marketTrend: 'stable',
    category: 'rare',
    knownExamples: [
      {
        id: 'ex-130', serialIdentifier: 'PSA-66190234', grade: 'PSA 10', grader: 'PSA',
        lastSaleVenue: 'Heritage Auctions', lastSaleDate: '2024-07-22', lastSalePrice: 369000,
        currentOwner: mockOwners.auctionHouse1,
        provenanceChain: buildProvenanceChain([
          { owner: 'Original Pack Pull', date: '1993-06-01', venue: 'Hobby Shop', price: 0 },
          { owner: 'Northeast Collector', date: '2010-04-18', venue: 'eBay', price: 25000 },
          { owner: 'Heritage Auctions Consignment', date: '2025-01-15', venue: 'Consignment', price: 0 },
        ]),
        condition: 'Foil pristine, no surface imperfections, centered 50/50',
        notes: 'Currently consigned to Heritage. Expected to appear in April 2025 auction.',
        lastVerified: '2025-03-01',
      },
    ],
    surfaceProbability: {
      cardId: 'census-013', sixMonthProbability: 45, twelveMonthProbability: 68, twentyFourMonthProbability: 85,
      factors: [
        { factor: 'Hall of Fame Status', impact: 'neutral', weight: 0.3, description: 'Established legacy maintains steady demand' },
        { factor: 'Known Consignment', impact: 'positive', weight: 0.35, description: 'At least one example currently consigned' },
        { factor: 'Moderate Population', impact: 'positive', weight: 0.2, description: '76 PSA 10s provides reasonable surface chance' },
        { factor: 'SP Foil Fragility', impact: 'negative', weight: 0.15, description: 'Foil cards are condition-sensitive — owners protect them' },
      ],
      nextLikelyVenue: 'Heritage Auctions', estimatedNextPrice: 385000, historicalSurfaceRate: 2.8,
    },
    populationReport: {
      cardId: 'census-013', cardName: '1993 SP Derek Jeter #279', year: 1993,
      manufacturer: 'SP', cardNumber: '#279', sport: 'baseball',
      totalGraded: 4580, psa10Pop: 76, psa9Pop: 1240, bgs10Pop: 2, bgs95Pop: 88, sgc10Pop: 8,
      estimatedUngraded: 13400, estimatedSurviving: 18000,
      popHistory: buildPopHistory({ psa10: 76, psa9: 1240, bgs10: 2, bgs95: 88, total: 4580 }),
      lastUpdated: '2025-03-01',
    },
    ownerDistribution: [
      { type: 'Collectors', count: 42, percentage: 55 },
      { type: 'Dealers', count: 15, percentage: 20 },
      { type: 'Auction Houses', count: 4, percentage: 5 },
      { type: 'Institutions', count: 3, percentage: 4 },
      { type: 'Unknown', count: 12, percentage: 16 },
    ],
  },
];

// --- Service Functions ---

export async function getCensusCards(): Promise<CensusCard[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...censusCards]), 300);
  });
}

export async function getPopulationReport(cardId: string): Promise<PopulationReport | null> {
  return new Promise((resolve) => {
    const card = censusCards.find(c => c.id === cardId);
    setTimeout(() => resolve(card ? card.populationReport : null), 200);
  });
}

export async function getSurfaceProbability(cardId: string): Promise<SurfaceProbability | null> {
  return new Promise((resolve) => {
    const card = censusCards.find(c => c.id === cardId);
    setTimeout(() => resolve(card ? card.surfaceProbability : null), 200);
  });
}

export async function getKnownExamples(cardId: string): Promise<KnownExample[]> {
  return new Promise((resolve) => {
    const card = censusCards.find(c => c.id === cardId);
    setTimeout(() => resolve(card ? card.knownExamples : []), 200);
  });
}

export async function searchCensus(query: string): Promise<CensusCard[]> {
  return new Promise((resolve) => {
    const normalizedQuery = query.toLowerCase();
    const results = censusCards.filter(c =>
      c.playerName.toLowerCase().includes(normalizedQuery) ||
      c.cardName.toLowerCase().includes(normalizedQuery) ||
      c.sport.toLowerCase().includes(normalizedQuery) ||
      c.manufacturer.toLowerCase().includes(normalizedQuery) ||
      c.year.toString().includes(normalizedQuery)
    );
    setTimeout(() => resolve(results), 150);
  });
}

export async function getAllKnownExamples(): Promise<{ card: CensusCard; examples: KnownExample[] }[]> {
  return new Promise((resolve) => {
    const results = censusCards
      .filter(c => c.knownExamples.length > 0)
      .map(c => ({ card: c, examples: c.knownExamples }));
    setTimeout(() => resolve(results), 250);
  });
}

export async function getOwnerDistributionSummary(): Promise<{ type: string; totalCount: number; percentage: number }[]> {
  return new Promise((resolve) => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    censusCards.forEach(card => {
      card.ownerDistribution.forEach(od => {
        totals[od.type] = (totals[od.type] || 0) + od.count;
        grandTotal += od.count;
      });
    });
    const summary = Object.entries(totals).map(([type, count]) => ({
      type,
      totalCount: count,
      percentage: Math.round((count / grandTotal) * 100),
    }));
    setTimeout(() => resolve(summary.sort((a, b) => b.totalCount - a.totalCount)), 200);
  });
}
