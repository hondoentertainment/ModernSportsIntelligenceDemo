// Market Microstructure & Order Flow Analytics Service
// Level 2 market depth for sports cards — bid-ask spread tracking,
// order flow imbalance detection, and liquidity depth visualization.

export type Platform = 'eBay' | 'PWCC' | 'Goldin' | 'Whatnot' | 'COMC';
export type OrderSide = 'bid' | 'ask';
export type BuyerType = 'retail' | 'institutional' | 'dealer';
export type SignalType = 'accumulation' | 'distribution' | 'spoofing' | 'wash-trading' | 'momentum-shift';

export interface OrderBookEntry {
  id: string;
  cardName: string;
  platform: Platform;
  side: OrderSide;
  price: number;
  quantity: number;
  timestamp: string;
  buyerType: BuyerType;
}

export interface MarketDepth {
  cardId: string;
  cardName: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercent: number;
  midPrice: number;
  imbalanceRatio: number;
}

export interface OrderFlowSignal {
  id: string;
  cardName: string;
  signalType: SignalType;
  confidence: number;
  detectedAt: string;
  description: string;
  impactEstimate: string;
}

export interface MicrostructureStats {
  totalCardsMonitored: number;
  avgSpread: number;
  narrowestSpread: number;
  widestSpread: number;
  activeSignals: number;
  institutionalFlowPercent: number;
}

// ---------------------------------------------------------------------------
// Mock Order Book Data — 10 cards with full order books
// ---------------------------------------------------------------------------

function ts(minAgo: number): string {
  return new Date(Date.now() - minAgo * 60_000).toISOString();
}

function entry(
  id: string,
  cardName: string,
  platform: Platform,
  side: OrderSide,
  price: number,
  quantity: number,
  minAgo: number,
  buyerType: BuyerType,
): OrderBookEntry {
  return { id, cardName, platform, side, price, quantity, timestamp: ts(minAgo), buyerType };
}

