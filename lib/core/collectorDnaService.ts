// @ts-nocheck
// Phase 117: Collector DNA & Match Engine
// ML-style collector profiling, DNA breakdown, match engine, and recommendation system

import { store } from '../dal/syncStore';

// ---- Types ----

export type CollectorArchetype =
  | 'vintage_purist'
  | 'prospect_hunter'
  | 'grade_snob'
  | 'set_builder'
  | 'flipper'
  | 'trophy_hunter'
  | 'diversifier';

export interface DNABreakdown {
  vintage_purist: number;
  prospect_hunter: number;
  grade_snob: number;
  set_builder: number;
  flipper: number;
  trophy_hunter: number;
  diversifier: number;
}

export interface CollectorProfile {
  id: string;
  username: string;
  avatar: string;
  joinDate: string;
  collectionSize: number;
  collectionValue: number;
  primaryArchetype: CollectorArchetype;
  secondaryArchetype: CollectorArchetype;
  dna: DNABreakdown;
  topPlayers: string[];
  topSets: string[];
  avgGrade: number;
  tradeCount: number;
  reputationScore: number;
  bio: string;
  lookingFor: string[];
  willingToTrade: string[];
}

export interface MatchScore {
  overall: number;
  collectionOverlap: number;
  archetypeCompatibility: number;
  tradeOpportunity: number;
  priceAlignment: number;
}

export interface CollectorMatch {
  collector: CollectorProfile;
  matchScore: MatchScore;
  matchReasons: string[];
  potentialTrades: { youHave: string; theyHave: string; fairness: number }[];
}

