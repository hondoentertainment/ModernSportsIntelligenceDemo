// @ts-nocheck
// Cross-Hobby Collectibles Arbitrage Bridge Service

// ---- Types ----

export interface CrossHobbyItem {
  id: string;
  hobby: 'sports-card' | 'coin' | 'stamp' | 'comic' | 'memorabilia' | 'fine-art' | 'game-worn';
  itemName: string;
  description: string;
  currentValue: number;
  fiveYrCagr: number;
  liquidity: 'low' | 'medium' | 'high';
  scarcity: 'common' | 'scarce' | 'rare' | 'unique';
  relativeValueScore: number;
}

export interface CrossHobbyComparison {
  subject: string;
  subjectType: 'player' | 'team' | 'event';
  items: CrossHobbyItem[];
  relativeValueIndex: number;
  mostUnderpriced: string;
  mostOverpriced: string;
  arbitrageOpportunity: number;
}

export interface ArbitrageSignal {
  id: string;
  buyHobby: string;
  sellHobby: string;
  subject: string;
  buyItem: string;
  sellItem: string;
  potentialGain: number;
  rationale: string;
  timeHorizon: string;
  confidence: number;
}

export interface HobbyCorrelation {
  hobby1: string;
  hobby2: string;
  correlation: number;
  subject: string;
  description: string;
}

export interface CrossHobbyTrend {
  month: string;
  sportsCards: number;
  coins: number;
  stamps: number;
  comics: number;
  memorabilia: number;
}

// ---- Mock Data ----

