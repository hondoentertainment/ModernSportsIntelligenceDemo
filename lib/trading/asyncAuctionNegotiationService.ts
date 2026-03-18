// Phase 244 — Async Auction Negotiation Engine Service

export interface CounterOffer {
  round: number;
  fromParty: 'buyer' | 'seller';
  amount: number;
  message: string;
  timestamp: string;
}

export interface Negotiation {
  id: string;
  card: string;
  player: string;
  buyerOffer: number;
  sellerAsk: number;
  counterOffers: CounterOffer[];
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  startDate: string;
  expiresDate: string;
}

const negotiations: Negotiation[] = [
  {
    id: 'neg-001',
    card: '2023 Prizm Silver #181',
    player: 'Victor Wembanyama',
    buyerOffer: 480,
    sellerAsk: 650,
    counterOffers: [
      {
        round: 1,
        fromParty: 'buyer',
        amount: 480,
        message: 'Interested in this card. Offering $480 based on recent comps.',
        timestamp: '2025-05-10T14:30:00Z',
      },
      {
        round: 2,
        fromParty: 'seller',
        amount: 620,
        message: 'This is a clean copy with sharp corners. Can come down to $620.',
        timestamp: '2025-05-10T18:45:00Z',
      },
      {
        round: 3,
        fromParty: 'buyer',
        amount: 550,
        message: 'I can stretch to $550. Thats my best offer.',
        timestamp: '2025-05-11T09:15:00Z',
      },
    ],
    status: 'active',
    startDate: '2025-05-10',
    expiresDate: '2025-05-17',
  },
  {
    id: 'neg-002',
    card: '2017 Prizm Base #16',
    player: 'Jayson Tatum',
    buyerOffer: 250,
    sellerAsk: 310,
    counterOffers: [
      {
        round: 1,
        fromParty: 'buyer',
        amount: 250,
        message: 'Would you take $250 for the Tatum base?',
        timestamp: '2025-05-08T11:00:00Z',
      },
      {
        round: 2,
        fromParty: 'seller',
        amount: 290,
        message: 'Lowest I can go is $290 — PSA 9 comps are around $300.',
        timestamp: '2025-05-08T16:20:00Z',
      },
    ],
    status: 'accepted',
    startDate: '2025-05-08',
    expiresDate: '2025-05-15',
  },
  {
    id: 'neg-003',
    card: '2020 Prizm Base #258',
    player: 'Anthony Edwards',
    buyerOffer: 180,
    sellerAsk: 275,
    counterOffers: [
      {
        round: 1,
        fromParty: 'buyer',
        amount: 180,
        message: 'Starting offer at $180. Let me know your thoughts.',
        timestamp: '2025-05-12T08:30:00Z',
      },
      {
        round: 2,
        fromParty: 'seller',
        amount: 260,
        message: 'Too low for me. Ant-Man is trending up. $260.',
        timestamp: '2025-05-12T13:00:00Z',
      },
      {
        round: 3,
        fromParty: 'buyer',
        amount: 210,
        message: 'I see raw copies selling for $200. Can do $210.',
        timestamp: '2025-05-13T10:45:00Z',
      },
    ],
    status: 'rejected',
    startDate: '2025-05-12',
    expiresDate: '2025-05-19',
  },
  {
    id: 'neg-004',
    card: '2024 Topps Chrome #200',
    player: 'Paul Skenes',
    buyerOffer: 120,
    sellerAsk: 165,
    counterOffers: [
      {
        round: 1,
        fromParty: 'buyer',
        amount: 120,
        message: 'Offering $120 for the Skenes Chrome.',
        timestamp: '2025-05-14T15:00:00Z',
      },
      {
        round: 2,
        fromParty: 'seller',
        amount: 150,
        message: 'Meet me at $150 and its yours.',
        timestamp: '2025-05-14T21:30:00Z',
      },
    ],
    status: 'active',
    startDate: '2025-05-14',
    expiresDate: '2025-05-21',
  },
  {
    id: 'neg-005',
    card: '2018 Prizm Silver #280',
    player: 'Luka Dončić',
    buyerOffer: 900,
    sellerAsk: 1200,
    counterOffers: [
      {
        round: 1,
        fromParty: 'buyer',
        amount: 900,
        message: 'Offering $900 for the Luka Silver. Market has cooled since the trade.',
        timestamp: '2025-05-06T10:00:00Z',
      },
      {
        round: 2,
        fromParty: 'seller',
        amount: 1100,
        message: 'Still a top-5 player. $1,100 is fair.',
        timestamp: '2025-05-06T17:15:00Z',
      },
      {
        round: 3,
        fromParty: 'buyer',
        amount: 975,
        message: 'Splitting the difference at $975. Final offer.',
        timestamp: '2025-05-07T08:00:00Z',
      },
    ],
    status: 'expired',
    startDate: '2025-05-06',
    expiresDate: '2025-05-13',
  },
];

export function getNegotiations(): Negotiation[] {
  return negotiations;
}

export function getNegotiationStats() {
  const totalNegotiations = negotiations.length;
  const active = negotiations.filter((n) => n.status === 'active').length;
  const accepted = negotiations.filter((n) => n.status === 'accepted').length;
  const rejected = negotiations.filter((n) => n.status === 'rejected').length;
  const expired = negotiations.filter((n) => n.status === 'expired').length;
  const totalCounterOffers = negotiations.reduce(
    (sum, n) => sum + n.counterOffers.length,
    0
  );
  const avgRounds = Math.round((totalCounterOffers / totalNegotiations) * 10) / 10;
  const avgSpread =
    Math.round(
      (negotiations.reduce((sum, n) => sum + (n.sellerAsk - n.buyerOffer), 0) /
        totalNegotiations) *
        100
    ) / 100;

  return {
    totalNegotiations,
    active,
    accepted,
    rejected,
    expired,
    totalCounterOffers,
    avgRounds,
    avgSpread,
    successRate: Math.round((accepted / totalNegotiations) * 100),
  };
}

const asyncAuctionNegotiationService = {
  getNegotiations,
  getNegotiationStats,
};

export default asyncAuctionNegotiationService;