export interface RecommendationItem {
  id: string;
  type: 'card' | 'set' | 'collector' | 'strategy';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  actionLabel: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RecommendationFeed {
  generated: string;
  items: RecommendationItem[];
  archetypeInsight: string;
}

export interface BuyerSellerMatch {
  id: string;
  buyer: CollectorProfile;
  seller: CollectorProfile;
  card: string;
  buyerMaxPrice: number;
  sellerAskPrice: number;
  spread: number;
  matchConfidence: number;
  reasoning: string;
}

export interface CollectorDnaStats {
  totalCollectors: number;
  avgMatchScore: number;
  topArchetype: CollectorArchetype;
  activeMatches: number;
  tradeOpportunities: number;
  recommendationsGenerated: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_collector_dna';

const ARCHETYPE_LABELS: Record<CollectorArchetype, string> = {
  vintage_purist: 'Vintage Purist',
  prospect_hunter: 'Prospect Hunter',
  grade_snob: 'Grade Snob',
  set_builder: 'Set Builder',
  flipper: 'Flipper',
  trophy_hunter: 'Trophy Hunter',
  diversifier: 'Diversifier',
};

const ARCHETYPE_DESCRIPTIONS: Record<CollectorArchetype, string> = {
  vintage_purist: 'Seeks pre-1980 cards, values history and patina over condition',
  prospect_hunter: 'Identifies rising talent early, focuses on rookie and 1st cards',
  grade_snob: 'Only collects PSA 10 / BGS 9.5+, condition is everything',
  set_builder: 'Completes full sets methodically, values completeness',
  flipper: 'Buys low, sells high, maximizes ROI on short holds',
  trophy_hunter: 'Pursues the rarest, most iconic cards regardless of cost',
  diversifier: 'Spreads across sports, eras, and types for balanced exposure',
};

const ARCHETYPE_COLORS: Record<CollectorArchetype, { text: string; bg: string; border: string }> = {
  vintage_purist: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  prospect_hunter: { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/20' },
  grade_snob: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  set_builder: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  flipper: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  trophy_hunter: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  diversifier: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.get<T | null>(`${STORAGE_KEY}_${key}`, null);
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Collector Profiles ----

const COLLECTOR_PROFILES: CollectorProfile[] = [
  {
    id: 'col_001',
    username: 'VintageVault87',
    avatar: 'VV',
    joinDate: '2019-03-15',
    collectionSize: 2480,
    collectionValue: 187500,
    primaryArchetype: 'vintage_purist',
    secondaryArchetype: 'trophy_hunter',
    dna: { vintage_purist: 42, prospect_hunter: 5, grade_snob: 12, set_builder: 8, flipper: 3, trophy_hunter: 22, diversifier: 8 },
    topPlayers: ['Mickey Mantle', 'Willie Mays', 'Hank Aaron', 'Roberto Clemente'],
    topSets: ['1952 Topps', '1955 Bowman', '1961 Topps'],
    avgGrade: 5.5,
    tradeCount: 156,
    reputationScore: 98,
    bio: 'Lifelong vintage collector. If it is not older than me, I am not interested.',
    lookingFor: ['1952 Topps Mantle', '1954 Topps Aaron RC', '1955 Topps Clemente RC'],
    willingToTrade: ['Modern Chrome refractors', 'Recent prospect autos'],
  },
  {
    id: 'col_002',
    username: 'ProspectKing',
    avatar: 'PK',
    joinDate: '2021-06-22',
    collectionSize: 890,
    collectionValue: 45200,
    primaryArchetype: 'prospect_hunter',
    secondaryArchetype: 'flipper',
    dna: { vintage_purist: 2, prospect_hunter: 48, grade_snob: 8, set_builder: 5, flipper: 25, trophy_hunter: 7, diversifier: 5 },
    topPlayers: ['Jackson Holliday', 'Paul Skenes', 'Elly De La Cruz', 'Junior Caminero'],
    topSets: ['2024 Bowman 1st', '2023 Bowman Chrome', '2024 Topps Chrome'],
    avgGrade: 9.2,
    tradeCount: 312,
    reputationScore: 94,
    bio: 'Finding the next big thing before the market catches on. Data-driven prospecting.',
    lookingFor: ['2025 Bowman 1st autos', 'International prospect autos', 'Low-pop rookie parallels'],
    willingToTrade: ['Graduated prospects', 'Duplicates from breaks'],
  },
  {
    id: 'col_003',
    username: 'GemMintGary',
    avatar: 'GM',
    joinDate: '2020-01-10',
    collectionSize: 420,
    collectionValue: 312000,
    primaryArchetype: 'grade_snob',
    secondaryArchetype: 'trophy_hunter',
    dna: { vintage_purist: 5, prospect_hunter: 8, grade_snob: 52, set_builder: 3, flipper: 4, trophy_hunter: 22, diversifier: 6 },
    topPlayers: ['Ken Griffey Jr', 'Derek Jeter', 'Mike Trout', 'Shohei Ohtani'],
    topSets: ['PSA 10 Registry Sets', '1989 Upper Deck', '2011 Topps Update'],
    avgGrade: 9.8,
    tradeCount: 78,
    reputationScore: 99,
    bio: 'Only gem mint. If it is not a 10, it does not exist. Building the ultimate PSA 10 collection.',
    lookingFor: ['PSA 10 Jeter SP RC', 'BGS 10 Pristine Trout RC', 'PSA 10 Griffey RC'],
    willingToTrade: ['PSA 9 duplicates', 'Subgrade misses'],
  },
  {
    id: 'col_004',
    username: 'SetMasterSteve',
    avatar: 'SM',
    joinDate: '2018-09-01',
    collectionSize: 15200,
    collectionValue: 92000,
    primaryArchetype: 'set_builder',
    secondaryArchetype: 'vintage_purist',
    dna: { vintage_purist: 18, prospect_hunter: 4, grade_snob: 6, set_builder: 55, flipper: 2, trophy_hunter: 5, diversifier: 10 },
    topPlayers: ['Complete set focused', 'Not player-specific'],
    topSets: ['1987 Topps Complete', '1993 Finest Complete', '2001 Topps Complete', '2020 Topps Complete'],
    avgGrade: 7.0,
    tradeCount: 445,
    reputationScore: 97,
    bio: 'The joy is in completion. 47 complete Topps flagship sets and counting.',
    lookingFor: ['Single cards to complete sets', 'Bulk commons from specific years', 'Error cards'],
    willingToTrade: ['Duplicate stars from completed sets', 'Upgrade swaps'],
  },
  {
    id: 'col_005',
    username: 'FlipMaster3000',
    avatar: 'FM',
    joinDate: '2022-11-05',
    collectionSize: 230,
    collectionValue: 18700,
    primaryArchetype: 'flipper',
    secondaryArchetype: 'prospect_hunter',
    dna: { vintage_purist: 1, prospect_hunter: 20, grade_snob: 5, set_builder: 2, flipper: 58, trophy_hunter: 4, diversifier: 10 },
    topPlayers: ['Whoever is trending', 'Breakout performers'],
    topSets: ['Current year Chrome', 'Bowman 1st', 'National Treasures'],
    avgGrade: 8.5,
    tradeCount: 890,
    reputationScore: 86,
    bio: 'Buy the rumor, sell the news. Timing is everything in this market.',
    lookingFor: ['Pre-hype rookies', 'Undervalued parallels', 'Buy-low candidates'],
    willingToTrade: ['Post-spike cards', 'Overvalued holds'],
  },
  {
    id: 'col_006',
    username: 'WhaleCollector',
    avatar: 'WC',
    joinDate: '2017-05-18',
    collectionSize: 85,
    collectionValue: 1250000,
    primaryArchetype: 'trophy_hunter',
    secondaryArchetype: 'grade_snob',
    dna: { vintage_purist: 15, prospect_hunter: 3, grade_snob: 18, set_builder: 1, flipper: 2, trophy_hunter: 55, diversifier: 6 },
    topPlayers: ['Mickey Mantle', 'Mike Trout', 'LeBron James', 'Tom Brady'],
    topSets: ['Iconic RCs only', 'One-of-ones'],
    avgGrade: 8.8,
    tradeCount: 22,
    reputationScore: 100,
    bio: 'Quality over quantity. Every card in my collection is a centerpiece.',
    lookingFor: ['1952 Topps Mantle PSA 8+', 'Trout Superfractor', 'LeBron Exquisite RPA'],
    willingToTrade: ['Selectively, for upgrades only'],
  },
  {
    id: 'col_007',
    username: 'BalancedBen',
    avatar: 'BB',
    joinDate: '2020-08-12',
    collectionSize: 3100,
    collectionValue: 78000,
    primaryArchetype: 'diversifier',
    secondaryArchetype: 'set_builder',
    dna: { vintage_purist: 14, prospect_hunter: 14, grade_snob: 10, set_builder: 16, flipper: 8, trophy_hunter: 10, diversifier: 28 },
    topPlayers: ['Cross-sport mix', 'Ohtani', 'Wembanyama', 'Mahomes'],
    topSets: ['2023 Topps', '2024 Prizm Basketball', '2024 Panini Football'],
    avgGrade: 8.0,
    tradeCount: 267,
    reputationScore: 95,
    bio: 'A little bit of everything. Spreading risk across sports and eras like a true portfolio.',
    lookingFor: ['Underrepresented sports', 'Hockey rookies', 'Soccer stars'],
    willingToTrade: ['Duplicates across all sports'],
  },
  {
    id: 'col_008',
    username: 'RookieRadar',
    avatar: 'RR',
    joinDate: '2023-02-14',
    collectionSize: 650,
    collectionValue: 32400,
    primaryArchetype: 'prospect_hunter',
    secondaryArchetype: 'grade_snob',
    dna: { vintage_purist: 1, prospect_hunter: 44, grade_snob: 22, set_builder: 3, flipper: 15, trophy_hunter: 8, diversifier: 7 },
    topPlayers: ['Jackson Holliday', 'Dylan Crews', 'Travis Hunter', 'Zaccharie Risacher'],
    topSets: ['2025 Bowman Draft', '2024 Topps Chrome', '2024 Prizm Draft'],
    avgGrade: 9.5,
    tradeCount: 198,
    reputationScore: 91,
    bio: 'Scouting reports meet slab hunting. Every rookie gets evaluated with a data model.',
    lookingFor: ['2025 1st Bowman autos PSA 10', 'International league rookies'],
    willingToTrade: ['Busted prospects', 'Non-auto base rookies'],
  },
  {
    id: 'col_009',
    username: 'NostalgiaKing',
    avatar: 'NK',
    joinDate: '2016-12-01',
    collectionSize: 8900,
    collectionValue: 145000,
    primaryArchetype: 'vintage_purist',
    secondaryArchetype: 'set_builder',
    dna: { vintage_purist: 38, prospect_hunter: 2, grade_snob: 8, set_builder: 28, flipper: 1, trophy_hunter: 12, diversifier: 11 },
    topPlayers: ['Nolan Ryan', 'Johnny Bench', 'Tom Seaver', 'Pete Rose'],
    topSets: ['1969 Topps', '1971 Topps', '1975 Topps'],
    avgGrade: 6.0,
    tradeCount: 334,
    reputationScore: 96,
    bio: 'The 1970s were the golden era. Building every set from that decade.',
    lookingFor: ['1970s high numbers', 'Error variations', 'Vintage test issues'],
    willingToTrade: ['Duplicate vintage commons', '1980s excess'],
  },
  {
    id: 'col_010',
    username: 'GradeHunterX',
    avatar: 'GH',
    joinDate: '2021-04-20',
    collectionSize: 310,
    collectionValue: 198000,
    primaryArchetype: 'grade_snob',
    secondaryArchetype: 'flipper',
    dna: { vintage_purist: 3, prospect_hunter: 12, grade_snob: 45, set_builder: 2, flipper: 22, trophy_hunter: 10, diversifier: 6 },
    topPlayers: ['Shohei Ohtani', 'Gunnar Henderson', 'Adley Rutschman'],
    topSets: ['Modern slabs only', 'BGS Black Label collection'],
    avgGrade: 9.7,
    tradeCount: 145,
    reputationScore: 93,
    bio: 'The slab is sacred. BGS Black Labels are the holy grail. If centering is off, hard pass.',
    lookingFor: ['BGS 10 Black Labels', 'PSA 10 pop 1s', 'Perfect centering raw for grading'],
    willingToTrade: ['PSA 9 downgrades', 'Failed crossovers'],
  },
  {
    id: 'col_011',
    username: 'TrophyCaseTina',
    avatar: 'TC',
    joinDate: '2019-07-30',
    collectionSize: 145,
    collectionValue: 890000,
    primaryArchetype: 'trophy_hunter',
    secondaryArchetype: 'vintage_purist',
    dna: { vintage_purist: 22, prospect_hunter: 2, grade_snob: 15, set_builder: 1, flipper: 1, trophy_hunter: 52, diversifier: 7 },
    topPlayers: ['Babe Ruth', 'Mickey Mantle', 'Michael Jordan', 'Wayne Gretzky'],
    topSets: ['HOF RC collection', 'Pre-war tobacco cards'],
    avgGrade: 7.5,
    tradeCount: 35,
    reputationScore: 99,
    bio: 'Building a museum-quality collection. Every card tells a story of greatness.',
    lookingFor: ['T206 Honus Wagner', 'Pre-war stars', 'Iconic game-used memorabilia'],
    willingToTrade: ['Very selective, upgrades only'],
  },
  {
    id: 'col_012',
    username: 'SmartFlips',
    avatar: 'SF',
    joinDate: '2023-08-08',
    collectionSize: 175,
    collectionValue: 12300,
    primaryArchetype: 'flipper',
    secondaryArchetype: 'diversifier',
    dna: { vintage_purist: 2, prospect_hunter: 10, grade_snob: 5, set_builder: 3, flipper: 50, trophy_hunter: 5, diversifier: 25 },
    topPlayers: ['Rotating based on market', 'Multi-sport coverage'],
    topSets: ['Whatever is hot', 'Break inventory'],
    avgGrade: 8.2,
    tradeCount: 620,
    reputationScore: 88,
    bio: 'Data-driven flips across all sports. Spreadsheets do not lie.',
    lookingFor: ['Arbitrage opportunities', 'Underpriced cross-sport parallels'],
    willingToTrade: ['Everything has a price'],
  },
  {
    id: 'col_013',
    username: 'AllSportAlex',
    avatar: 'AS',
    joinDate: '2020-11-15',
    collectionSize: 4200,
    collectionValue: 67000,
    primaryArchetype: 'diversifier',
    secondaryArchetype: 'prospect_hunter',
    dna: { vintage_purist: 8, prospect_hunter: 20, grade_snob: 7, set_builder: 10, flipper: 12, trophy_hunter: 8, diversifier: 35 },
    topPlayers: ['Victor Wembanyama', 'Connor Bedard', 'Caleb Williams', 'Elly De La Cruz'],
    topSets: ['2024 Prizm Basketball', '2024 Upper Deck Hockey', '2024 Topps Chrome Baseball'],
    avgGrade: 8.4,
    tradeCount: 389,
    reputationScore: 92,
    bio: 'Why pick one sport when you can collect them all? True diversification means true opportunity.',
    lookingFor: ['Soccer rising stars', 'F1 cards', 'Niche sport rookies'],
    willingToTrade: ['Sport-specific lots for cross-sport trades'],
  },
  {
    id: 'col_014',
    username: 'SetCompletionist',
    avatar: 'SC',
    joinDate: '2017-03-22',
    collectionSize: 22000,
    collectionValue: 115000,
    primaryArchetype: 'set_builder',
    secondaryArchetype: 'diversifier',
    dna: { vintage_purist: 10, prospect_hunter: 5, grade_snob: 4, set_builder: 48, flipper: 3, trophy_hunter: 6, diversifier: 24 },
    topPlayers: ['Set-focused across sports'],
    topSets: ['Complete Topps run 1980-2025', 'Complete Prizm Basketball 2012-2025'],
    avgGrade: 6.5,
    tradeCount: 712,
    reputationScore: 97,
    bio: '73 complete sets across 4 sports. The checklist is life.',
    lookingFor: ['Short prints to finish sets', 'Variation SPs', 'Insert set completions'],
    willingToTrade: ['Thousands of set duplicates available'],
  },
];

// ---- My Profile (current user) ----

const MY_PROFILE: CollectorProfile = {
  id: 'col_me',
  username: 'You',
  avatar: 'ME',
  joinDate: '2021-01-15',
  collectionSize: 1850,
  collectionValue: 95400,
  primaryArchetype: 'prospect_hunter',
  secondaryArchetype: 'grade_snob',
  dna: { vintage_purist: 8, prospect_hunter: 35, grade_snob: 22, set_builder: 10, flipper: 12, trophy_hunter: 8, diversifier: 5 },
  topPlayers: ['Jackson Holliday', 'Paul Skenes', 'Elly De La Cruz', 'Shohei Ohtani'],
  topSets: ['2024 Bowman Chrome', '2024 Topps Chrome', '2023 Bowman 1st'],
  avgGrade: 9.0,
  tradeCount: 234,
  reputationScore: 95,
  bio: 'Data-driven collector focused on the next generation of stars with an eye for condition.',
  lookingFor: ['2025 Bowman 1st autos', 'PSA 10 rookie parallels', 'International prospect cards'],
  willingToTrade: ['Graduated prospects', 'Duplicate refractors', 'Non-auto base'],
};

// ---- Matches ----

const COLLECTOR_MATCHES: CollectorMatch[] = [
  {
    collector: COLLECTOR_PROFILES[0], // VintageVault87
    matchScore: { overall: 72, collectionOverlap: 15, archetypeCompatibility: 65, tradeOpportunity: 92, priceAlignment: 78 },
    matchReasons: [
      'They have vintage stars you lack, you have modern prospects they do not collect',
      'Complementary archetypes: their vintage focus + your prospect focus = great trades',
      'High trade opportunity: minimal collection overlap means many swap options',
    ],
    potentialTrades: [
      { youHave: 'Jackson Holliday Bowman 1st Auto', theyHave: '1969 Topps Nolan Ryan RC', fairness: 88 },
      { youHave: 'Paul Skenes Chrome Refractor', theyHave: '1975 Topps George Brett RC', fairness: 92 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[1], // ProspectKing
    matchScore: { overall: 91, collectionOverlap: 72, archetypeCompatibility: 88, tradeOpportunity: 68, priceAlignment: 95 },
    matchReasons: [
      'Fellow prospect hunter with very similar collecting DNA',
      'Likely to have intel on prospects you are watching',
      'Trade opportunity on duplicate prospect pulls',
    ],
    potentialTrades: [
      { youHave: 'Elly De La Cruz Bowman Sapphire', theyHave: 'Junior Caminero 1st Bowman Auto', fairness: 94 },
      { youHave: 'Dylan Crews Chrome Auto', theyHave: 'Jackson Chourio 1st Chrome', fairness: 90 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[2], // GemMintGary
    matchScore: { overall: 78, collectionOverlap: 35, archetypeCompatibility: 72, tradeOpportunity: 80, priceAlignment: 70 },
    matchReasons: [
      'Shared focus on high-grade cards bridges your collecting styles',
      'You can supply prospect gems, they have modern star PSA 10s',
      'Their grade expertise aligns with your secondary archetype',
    ],
    potentialTrades: [
      { youHave: 'Skenes Bowman 1st PSA 10', theyHave: 'Ohtani Topps Chrome PSA 10', fairness: 85 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[3], // SetMasterSteve
    matchScore: { overall: 55, collectionOverlap: 22, archetypeCompatibility: 40, tradeOpportunity: 88, priceAlignment: 65 },
    matchReasons: [
      'Massive trade inventory from set building duplicates',
      'Can supply specific base cards you need for partial sets',
      'Different collecting goals mean easy trades without competition',
    ],
    potentialTrades: [
      { youHave: 'Modern parallel lot', theyHave: '2024 Topps base set completion', fairness: 80 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[6], // BalancedBen
    matchScore: { overall: 68, collectionOverlap: 30, archetypeCompatibility: 60, tradeOpportunity: 75, priceAlignment: 82 },
    matchReasons: [
      'Diversified collection offers cross-sport trade opportunities',
      'Mutual interest in Ohtani creates conversation starters',
      'Their basketball and football cards expand your horizons',
    ],
    potentialTrades: [
      { youHave: 'Baseball prospect lot', theyHave: 'Wembanyama Prizm Silver', fairness: 88 },
      { youHave: 'Duplicate Chrome refractors', theyHave: 'Mahomes Prizm parallel', fairness: 86 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[7], // RookieRadar
    matchScore: { overall: 89, collectionOverlap: 65, archetypeCompatibility: 92, tradeOpportunity: 72, priceAlignment: 90 },
    matchReasons: [
      'Nearly identical collecting DNA - prospect hunting + grading focus',
      'Cross-sport prospect coverage expands your reach',
      'Data-driven approach matches yours for quality trades',
    ],
    potentialTrades: [
      { youHave: 'Baseball prospect auto lot', theyHave: 'Travis Hunter Prizm Auto', fairness: 91 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[9], // GradeHunterX
    matchScore: { overall: 74, collectionOverlap: 40, archetypeCompatibility: 70, tradeOpportunity: 78, priceAlignment: 72 },
    matchReasons: [
      'Shared grade obsession means understanding of value',
      'Their BGS focus complements your PSA focus for crossover trades',
      'Ohtani overlap creates common ground for big trades',
    ],
    potentialTrades: [
      { youHave: 'PSA 10 prospect lot', theyHave: 'BGS 10 Black Label Henderson', fairness: 82 },
    ],
  },
  {
    collector: COLLECTOR_PROFILES[12], // AllSportAlex
    matchScore: { overall: 65, collectionOverlap: 25, archetypeCompatibility: 55, tradeOpportunity: 85, priceAlignment: 78 },
    matchReasons: [
      'Multi-sport inventory provides unique trade options',
      'Prospect overlap in baseball extends to other sports',
      'Willing to do sport-for-sport lot trades',
    ],
    potentialTrades: [
      { youHave: 'Baseball prospect bulk lot', theyHave: 'Bedard Young Guns PSA 10', fairness: 86 },
    ],
  },
];

// ---- Recommendations ----

const RECOMMENDATION_FEED: RecommendationFeed = {
  generated: '2026-03-13T10:00:00Z',
  items: [
    {
      id: 'rec_001',
      type: 'card',
      title: 'Buy: 2025 Bowman 1st Chrome Auto - Jac Caglianone',
      description: 'Two-way prospect fits your prospect hunter DNA. Low current price with high upside if pitching develops.',
      confidence: 87,
      reasoning: 'Your DNA shows 35% prospect_hunter affinity. Caglianone matches your pattern of two-way player investments.',
      actionLabel: 'View Card',
      priority: 'high',
    },
    {
      id: 'rec_002',
      type: 'collector',
      title: 'Connect with RookieRadar',
      description: '89% DNA match. Cross-sport prospect coverage complements your baseball-focused approach.',
      confidence: 92,
      reasoning: 'Archetype compatibility score of 92% is among the highest in your network. High trade potential.',
      actionLabel: 'View Profile',
      priority: 'high',
    },
    {
      id: 'rec_003',
      type: 'strategy',
      title: 'Diversify into Basketball Prospects',
      description: 'Your 5% diversifier score is well below average (18%). Adding basketball rookies could reduce portfolio risk by 12%.',
      confidence: 78,
      reasoning: 'ML model detects concentration risk in baseball-only collecting. Cross-sport exposure improves Sharpe ratio.',
      actionLabel: 'Explore',
      priority: 'medium',
    },
    {
      id: 'rec_004',
      type: 'card',
      title: 'Grade: Raw Elly De La Cruz Bowman Chrome',
      description: 'Your raw copy has strong centering. Current PSA 10 pop is low, submission could yield 3.5x value increase.',
      confidence: 82,
      reasoning: 'Your grade_snob score (22%) aligns with grading profit strategy. Estimated 75% chance of PSA 10.',
      actionLabel: 'Grade Now',
      priority: 'medium',
    },
    {
      id: 'rec_005',
      type: 'set',
      title: 'Complete: 2024 Topps Chrome Base Set',
      description: 'You are 87% complete. 42 cards remaining, estimated cost $38. Set builder score trending up.',
      confidence: 85,
      reasoning: 'Your set_builder DNA (10%) could increase with completion. Completed sets historically appreciate 15% faster.',
      actionLabel: 'View Missing',
      priority: 'low',
    },
    {
      id: 'rec_006',
      type: 'card',
      title: 'Sell: Paul Skenes Bowman 1st Auto /99',
      description: 'Current market shows 18% premium over 30-day avg. Your flipper DNA suggests capturing this profit window.',
      confidence: 74,
      reasoning: 'Flipper archetype (12%) activates when short-term gains exceed 15%. Current window optimal for exit.',
      actionLabel: 'List Now',
      priority: 'medium',
    },
    {
      id: 'rec_007',
      type: 'collector',
      title: 'Trade with VintageVault87',
      description: '92% trade opportunity score. Your modern prospects for their vintage legends - near zero collection overlap.',
      confidence: 80,
      reasoning: 'Complementary archetype pairing (prospect_hunter + vintage_purist) creates optimal trade dynamics.',
      actionLabel: 'Propose Trade',
      priority: 'high',
    },
    {
      id: 'rec_008',
      type: 'strategy',
      title: 'Increase Grading Submissions',
      description: 'Your grade_snob DNA at 22% but only 40% of eligible cards are graded. Grading backlog represents $8,200 in unlocked value.',
      confidence: 88,
      reasoning: 'Analysis of your raw inventory shows 23 cards with high PSA 10 probability based on centering and surface quality.',
      actionLabel: 'View Queue',
      priority: 'high',
    },
  ],
  archetypeInsight: 'Your Prospect Hunter DNA drives 62% of your recommendations. Consider leaning into your Grade Snob secondary trait for additional value extraction.',
};

// ---- Buyer/Seller Matches ----

const BUYER_SELLER_MATCHES: BuyerSellerMatch[] = [
  {
    id: 'bs_001',
    buyer: MY_PROFILE,
    seller: COLLECTOR_PROFILES[1],
    card: 'Junior Caminero 2023 Bowman 1st Auto PSA 10',
    buyerMaxPrice: 285,
    sellerAskPrice: 260,
    spread: 25,
    matchConfidence: 94,
    reasoning: 'Seller is a fellow prospect hunter graduating this card. Your DNA shows high interest in international prospects.',
  },
  {
    id: 'bs_002',
    buyer: COLLECTOR_PROFILES[2],
    seller: MY_PROFILE,
    card: 'Elly De La Cruz 2024 Topps Chrome Gold /50 PSA 10',
    buyerMaxPrice: 950,
    sellerAskPrice: 880,
    spread: 70,
    matchConfidence: 88,
    reasoning: 'GemMintGary seeks all PSA 10 Chrome parallels. Your prospect rotation may be ready to move this card.',
  },
  {
    id: 'bs_003',
    buyer: COLLECTOR_PROFILES[3],
    seller: COLLECTOR_PROFILES[4],
    card: '2024 Topps Chrome Base Set Lot (180 cards)',
    buyerMaxPrice: 65,
    sellerAskPrice: 55,
    spread: 10,
    matchConfidence: 91,
    reasoning: 'SetMasterSteve needs base for completion. FlipMaster3000 has break leftovers to move quickly.',
  },
  {
    id: 'bs_004',
    buyer: MY_PROFILE,
    seller: COLLECTOR_PROFILES[12],
    card: 'Connor Bedard 2024 Upper Deck Young Guns PSA 10',
    buyerMaxPrice: 420,
    sellerAskPrice: 395,
    spread: 25,
    matchConfidence: 82,
    reasoning: 'Diversifying into hockey aligns with recommendation to increase diversifier score. AllSportAlex is rotating hockey stock.',
  },
  {
    id: 'bs_005',
    buyer: COLLECTOR_PROFILES[5],
    seller: COLLECTOR_PROFILES[10],
    card: '1951 Bowman Mickey Mantle RC PSA 6',
    buyerMaxPrice: 185000,
    sellerAskPrice: 175000,
    spread: 10000,
    matchConfidence: 96,
    reasoning: 'WhaleCollector is the ultimate trophy buyer. TrophyCaseTina is considering an upgrade to PSA 7, making PSA 6 available.',
  },
  {
    id: 'bs_006',
    buyer: COLLECTOR_PROFILES[9],
    seller: MY_PROFILE,
    card: 'Jackson Holliday 2024 Bowman Chrome Auto BGS 9.5',
    buyerMaxPrice: 340,
    sellerAskPrice: 310,
    spread: 30,
    matchConfidence: 85,
    reasoning: 'GradeHunterX wants to crossover to PSA. Your BGS 9.5 is a strong candidate for PSA 10 crossover.',
  },
];

// ---- Public API ----

export function getArchetypeLabel(archetype: CollectorArchetype): string {
  return ARCHETYPE_LABELS[archetype];
}

export function getArchetypeDescription(archetype: CollectorArchetype): string {
  return ARCHETYPE_DESCRIPTIONS[archetype];
}

export function getArchetypeColor(archetype: CollectorArchetype): { text: string; bg: string; border: string } {
  return ARCHETYPE_COLORS[archetype];
}

export function getMyDNA(): CollectorProfile {
  const cached = loadData<CollectorProfile>('my_profile');
  if (cached) return cached;
  saveData('my_profile', MY_PROFILE);
  return MY_PROFILE;
}

export function getCollectorProfile(id: string): CollectorProfile | undefined {
  if (id === 'col_me') return getMyDNA();
  return COLLECTOR_PROFILES.find(p => p.id === id);
}

export function getAllCollectors(): CollectorProfile[] {
  return COLLECTOR_PROFILES;
}

export function findMatches(): CollectorMatch[] {
  const cached = loadData<CollectorMatch[]>('matches');
  if (cached) return cached;
  saveData('matches', COLLECTOR_MATCHES);
  return COLLECTOR_MATCHES;
}

export function getRecommendations(): RecommendationFeed {
  const cached = loadData<RecommendationFeed>('recommendations');
  if (cached) return cached;
  saveData('recommendations', RECOMMENDATION_FEED);
  return RECOMMENDATION_FEED;
}

export function getBuyerSellerMatches(): BuyerSellerMatch[] {
  const cached = loadData<BuyerSellerMatch[]>('buyer_seller');
  if (cached) return cached;
  saveData('buyer_seller', BUYER_SELLER_MATCHES);
  return BUYER_SELLER_MATCHES;
}

export function getArchetypeBreakdown(): { archetype: CollectorArchetype; label: string; value: number; description: string }[] {
  const myDna = getMyDNA();
  return (Object.keys(myDna.dna) as CollectorArchetype[]).map(key => ({
    archetype: key,
    label: ARCHETYPE_LABELS[key],
    value: myDna.dna[key],
    description: ARCHETYPE_DESCRIPTIONS[key],
  }));
}

export function getSimilarCollectors(): CollectorMatch[] {
  return COLLECTOR_MATCHES
    .filter(m => m.matchScore.archetypeCompatibility >= 70)
    .sort((a, b) => b.matchScore.overall - a.matchScore.overall);
}

export function getComplementaryCollectors(): CollectorMatch[] {
  return COLLECTOR_MATCHES
    .filter(m => m.matchScore.tradeOpportunity >= 75 && m.matchScore.collectionOverlap < 40)
    .sort((a, b) => b.matchScore.tradeOpportunity - a.matchScore.tradeOpportunity);
}

export function getCollectorDnaStats(): CollectorDnaStats {
  const matches = findMatches();
  const avgMatch = matches.reduce((sum, m) => sum + m.matchScore.overall, 0) / matches.length;
  return {
    totalCollectors: COLLECTOR_PROFILES.length,
    avgMatchScore: Math.round(avgMatch),
    topArchetype: 'prospect_hunter',
    activeMatches: matches.filter(m => m.matchScore.overall >= 70).length,
    tradeOpportunities: BUYER_SELLER_MATCHES.length,
    recommendationsGenerated: RECOMMENDATION_FEED.items.length,
  };
}