const comparisons: CrossHobbyComparison[] = [
  {
    subject: 'Babe Ruth',
    subjectType: 'player',
    relativeValueIndex: 112,
    mostUnderpriced: 'Stamp',
    mostOverpriced: 'Sports Card',
    arbitrageOpportunity: 34,
    items: [
      {
        id: 'ruth-sc',
        hobby: 'sports-card',
        itemName: '1933 Goudey Babe Ruth #181 PSA 5',
        description: 'One of four Ruth Goudey cards from the iconic 1933 set. Cornerstone vintage piece.',
        currentValue: 42000,
        fiveYrCagr: 18.4,
        liquidity: 'medium',
        scarcity: 'rare',
        relativeValueScore: 138,
      },
      {
        id: 'ruth-coin',
        hobby: 'coin',
        itemName: '1995 Baseball Hall of Fame Silver Dollar (Ruth)',
        description: 'US Mint commemorative silver dollar honoring Babe Ruth. Proof-69 DCAM.',
        currentValue: 85,
        fiveYrCagr: 3.1,
        liquidity: 'high',
        scarcity: 'common',
        relativeValueScore: 72,
      },
      {
        id: 'ruth-stamp',
        hobby: 'stamp',
        itemName: '1983 US Commemorative Stamp Block — Babe Ruth',
        description: 'Mint condition plate block of 4. Underappreciated by hobby mainstream.',
        currentValue: 28,
        fiveYrCagr: 2.2,
        liquidity: 'low',
        scarcity: 'common',
        relativeValueScore: 58,
      },
      {
        id: 'ruth-comic',
        hobby: 'comic',
        itemName: 'Babe Ruth Sports Comics #1 (1949)',
        description: 'Harvey Publications. First issue dedicated to Ruth. CGC 6.0.',
        currentValue: 1200,
        fiveYrCagr: 9.7,
        liquidity: 'low',
        scarcity: 'scarce',
        relativeValueScore: 81,
      },
      {
        id: 'ruth-memo',
        hobby: 'memorabilia',
        itemName: 'Signed Babe Ruth Baseball (JSA Full)',
        description: 'Single-signed OAL baseball with full JSA LOA. Near fine condition.',
        currentValue: 185000,
        fiveYrCagr: 11.2,
        liquidity: 'low',
        scarcity: 'rare',
        relativeValueScore: 95,
      },
      {
        id: 'ruth-art',
        hobby: 'fine-art',
        itemName: 'Limited Edition Lithograph by Leroy Neiman (Ruth)',
        description: 'Signed and numbered 47/350. Published 1979. Museum quality framing.',
        currentValue: 3800,
        fiveYrCagr: 5.6,
        liquidity: 'low',
        scarcity: 'scarce',
        relativeValueScore: 79,
      },
    ],
  },
  {
    subject: 'Michael Jordan',
    subjectType: 'player',
    relativeValueIndex: 108,
    mostUnderpriced: 'Comic',
    mostOverpriced: 'Sports Card',
    arbitrageOpportunity: 28,
    items: [
      {
        id: 'mj-sc',
        hobby: 'sports-card',
        itemName: '1986-87 Fleer #57 Michael Jordan RC PSA 9',
        description: 'The holy grail of modern era basketball cards. Near-mint condition.',
        currentValue: 28000,
        fiveYrCagr: 22.1,
        liquidity: 'high',
        scarcity: 'scarce',
        relativeValueScore: 142,
      },
      {
        id: 'mj-coin',
        hobby: 'coin',
        itemName: '1992 Dream Team Gold Coin — Jordan',
        description: 'Private mint commemorative from the Barcelona Olympics. 1 oz gold.',
        currentValue: 2200,
        fiveYrCagr: 6.8,
        liquidity: 'medium',
        scarcity: 'scarce',
        relativeValueScore: 88,
      },
      {
        id: 'mj-comic',
        hobby: 'comic',
        itemName: 'Air Jordan: The Comic (1993 Valiant)',
        description: 'Official Nike-authorized comic. First print run. Near mint unread copy.',
        currentValue: 350,
        fiveYrCagr: 14.2,
        liquidity: 'low',
        scarcity: 'scarce',
        relativeValueScore: 67,
      },
      {
        id: 'mj-worn',
        hobby: 'game-worn',
        itemName: 'Jordan 1992 NBA Finals Game-Worn Jersey (UDA)',
        description: 'Upper Deck Authenticated. Championships-era. LOA from Bulls organization.',
        currentValue: 320000,
        fiveYrCagr: 14.7,
        liquidity: 'low',
        scarcity: 'unique',
        relativeValueScore: 104,
      },
      {
        id: 'mj-memo',
        hobby: 'memorabilia',
        itemName: 'Signed Jordan Dunk Photo — UDA 8x10',
        description: 'Upper Deck Authenticated. Iconic dunk photo. Mass signed run of 500.',
        currentValue: 1800,
        fiveYrCagr: 7.3,
        liquidity: 'high',
        scarcity: 'common',
        relativeValueScore: 91,
      },
    ],
  },
  {
    subject: 'Muhammad Ali',
    subjectType: 'player',
    relativeValueIndex: 97,
    mostUnderpriced: 'Stamp',
    mostOverpriced: 'Game-Worn',
    arbitrageOpportunity: 41,
    items: [
      {
        id: 'ali-sc',
        hobby: 'sports-card',
        itemName: '1971 Topps Muhammad Ali #68 PSA 8',
        description: 'Rare boxing card from the famous Topps set. Scarce in high grade.',
        currentValue: 3400,
        fiveYrCagr: 12.9,
        liquidity: 'medium',
        scarcity: 'rare',
        relativeValueScore: 107,
      },
      {
        id: 'ali-stamp',
        hobby: 'stamp',
        itemName: '1978 Commemorative Stamp — Ali vs. Frazier Block',
        description: 'International issue. Rarely traded in US market. Extremely undervalued.',
        currentValue: 45,
        fiveYrCagr: 1.8,
        liquidity: 'low',
        scarcity: 'scarce',
        relativeValueScore: 44,
      },
      {
        id: 'ali-coin',
        hobby: 'coin',
        itemName: '2016 Republic of Congo Silver Coin — Ali',
        description: 'Limited to 1,000 pieces. .999 silver. Hand-numbered.',
        currentValue: 145,
        fiveYrCagr: 4.4,
        liquidity: 'low',
        scarcity: 'scarce',
        relativeValueScore: 78,
      },
      {
        id: 'ali-worn',
        hobby: 'game-worn',
        itemName: 'Ali Fight-Worn Boxing Gloves — Thrilla in Manila (1975)',
        description: 'Authenticated by Ali Estate. PSA/DNA certified. One of only 3 known pairs.',
        currentValue: 195000,
        fiveYrCagr: 10.1,
        liquidity: 'low',
        scarcity: 'unique',
        relativeValueScore: 132,
      },
      {
        id: 'ali-memo',
        hobby: 'memorabilia',
        itemName: 'Ali Signed Boxing Glove (PSA/DNA Slabbed)',
        description: 'Single glove, signed in gold marker. PSA 9 autograph grade.',
        currentValue: 8500,
        fiveYrCagr: 9.2,
        liquidity: 'medium',
        scarcity: 'scarce',
        relativeValueScore: 99,
      },
    ],
  },
  {
    subject: 'Mickey Mantle',
    subjectType: 'player',
    relativeValueIndex: 115,
    mostUnderpriced: 'Fine Art',
    mostOverpriced: 'Sports Card',
    arbitrageOpportunity: 38,
    items: [
      {
        id: 'mantle-sc',
        hobby: 'sports-card',
        itemName: '1952 Topps Mickey Mantle #311 PSA 6',
        description: 'The most iconic card in the hobby. High-number series. Signature piece.',
        currentValue: 750000,
        fiveYrCagr: 29.3,
        liquidity: 'medium',
        scarcity: 'unique',
        relativeValueScore: 151,
      },
      {
        id: 'mantle-coin',
        hobby: 'coin',
        itemName: '1995 Baseball Hall of Fame Silver Dollar (Mantle)',
        description: 'Official US Mint HOF issue. Proof finish. Common but well-struck.',
        currentValue: 80,
        fiveYrCagr: 2.9,
        liquidity: 'high',
        scarcity: 'common',
        relativeValueScore: 68,
      },
      {
        id: 'mantle-memo',
        hobby: 'memorabilia',
        itemName: 'Signed Mantle 8x10 — 1956 Triple Crown Year (PSA/DNA)',
        description: 'Bold blue ink signature on posed batting photo. Grade 9.',
        currentValue: 4200,
        fiveYrCagr: 8.1,
        liquidity: 'medium',
        scarcity: 'scarce',
        relativeValueScore: 88,
      },
      {
        id: 'mantle-art',
        hobby: 'fine-art',
        itemName: 'Andy Warhol-Style Mantle Limited Print (1998 Hamilton)',
        description: 'Numbered 112/500. Pop art treatment of 1956 Topps card image. Signed by artist.',
        currentValue: 890,
        fiveYrCagr: 6.4,
        liquidity: 'low',
        scarcity: 'scarce',
        relativeValueScore: 62,
      },
      {
        id: 'mantle-worn',
        hobby: 'game-worn',
        itemName: 'Mantle Game-Used Bat 1961 Season (PSA GU 8)',
        description: 'Cracked handle. Clear use evidence. From 61-homer season.',
        currentValue: 82000,
        fiveYrCagr: 12.3,
        liquidity: 'low',
        scarcity: 'rare',
        relativeValueScore: 97,
      },
    ],
  },
  {
    subject: 'LeBron James',
    subjectType: 'player',
    relativeValueIndex: 103,
    mostUnderpriced: 'Stamp',
    mostOverpriced: 'Sports Card',
    arbitrageOpportunity: 22,
    items: [
      {
        id: 'lebron-sc',
        hobby: 'sports-card',
        itemName: '2003-04 Topps Chrome LeBron James RC PSA 10',
        description: 'Key modern era rookie. High demand from basketball collectors worldwide.',
        currentValue: 6800,
        fiveYrCagr: 16.2,
        liquidity: 'high',
        scarcity: 'scarce',
        relativeValueScore: 122,
      },
      {
        id: 'lebron-coin',
        hobby: 'coin',
        itemName: '2012 USA Olympic Silver Coin — LeBron James',
        description: 'Private mint commemorative. London Olympics. 1 oz silver.',
        currentValue: 95,
        fiveYrCagr: 3.8,
        liquidity: 'medium',
        scarcity: 'common',
        relativeValueScore: 80,
      },
      {
        id: 'lebron-worn',
        hobby: 'game-worn',
        itemName: 'LeBron 2016 Finals Game-Worn Cavs Jersey (Fanatics)',
        description: 'Championship-winning game. LOA from Cavaliers. Photo-matched.',
        currentValue: 74000,
        fiveYrCagr: 18.9,
        liquidity: 'low',
        scarcity: 'rare',
        relativeValueScore: 108,
      },
      {
        id: 'lebron-memo',
        hobby: 'memorabilia',
        itemName: 'LeBron Signed Basketball — 2016 Championship (UDA)',
        description: 'Full size Spalding NBA ball. Upper Deck Authenticated. Limited to 123.',
        currentValue: 3200,
        fiveYrCagr: 10.4,
        liquidity: 'medium',
        scarcity: 'scarce',
        relativeValueScore: 93,
      },
      {
        id: 'lebron-art',
        hobby: 'fine-art',
        itemName: 'LeBron James SLAM Magazine Cover Original Art (2004)',
        description: 'Original acrylic on board by SLAM house artist. 16x20in. Authenticated.',
        currentValue: 5400,
        fiveYrCagr: 7.8,
        liquidity: 'low',
        scarcity: 'unique',
        relativeValueScore: 85,
      },
    ],
  },
];