interface CardBook {
  cardId: string;
  cardName: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

const BOOKS: CardBook[] = [
  {
    cardId: 'mm-001',
    cardName: '2018 Luka Doncic Prizm Silver PSA 10',
    bids: [
      entry('b1-01', '2018 Luka Doncic Prizm Silver PSA 10', 'eBay', 'bid', 4820, 1, 2, 'institutional'),
      entry('b1-02', '2018 Luka Doncic Prizm Silver PSA 10', 'PWCC', 'bid', 4790, 2, 5, 'dealer'),
      entry('b1-03', '2018 Luka Doncic Prizm Silver PSA 10', 'Goldin', 'bid', 4750, 1, 8, 'retail'),
      entry('b1-04', '2018 Luka Doncic Prizm Silver PSA 10', 'eBay', 'bid', 4700, 3, 12, 'retail'),
      entry('b1-05', '2018 Luka Doncic Prizm Silver PSA 10', 'Whatnot', 'bid', 4650, 1, 18, 'institutional'),
      entry('b1-06', '2018 Luka Doncic Prizm Silver PSA 10', 'COMC', 'bid', 4600, 2, 25, 'dealer'),
    ],
    asks: [
      entry('a1-01', '2018 Luka Doncic Prizm Silver PSA 10', 'eBay', 'ask', 4880, 1, 1, 'dealer'),
      entry('a1-02', '2018 Luka Doncic Prizm Silver PSA 10', 'PWCC', 'ask', 4920, 1, 3, 'retail'),
      entry('a1-03', '2018 Luka Doncic Prizm Silver PSA 10', 'Goldin', 'ask', 4980, 2, 7, 'institutional'),
      entry('a1-04', '2018 Luka Doncic Prizm Silver PSA 10', 'eBay', 'ask', 5050, 1, 11, 'retail'),
      entry('a1-05', '2018 Luka Doncic Prizm Silver PSA 10', 'Whatnot', 'ask', 5120, 2, 15, 'dealer'),
      entry('a1-06', '2018 Luka Doncic Prizm Silver PSA 10', 'COMC', 'ask', 5200, 1, 22, 'retail'),
    ],
  },
  {
    cardId: 'mm-002',
    cardName: '2020 Justin Herbert Optic Holo PSA 10',
    bids: [
      entry('b2-01', '2020 Justin Herbert Optic Holo PSA 10', 'eBay', 'bid', 385, 2, 3, 'retail'),
      entry('b2-02', '2020 Justin Herbert Optic Holo PSA 10', 'PWCC', 'bid', 380, 1, 6, 'institutional'),
      entry('b2-03', '2020 Justin Herbert Optic Holo PSA 10', 'Whatnot', 'bid', 375, 3, 10, 'dealer'),
      entry('b2-04', '2020 Justin Herbert Optic Holo PSA 10', 'Goldin', 'bid', 368, 1, 14, 'retail'),
      entry('b2-05', '2020 Justin Herbert Optic Holo PSA 10', 'COMC', 'bid', 360, 2, 20, 'retail'),
    ],
    asks: [
      entry('a2-01', '2020 Justin Herbert Optic Holo PSA 10', 'eBay', 'ask', 399, 1, 2, 'dealer'),
      entry('a2-02', '2020 Justin Herbert Optic Holo PSA 10', 'PWCC', 'ask', 405, 2, 4, 'retail'),
      entry('a2-03', '2020 Justin Herbert Optic Holo PSA 10', 'Goldin', 'ask', 415, 1, 9, 'institutional'),
      entry('a2-04', '2020 Justin Herbert Optic Holo PSA 10', 'Whatnot', 'ask', 425, 1, 13, 'dealer'),
      entry('a2-05', '2020 Justin Herbert Optic Holo PSA 10', 'COMC', 'ask', 440, 2, 19, 'retail'),
    ],
  },
  {
    cardId: 'mm-003',
    cardName: '2011 Mike Trout Update PSA 10',
    bids: [
      entry('b3-01', '2011 Mike Trout Update PSA 10', 'PWCC', 'bid', 38500, 1, 1, 'institutional'),
      entry('b3-02', '2011 Mike Trout Update PSA 10', 'Goldin', 'bid', 38200, 1, 4, 'institutional'),
      entry('b3-03', '2011 Mike Trout Update PSA 10', 'eBay', 'bid', 37800, 1, 9, 'dealer'),
      entry('b3-04', '2011 Mike Trout Update PSA 10', 'PWCC', 'bid', 37200, 1, 15, 'institutional'),
      entry('b3-05', '2011 Mike Trout Update PSA 10', 'Goldin', 'bid', 36500, 1, 22, 'dealer'),
      entry('b3-06', '2011 Mike Trout Update PSA 10', 'eBay', 'bid', 35800, 1, 30, 'retail'),
      entry('b3-07', '2011 Mike Trout Update PSA 10', 'COMC', 'bid', 35000, 1, 40, 'retail'),
    ],
    asks: [
      entry('a3-01', '2011 Mike Trout Update PSA 10', 'PWCC', 'ask', 39200, 1, 2, 'institutional'),
      entry('a3-02', '2011 Mike Trout Update PSA 10', 'Goldin', 'ask', 39800, 1, 5, 'dealer'),
      entry('a3-03', '2011 Mike Trout Update PSA 10', 'eBay', 'ask', 40500, 1, 10, 'retail'),
      entry('a3-04', '2011 Mike Trout Update PSA 10', 'PWCC', 'ask', 41200, 1, 16, 'institutional'),
      entry('a3-05', '2011 Mike Trout Update PSA 10', 'Goldin', 'ask', 42000, 1, 24, 'dealer'),
      entry('a3-06', '2011 Mike Trout Update PSA 10', 'eBay', 'ask', 43000, 1, 35, 'retail'),
      entry('a3-07', '2011 Mike Trout Update PSA 10', 'COMC', 'ask', 44500, 1, 45, 'retail'),
    ],
  },
  {
    cardId: 'mm-004',
    cardName: '2019 Zion Williamson Prizm Base PSA 10',
    bids: [
      entry('b4-01', '2019 Zion Williamson Prizm Base PSA 10', 'eBay', 'bid', 210, 4, 1, 'retail'),
      entry('b4-02', '2019 Zion Williamson Prizm Base PSA 10', 'Whatnot', 'bid', 205, 2, 5, 'retail'),
      entry('b4-03', '2019 Zion Williamson Prizm Base PSA 10', 'PWCC', 'bid', 200, 1, 8, 'dealer'),
      entry('b4-04', '2019 Zion Williamson Prizm Base PSA 10', 'COMC', 'bid', 195, 3, 14, 'retail'),
      entry('b4-05', '2019 Zion Williamson Prizm Base PSA 10', 'Goldin', 'bid', 188, 2, 20, 'dealer'),
    ],
    asks: [
      entry('a4-01', '2019 Zion Williamson Prizm Base PSA 10', 'eBay', 'ask', 235, 2, 2, 'retail'),
      entry('a4-02', '2019 Zion Williamson Prizm Base PSA 10', 'Whatnot', 'ask', 240, 1, 4, 'dealer'),
      entry('a4-03', '2019 Zion Williamson Prizm Base PSA 10', 'PWCC', 'ask', 248, 2, 9, 'retail'),
      entry('a4-04', '2019 Zion Williamson Prizm Base PSA 10', 'COMC', 'ask', 255, 1, 16, 'retail'),
      entry('a4-05', '2019 Zion Williamson Prizm Base PSA 10', 'Goldin', 'ask', 265, 3, 23, 'institutional'),
    ],
  },
  {
    cardId: 'mm-005',
    cardName: '2022 Wembanyama Bowman Chrome Auto',
    bids: [
      entry('b5-01', '2022 Wembanyama Bowman Chrome Auto', 'Goldin', 'bid', 12800, 1, 3, 'institutional'),
      entry('b5-02', '2022 Wembanyama Bowman Chrome Auto', 'PWCC', 'bid', 12600, 1, 7, 'institutional'),
      entry('b5-03', '2022 Wembanyama Bowman Chrome Auto', 'eBay', 'bid', 12400, 1, 11, 'dealer'),
      entry('b5-04', '2022 Wembanyama Bowman Chrome Auto', 'Whatnot', 'bid', 12100, 2, 16, 'retail'),
      entry('b5-05', '2022 Wembanyama Bowman Chrome Auto', 'Goldin', 'bid', 11800, 1, 22, 'dealer'),
      entry('b5-06', '2022 Wembanyama Bowman Chrome Auto', 'COMC', 'bid', 11500, 1, 30, 'retail'),
      entry('b5-07', '2022 Wembanyama Bowman Chrome Auto', 'eBay', 'bid', 11200, 1, 38, 'retail'),
      entry('b5-08', '2022 Wembanyama Bowman Chrome Auto', 'PWCC', 'bid', 10800, 1, 45, 'institutional'),
    ],
    asks: [
      entry('a5-01', '2022 Wembanyama Bowman Chrome Auto', 'Goldin', 'ask', 13100, 1, 2, 'dealer'),
      entry('a5-02', '2022 Wembanyama Bowman Chrome Auto', 'PWCC', 'ask', 13400, 1, 6, 'institutional'),
      entry('a5-03', '2022 Wembanyama Bowman Chrome Auto', 'eBay', 'ask', 13700, 1, 10, 'retail'),
      entry('a5-04', '2022 Wembanyama Bowman Chrome Auto', 'Whatnot', 'ask', 14000, 1, 15, 'dealer'),
      entry('a5-05', '2022 Wembanyama Bowman Chrome Auto', 'Goldin', 'ask', 14500, 1, 21, 'retail'),
      entry('a5-06', '2022 Wembanyama Bowman Chrome Auto', 'COMC', 'ask', 15000, 1, 28, 'institutional'),
    ],
  },
  {
    cardId: 'mm-006',
    cardName: '2018 Shohei Ohtani Topps Chrome PSA 10',
    bids: [
      entry('b6-01', '2018 Shohei Ohtani Topps Chrome PSA 10', 'eBay', 'bid', 1520, 1, 2, 'dealer'),
      entry('b6-02', '2018 Shohei Ohtani Topps Chrome PSA 10', 'PWCC', 'bid', 1500, 2, 6, 'institutional'),
      entry('b6-03', '2018 Shohei Ohtani Topps Chrome PSA 10', 'Goldin', 'bid', 1480, 1, 10, 'retail'),
      entry('b6-04', '2018 Shohei Ohtani Topps Chrome PSA 10', 'Whatnot', 'bid', 1450, 1, 15, 'retail'),
      entry('b6-05', '2018 Shohei Ohtani Topps Chrome PSA 10', 'COMC', 'bid', 1420, 2, 22, 'dealer'),
    ],
    asks: [
      entry('a6-01', '2018 Shohei Ohtani Topps Chrome PSA 10', 'eBay', 'ask', 1560, 1, 1, 'retail'),
      entry('a6-02', '2018 Shohei Ohtani Topps Chrome PSA 10', 'PWCC', 'ask', 1590, 1, 5, 'institutional'),
      entry('a6-03', '2018 Shohei Ohtani Topps Chrome PSA 10', 'Goldin', 'ask', 1620, 2, 9, 'dealer'),
      entry('a6-04', '2018 Shohei Ohtani Topps Chrome PSA 10', 'Whatnot', 'ask', 1650, 1, 14, 'retail'),
      entry('a6-05', '2018 Shohei Ohtani Topps Chrome PSA 10', 'COMC', 'ask', 1700, 1, 21, 'dealer'),
    ],
  },
  {
    cardId: 'mm-007',
    cardName: '2020 Joe Burrow Mosaic Teal PSA 10',
    bids: [
      entry('b7-01', '2020 Joe Burrow Mosaic Teal PSA 10', 'eBay', 'bid', 680, 2, 1, 'retail'),
      entry('b7-02', '2020 Joe Burrow Mosaic Teal PSA 10', 'Whatnot', 'bid', 670, 1, 4, 'institutional'),
      entry('b7-03', '2020 Joe Burrow Mosaic Teal PSA 10', 'PWCC', 'bid', 660, 1, 8, 'dealer'),
      entry('b7-04', '2020 Joe Burrow Mosaic Teal PSA 10', 'Goldin', 'bid', 645, 2, 13, 'retail'),
      entry('b7-05', '2020 Joe Burrow Mosaic Teal PSA 10', 'COMC', 'bid', 630, 1, 19, 'dealer'),
      entry('b7-06', '2020 Joe Burrow Mosaic Teal PSA 10', 'eBay', 'bid', 615, 3, 26, 'retail'),
    ],
    asks: [
      entry('a7-01', '2020 Joe Burrow Mosaic Teal PSA 10', 'eBay', 'ask', 720, 1, 2, 'dealer'),
      entry('a7-02', '2020 Joe Burrow Mosaic Teal PSA 10', 'Whatnot', 'ask', 735, 1, 5, 'retail'),
      entry('a7-03', '2020 Joe Burrow Mosaic Teal PSA 10', 'PWCC', 'ask', 750, 2, 9, 'institutional'),
      entry('a7-04', '2020 Joe Burrow Mosaic Teal PSA 10', 'Goldin', 'ask', 770, 1, 14, 'retail'),
      entry('a7-05', '2020 Joe Burrow Mosaic Teal PSA 10', 'COMC', 'ask', 790, 1, 20, 'dealer'),
      entry('a7-06', '2020 Joe Burrow Mosaic Teal PSA 10', 'eBay', 'ask', 815, 2, 28, 'retail'),
    ],
  },
  {
    cardId: 'mm-008',
    cardName: '2003 LeBron James Topps Chrome PSA 9',
    bids: [
      entry('b8-01', '2003 LeBron James Topps Chrome PSA 9', 'Goldin', 'bid', 22000, 1, 4, 'institutional'),
      entry('b8-02', '2003 LeBron James Topps Chrome PSA 9', 'PWCC', 'bid', 21800, 1, 8, 'institutional'),
      entry('b8-03', '2003 LeBron James Topps Chrome PSA 9', 'eBay', 'bid', 21500, 1, 12, 'dealer'),
      entry('b8-04', '2003 LeBron James Topps Chrome PSA 9', 'Goldin', 'bid', 21000, 1, 18, 'dealer'),
      entry('b8-05', '2003 LeBron James Topps Chrome PSA 9', 'PWCC', 'bid', 20500, 1, 25, 'retail'),
    ],
    asks: [
      entry('a8-01', '2003 LeBron James Topps Chrome PSA 9', 'Goldin', 'ask', 22800, 1, 3, 'institutional'),
      entry('a8-02', '2003 LeBron James Topps Chrome PSA 9', 'PWCC', 'ask', 23200, 1, 7, 'dealer'),
      entry('a8-03', '2003 LeBron James Topps Chrome PSA 9', 'eBay', 'ask', 23800, 1, 11, 'retail'),
      entry('a8-04', '2003 LeBron James Topps Chrome PSA 9', 'Goldin', 'ask', 24500, 1, 17, 'dealer'),
      entry('a8-05', '2003 LeBron James Topps Chrome PSA 9', 'PWCC', 'ask', 25200, 1, 24, 'retail'),
    ],
  },
  {
    cardId: 'mm-009',
    cardName: '2021 Trevor Lawrence Prizm Silver PSA 10',
    bids: [
      entry('b9-01', '2021 Trevor Lawrence Prizm Silver PSA 10', 'eBay', 'bid', 142, 5, 2, 'retail'),
      entry('b9-02', '2021 Trevor Lawrence Prizm Silver PSA 10', 'Whatnot', 'bid', 138, 3, 6, 'retail'),
      entry('b9-03', '2021 Trevor Lawrence Prizm Silver PSA 10', 'COMC', 'bid', 135, 8, 10, 'dealer'),
      entry('b9-04', '2021 Trevor Lawrence Prizm Silver PSA 10', 'eBay', 'bid', 130, 4, 16, 'retail'),
      entry('b9-05', '2021 Trevor Lawrence Prizm Silver PSA 10', 'PWCC', 'bid', 125, 2, 22, 'institutional'),
      entry('b9-06', '2021 Trevor Lawrence Prizm Silver PSA 10', 'Whatnot', 'bid', 120, 6, 30, 'retail'),
    ],
    asks: [
      entry('a9-01', '2021 Trevor Lawrence Prizm Silver PSA 10', 'eBay', 'ask', 165, 2, 1, 'retail'),
      entry('a9-02', '2021 Trevor Lawrence Prizm Silver PSA 10', 'Whatnot', 'ask', 170, 1, 5, 'dealer'),
      entry('a9-03', '2021 Trevor Lawrence Prizm Silver PSA 10', 'COMC', 'ask', 178, 3, 9, 'retail'),
      entry('a9-04', '2021 Trevor Lawrence Prizm Silver PSA 10', 'eBay', 'ask', 185, 2, 15, 'retail'),
      entry('a9-05', '2021 Trevor Lawrence Prizm Silver PSA 10', 'PWCC', 'ask', 195, 1, 21, 'dealer'),
    ],
  },
  {
    cardId: 'mm-010',
    cardName: '2023 Caleb Williams Bowman Chrome Auto',
    bids: [
      entry('b10-01', '2023 Caleb Williams Bowman Chrome Auto', 'eBay', 'bid', 520, 2, 1, 'institutional'),
      entry('b10-02', '2023 Caleb Williams Bowman Chrome Auto', 'Goldin', 'bid', 510, 1, 5, 'institutional'),
      entry('b10-03', '2023 Caleb Williams Bowman Chrome Auto', 'PWCC', 'bid', 500, 1, 9, 'dealer'),
      entry('b10-04', '2023 Caleb Williams Bowman Chrome Auto', 'Whatnot', 'bid', 490, 3, 14, 'retail'),
      entry('b10-05', '2023 Caleb Williams Bowman Chrome Auto', 'COMC', 'bid', 478, 2, 20, 'retail'),
      entry('b10-06', '2023 Caleb Williams Bowman Chrome Auto', 'eBay', 'bid', 465, 1, 27, 'dealer'),
      entry('b10-07', '2023 Caleb Williams Bowman Chrome Auto', 'Goldin', 'bid', 450, 2, 35, 'retail'),
    ],
    asks: [
      entry('a10-01', '2023 Caleb Williams Bowman Chrome Auto', 'eBay', 'ask', 545, 1, 2, 'dealer'),
      entry('a10-02', '2023 Caleb Williams Bowman Chrome Auto', 'Goldin', 'ask', 555, 1, 6, 'retail'),
      entry('a10-03', '2023 Caleb Williams Bowman Chrome Auto', 'PWCC', 'ask', 568, 2, 10, 'institutional'),
      entry('a10-04', '2023 Caleb Williams Bowman Chrome Auto', 'Whatnot', 'ask', 580, 1, 15, 'retail'),
      entry('a10-05', '2023 Caleb Williams Bowman Chrome Auto', 'COMC', 'ask', 595, 1, 21, 'dealer'),
      entry('a10-06', '2023 Caleb Williams Bowman Chrome Auto', 'eBay', 'ask', 610, 2, 29, 'retail'),
      entry('a10-07', '2023 Caleb Williams Bowman Chrome Auto', 'Goldin', 'ask', 630, 1, 37, 'institutional'),
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock Order Flow Signals
// ---------------------------------------------------------------------------

const SIGNALS: OrderFlowSignal[] = [
  {
    id: 'sig-001',
    cardName: '2022 Wembanyama Bowman Chrome Auto',
    signalType: 'accumulation',
    confidence: 94,
    detectedAt: ts(12),
    description: 'Two institutional accounts accumulated 6 units across Goldin and PWCC in the last 48 hours. Bid depth increased 35% on the buy side.',
    impactEstimate: '+8-12% price increase within 2 weeks',
  },
  {
    id: 'sig-002',
    cardName: '2019 Zion Williamson Prizm Base PSA 10',
    signalType: 'distribution',
    confidence: 78,
    detectedAt: ts(45),
    description: 'Dealer accounts placed 11 ask orders across eBay and Whatnot in 6 hours. Ask-side depth surged while bid depth thinned.',
    impactEstimate: '-5-8% price decline expected',
  },
  {
    id: 'sig-003',
    cardName: '2003 LeBron James Topps Chrome PSA 9',
    signalType: 'spoofing',
    confidence: 87,
    detectedAt: ts(90),
    description: 'Large bid ($21,800) placed and cancelled 3 times in 30 minutes on PWCC. Pattern consistent with price manipulation to attract sellers.',
    impactEstimate: 'Artificial support level — caution advised',
  },
  {
    id: 'sig-004',
    cardName: '2021 Trevor Lawrence Prizm Silver PSA 10',
    signalType: 'wash-trading',
    confidence: 82,
    detectedAt: ts(120),
    description: 'Same buyer/seller fingerprint detected across 4 transactions on eBay. Volume inflated ~$2,400 in artificial turnover.',
    impactEstimate: 'Inflated volume — true demand 40% lower',
  },
  {
    id: 'sig-005',
    cardName: '2018 Luka Doncic Prizm Silver PSA 10',
    signalType: 'momentum-shift',
    confidence: 71,
    detectedAt: ts(180),
    description: 'Bid-ask imbalance flipped from 0.62 to 1.38 in 4 hours. Institutional bids stacking at $4,750-$4,820 range.',
    impactEstimate: 'Bullish reversal — +4-6% near-term',
  },
  {
    id: 'sig-006',
    cardName: '2023 Caleb Williams Bowman Chrome Auto',
    signalType: 'accumulation',
    confidence: 88,
    detectedAt: ts(240),
    description: 'Institutional buyer placed staggered bids across 3 platforms at progressively higher prices. Classic accumulation ladder pattern.',
    impactEstimate: '+6-10% within 1 week',
  },
  {
    id: 'sig-007',
    cardName: '2020 Joe Burrow Mosaic Teal PSA 10',
    signalType: 'spoofing',
    confidence: 73,
    detectedAt: ts(300),
    description: 'Ask-side wall of $750 x 5 units appeared and vanished twice on Whatnot. Likely intended to suppress buying pressure.',
    impactEstimate: 'Resistance at $750 is artificial',
  },
  {
    id: 'sig-008',
    cardName: '2018 Shohei Ohtani Topps Chrome PSA 10',
    signalType: 'momentum-shift',
    confidence: 65,
    detectedAt: ts(360),
    description: 'Spread narrowed from 4.2% to 2.6% as dealer asks dropped. Increasing buy-side conviction detected.',
    impactEstimate: 'Neutral-to-bullish — monitor for breakout',
  },
];

// ---------------------------------------------------------------------------
// Computed helpers
// ---------------------------------------------------------------------------

function buildDepth(book: CardBook): MarketDepth {
  const sortedBids = [...book.bids].sort((a, b) => b.price - a.price);
  const sortedAsks = [...book.asks].sort((a, b) => a.price - b.price);

  const bestBid = sortedBids[0]?.price ?? 0;
  const bestAsk = sortedAsks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;

  const bidVolume = sortedBids.reduce((s, o) => s + o.quantity, 0);
  const askVolume = sortedAsks.reduce((s, o) => s + o.quantity, 0);
  const imbalanceRatio = askVolume > 0 ? bidVolume / askVolume : 1;

  return {
    cardId: book.cardId,
    cardName: book.cardName,
    bids: sortedBids,
    asks: sortedAsks,
    spread,
    spreadPercent,
    midPrice,
    imbalanceRatio,
  };
}

const ALL_DEPTHS: MarketDepth[] = BOOKS.map(buildDepth);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getMarketDepth(cardId: string): MarketDepth | undefined {
  return ALL_DEPTHS.find((d) => d.cardId === cardId);
}

export function getAllMarketDepths(): MarketDepth[] {
  return ALL_DEPTHS;
}

export function getOrderFlowSignals(): OrderFlowSignal[] {
  return SIGNALS;
}

export function getMicrostructureStats(): MicrostructureStats {
  const spreads = ALL_DEPTHS.map((d) => d.spreadPercent);
  const avgSpread = spreads.reduce((s, v) => s + v, 0) / spreads.length;
  const narrowestSpread = Math.min(...spreads);
  const widestSpread = Math.max(...spreads);

  const allOrders = ALL_DEPTHS.flatMap((d) => [...d.bids, ...d.asks]);
  const institutional = allOrders.filter((o) => o.buyerType === 'institutional');
  const institutionalFlowPercent =
    allOrders.length > 0 ? (institutional.length / allOrders.length) * 100 : 0;

  return {
    totalCardsMonitored: ALL_DEPTHS.length,
    avgSpread: Math.round(avgSpread * 100) / 100,
    narrowestSpread: Math.round(narrowestSpread * 100) / 100,
    widestSpread: Math.round(widestSpread * 100) / 100,
    activeSignals: SIGNALS.length,
    institutionalFlowPercent: Math.round(institutionalFlowPercent * 10) / 10,
  };
}

export function getTopSpreads(limit = 5): MarketDepth[] {
  return [...ALL_DEPTHS].sort((a, b) => a.spreadPercent - b.spreadPercent).slice(0, limit);
}

export function detectAnomalies(): OrderFlowSignal[] {
  return SIGNALS.filter(
    (s) => s.signalType === 'spoofing' || s.signalType === 'wash-trading',
  );
}

export function getInstitutionalFlow(): {
  totalOrders: number;
  institutionalOrders: number;
  percent: number;
  topCards: { cardName: string; count: number }[];
} {
  const allOrders = ALL_DEPTHS.flatMap((d) => [...d.bids, ...d.asks]);
  const institutional = allOrders.filter((o) => o.buyerType === 'institutional');

  const cardCounts: Record<string, number> = {};
  for (const o of institutional) {
    cardCounts[o.cardName] = (cardCounts[o.cardName] || 0) + 1;
  }

  const topCards = Object.entries(cardCounts)
    .map(([cardName, count]) => ({ cardName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalOrders: allOrders.length,
    institutionalOrders: institutional.length,
    percent: allOrders.length > 0 ? Math.round((institutional.length / allOrders.length) * 1000) / 10 : 0,
    topCards,
  };
}
