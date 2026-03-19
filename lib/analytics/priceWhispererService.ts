// Price Whisperer Service — AI-powered price negotiation queries and history

export interface PriceQuery {
  id: string;
  cardName: string;
  askingPrice: number;
  fairMarketValue: number;
  suggestedOffer: number;
  confidence: number;
  reasoning: string;
  platform: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export interface QueryHistory {
  id: string;
  cardName: string;
  initialAsk: number;
  finalPrice: number;
  savings: number;
  savingsPercent: number;
  rounds: number;
  outcome: 'won' | 'lost' | 'walked';
  date: string;
}

export function getQueries(): PriceQuery[] {
  return [
    { id: 'pq-1', cardName: '2020 Prizm Joe Burrow RC PSA 10', askingPrice: 285, fairMarketValue: 240, suggestedOffer: 215, confidence: 87, reasoning: 'Recent comps show decline. 3 sold under $240 this week.', platform: 'eBay', timestamp: '2026-03-17T10:30:00Z', status: 'pending' },
    { id: 'pq-2', cardName: '2018 Optic Luka Doncic Rated Rookie PSA 10', askingPrice: 1450, fairMarketValue: 1320, suggestedOffer: 1200, confidence: 79, reasoning: 'Pop count rising, 12 new PSA 10s this month.', platform: 'MySlabs', timestamp: '2026-03-17T09:15:00Z', status: 'countered' },
    { id: 'pq-3', cardName: '1993 SP Foil Derek Jeter RC PSA 9', askingPrice: 520, fairMarketValue: 490, suggestedOffer: 460, confidence: 92, reasoning: 'Seller has listed 45+ days. Price already dropped twice.', platform: 'COMC', timestamp: '2026-03-16T14:20:00Z', status: 'accepted' },
    { id: 'pq-4', cardName: '2019 Prizm Zion Williamson Silver PSA 10', askingPrice: 780, fairMarketValue: 650, suggestedOffer: 580, confidence: 83, reasoning: 'Injury concerns suppress demand. Multiple sellers undercutting.', platform: 'eBay', timestamp: '2026-03-16T11:00:00Z', status: 'pending' },
    { id: 'pq-5', cardName: '2001 Bowman Chrome Albert Pujols RC BGS 9.5', askingPrice: 3200, fairMarketValue: 3100, suggestedOffer: 2900, confidence: 71, reasoning: 'HOF hype priced in. Wait for post-ceremony correction.', platform: 'Heritage', timestamp: '2026-03-15T16:45:00Z', status: 'rejected' },
  ];
}

export function getHistory(): QueryHistory[] {
  return [
    { id: 'qh-1', cardName: '2020 Prizm Joe Burrow RC PSA 10', initialAsk: 310, finalPrice: 235, savings: 75, savingsPercent: 24.2, rounds: 3, outcome: 'won', date: '2026-03-10' },
    { id: 'qh-2', cardName: '2018 Donruss Josh Allen RC PSA 10', initialAsk: 190, finalPrice: 155, savings: 35, savingsPercent: 18.4, rounds: 2, outcome: 'won', date: '2026-03-08' },
    { id: 'qh-3', cardName: '1986 Fleer Michael Jordan RC SGC 6', initialAsk: 18500, finalPrice: 18500, savings: 0, savingsPercent: 0, rounds: 1, outcome: 'lost', date: '2026-03-05' },
    { id: 'qh-4', cardName: '2022 Topps Chrome Julio Rodriguez RC PSA 10', initialAsk: 145, finalPrice: 0, savings: 0, savingsPercent: 0, rounds: 4, outcome: 'walked', date: '2026-03-03' },
    { id: 'qh-5', cardName: '2019 Prizm Ja Morant Silver PSA 10', initialAsk: 420, finalPrice: 350, savings: 70, savingsPercent: 16.7, rounds: 2, outcome: 'won', date: '2026-02-28' },
  ];
}