const arbitrageSignals: ArbitrageSignal[] = [
  {
    id: 'arb-001',
    buyHobby: 'Stamp',
    sellHobby: 'Sports Card',
    subject: 'Babe Ruth',
    buyItem: '1983 US Commemorative Stamp Block — Babe Ruth',
    sellItem: '1933 Goudey Babe Ruth #181 PSA 5',
    potentialGain: 34,
    rationale: 'Ruth stamp trades at a 42-point relative value discount vs. his cards. Same cultural icon, dramatically less collector awareness in the philately market.',
    timeHorizon: '18–36 months',
    confidence: 72,
  },
  {
    id: 'arb-002',
    buyHobby: 'Comic',
    sellHobby: 'Sports Card',
    subject: 'Michael Jordan',
    buyItem: 'Air Jordan: The Comic (1993 Valiant)',
    sellItem: '1986-87 Fleer #57 Michael Jordan RC PSA 9',
    potentialGain: 28,
    rationale: 'Jordan comics have a relative value score 75 points below his cards. Cross-hobby crossover buyers are entering the comics market as card prices peak.',
    timeHorizon: '12–24 months',
    confidence: 68,
  },
  {
    id: 'arb-003',
    buyHobby: 'Stamp',
    sellHobby: 'Game-Worn',
    subject: 'Muhammad Ali',
    buyItem: '1978 Commemorative Stamp — Ali vs. Frazier Block',
    sellItem: 'Ali Fight-Worn Boxing Gloves — Thrilla in Manila (1975)',
    potentialGain: 41,
    rationale: 'Ali stamps are 56 points underpriced relative to his fight-worn equipment. As the stamp market modernizes with younger collectors, Ali memorabilia crossover demand is rising.',
    timeHorizon: '24–48 months',
    confidence: 61,
  },
  {
    id: 'arb-004',
    buyHobby: 'Fine Art',
    sellHobby: 'Sports Card',
    subject: 'Mickey Mantle',
    buyItem: 'Andy Warhol-Style Mantle Limited Print (1998 Hamilton)',
    sellItem: '1952 Topps Mickey Mantle #311 PSA 6',
    potentialGain: 38,
    rationale: 'Pop art prints of Mantle are 89 points underpriced compared to his cards. Card market is near historical peak; art market has strong institutional buyer base.',
    timeHorizon: '12–30 months',
    confidence: 74,
  },
  {
    id: 'arb-005',
    buyHobby: 'Coin',
    sellHobby: 'Sports Card',
    subject: 'Babe Ruth',
    buyItem: '1995 Baseball Hall of Fame Silver Dollar (Ruth)',
    sellItem: '1933 Goudey Babe Ruth #181 PSA 5',
    potentialGain: 22,
    rationale: 'HOF coins are widely ignored by sports card collectors despite Ruth\'s universal appeal. Coin market liquidity is actually higher for this specific piece.',
    timeHorizon: '6–18 months',
    confidence: 55,
  },
  {
    id: 'arb-006',
    buyHobby: 'Memorabilia',
    sellHobby: 'Sports Card',
    subject: 'LeBron James',
    buyItem: 'LeBron Signed Basketball — 2016 Championship (UDA)',
    sellItem: '2003-04 Topps Chrome LeBron James RC PSA 10',
    potentialGain: 18,
    rationale: 'Championship-era signed balls trade at a 29-point discount to his rookie card despite equal authentication and lower population. Name recognition drives card premium.',
    timeHorizon: '12–18 months',
    confidence: 79,
  },
  {
    id: 'arb-007',
    buyHobby: 'Comic',
    sellHobby: 'Game-Worn',
    subject: 'Muhammad Ali',
    buyItem: 'Babe Ruth Sports Comics #1 (1949)',
    sellItem: 'Ali Fight-Worn Boxing Gloves — Thrilla in Manila (1975)',
    potentialGain: 45,
    rationale: 'Pre-1960 sports comics are among the most overlooked collectibles. Ali\'s Thrilla gloves are trophy assets; comics of the same era are penny stocks by comparison.',
    timeHorizon: '36–60 months',
    confidence: 58,
  },
  {
    id: 'arb-008',
    buyHobby: 'Fine Art',
    sellHobby: 'Memorabilia',
    subject: 'LeBron James',
    buyItem: 'LeBron James SLAM Magazine Cover Original Art (2004)',
    sellItem: 'LeBron Signed Basketball — 2016 Championship (UDA)',
    potentialGain: 24,
    rationale: 'Unique original cover art has a single-owner provenance story that mass-signed pieces cannot match. As LeBron approaches career end, original art appreciation expected.',
    timeHorizon: '18–36 months',
    confidence: 65,
  },
];

const hobbyCorrelations: HobbyCorrelation[] = [
  { hobby1: 'Sports Cards', hobby2: 'Memorabilia', correlation: 0.82, subject: 'All', description: 'Strong positive link — both driven by player popularity and milestone events.' },
  { hobby1: 'Sports Cards', hobby2: 'Game-Worn', correlation: 0.71, subject: 'All', description: 'Moderately strong — game-worn follows cards but with longer lag and lower liquidity.' },
  { hobby1: 'Sports Cards', hobby2: 'Comics', correlation: 0.44, subject: 'All', description: 'Moderate correlation — crossover collector base growing, especially for Jordan-era.' },
  { hobby1: 'Sports Cards', hobby2: 'Coins', correlation: 0.28, subject: 'All', description: 'Weak positive — coins are driven more by metal prices than athlete demand.' },
  { hobby1: 'Sports Cards', hobby2: 'Stamps', correlation: 0.15, subject: 'All', description: 'Very weak — stamp market largely independent; different collector demographics.' },
  { hobby1: 'Sports Cards', hobby2: 'Fine Art', correlation: 0.37, subject: 'All', description: 'Weak-to-moderate — fine art is driven by broader art market cycles, not hobby sentiment.' },
  { hobby1: 'Memorabilia', hobby2: 'Game-Worn', correlation: 0.88, subject: 'All', description: 'Very strong — both occupy the "authentic physical connection" collector mindset.' },
  { hobby1: 'Comics', hobby2: 'Stamps', correlation: 0.19, subject: 'All', description: 'Weak — different eras and demographics, minimal overlap in buyer population.' },
];

// Generate 24 months of trend data (index: 100 = Jan 2020 baseline)
const generateTrendData = (): CrossHobbyTrend[] => {
  const months = [
    'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24',
    'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
    'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25',
    'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25',
  ];

  const baseData: Omit<CrossHobbyTrend, 'month'>[] = [
    { sportsCards: 284, coins: 142, stamps: 108, comics: 198, memorabilia: 231 },
    { sportsCards: 291, coins: 145, stamps: 107, comics: 204, memorabilia: 238 },
    { sportsCards: 305, coins: 148, stamps: 109, comics: 212, memorabilia: 244 },
    { sportsCards: 298, coins: 151, stamps: 110, comics: 208, memorabilia: 240 },
    { sportsCards: 312, coins: 154, stamps: 111, comics: 220, memorabilia: 251 },
    { sportsCards: 320, coins: 157, stamps: 112, comics: 228, memorabilia: 259 },
    { sportsCards: 334, coins: 161, stamps: 114, comics: 235, memorabilia: 268 },
    { sportsCards: 341, coins: 158, stamps: 113, comics: 241, memorabilia: 274 },
    { sportsCards: 328, coins: 163, stamps: 115, comics: 237, memorabilia: 270 },
    { sportsCards: 346, coins: 166, stamps: 116, comics: 248, memorabilia: 282 },
    { sportsCards: 359, coins: 169, stamps: 117, comics: 255, memorabilia: 290 },
    { sportsCards: 371, coins: 172, stamps: 119, comics: 264, memorabilia: 298 },
    { sportsCards: 368, coins: 175, stamps: 120, comics: 268, memorabilia: 302 },
    { sportsCards: 381, coins: 178, stamps: 121, comics: 277, memorabilia: 311 },
    { sportsCards: 394, coins: 181, stamps: 123, comics: 284, memorabilia: 318 },
    { sportsCards: 402, coins: 185, stamps: 124, comics: 291, memorabilia: 326 },
    { sportsCards: 415, coins: 188, stamps: 125, comics: 299, memorabilia: 334 },
    { sportsCards: 428, coins: 191, stamps: 127, comics: 307, memorabilia: 342 },
    { sportsCards: 419, coins: 194, stamps: 128, comics: 312, memorabilia: 348 },
    { sportsCards: 436, coins: 197, stamps: 129, comics: 318, memorabilia: 355 },
    { sportsCards: 448, coins: 201, stamps: 131, comics: 326, memorabilia: 362 },
    { sportsCards: 462, coins: 204, stamps: 132, comics: 335, memorabilia: 371 },
    { sportsCards: 471, coins: 207, stamps: 133, comics: 342, memorabilia: 379 },
    { sportsCards: 485, coins: 211, stamps: 135, comics: 351, memorabilia: 388 },
  ];

  return months.map((month, i) => ({ month, ...baseData[i] }));
};

// ---- Exported Functions ----

export function getCrossHobbyComparisons(): CrossHobbyComparison[] {
  return comparisons;
}

export function getCrossHobbyComparison(subject: string): CrossHobbyComparison | undefined {
  return comparisons.find(c => c.subject === subject);
}

export function getArbitrageSignals(): ArbitrageSignal[] {
  return arbitrageSignals;
}

export function getHobbyCorrelations(): HobbyCorrelation[] {
  return hobbyCorrelations;
}

export function getCrossHobbyTrends(): CrossHobbyTrend[] {
  return generateTrendData();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export const HOBBY_LABELS: Record<CrossHobbyItem['hobby'], string> = {
  'sports-card': 'Sports Card',
  coin: 'Coin',
  stamp: 'Stamp',
  comic: 'Comic',
  memorabilia: 'Memorabilia',
  'fine-art': 'Fine Art',
  'game-worn': 'Game-Worn',
};
