// Sentiment Seismograph Service — real-time sentiment readings and alert monitoring

export interface SentimentReading {
  id: string;
  source: string;
  topic: string;
  sentiment: number;
  volume: number;
  trend: 'surging' | 'rising' | 'stable' | 'falling' | 'crashing';
  keywords: string[];
  timestamp: string;
  impactedCards: string[];
}

export interface SentimentAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  sentimentShift: number;
  affectedPlayers: string[];
  priceImpact: string;
  timestamp: string;
  acknowledged: boolean;
}

export function getReadings(): SentimentReading[] {
  return [
    { id: 'sr-1', source: 'Twitter/X', topic: 'Wemby ROY Cards', sentiment: 92, volume: 48500, trend: 'surging', keywords: ['wembanyama', 'ROY', 'generational', 'invest'], timestamp: '2026-03-17T10:00:00Z', impactedCards: ['2023 Prizm Wembanyama RC', '2023 Select Wembanyama RC'] },
    { id: 'sr-2', source: 'Reddit', topic: 'PSA Grading Delays', sentiment: 28, volume: 12300, trend: 'falling', keywords: ['PSA', 'delay', 'weeks', 'frustrated'], timestamp: '2026-03-17T09:30:00Z', impactedCards: ['All PSA submissions'] },
    { id: 'sr-3', source: 'YouTube', topic: 'Vintage Card Investing', sentiment: 76, volume: 34200, trend: 'rising', keywords: ['vintage', 'mantle', '52topps', 'investment'], timestamp: '2026-03-17T08:45:00Z', impactedCards: ['1952 Topps Mantle', '1951 Bowman Mays'] },
    { id: 'sr-4', source: 'Discord', topic: 'Junk Wax Comeback', sentiment: 61, volume: 8900, trend: 'stable', keywords: ['junkwax', 'nostalgia', 'undervalued'], timestamp: '2026-03-17T07:15:00Z', impactedCards: ['1989 Upper Deck Griffey', '1987 Topps Bonds'] },
    { id: 'sr-5', source: 'Instagram', topic: 'NBA Playoff Push', sentiment: 85, volume: 67800, trend: 'surging', keywords: ['playoffs', 'NBA', 'breakout', 'cards'], timestamp: '2026-03-17T06:00:00Z', impactedCards: ['2020 Prizm Edwards RC', '2022 Prizm Banchero RC'] },
  ];
}

export function getAlerts(): SentimentAlert[] {
  return [
    { id: 'sa-1', severity: 'critical', title: 'Massive Sell-off Signal: Zion Williamson', description: 'Negative sentiment spike after latest injury report. Community shifting to sell.', source: 'Multi-platform', sentimentShift: -34, affectedPlayers: ['Zion Williamson'], priceImpact: '-12% to -18% projected', timestamp: '2026-03-17T10:15:00Z', acknowledged: false },
    { id: 'sa-2', severity: 'high', title: 'Hype Surge: Victor Wembanyama', description: 'ROY announcement driving unprecedented social engagement.', source: 'Twitter/X + YouTube', sentimentShift: 28, affectedPlayers: ['Victor Wembanyama'], priceImpact: '+8% to +15% projected', timestamp: '2026-03-17T09:00:00Z', acknowledged: false },
    { id: 'sa-3', severity: 'medium', title: 'Vintage Market Rotation', description: 'Growing influencer consensus that vintage is undervalued.', source: 'YouTube + Podcasts', sentimentShift: 15, affectedPlayers: ['Mickey Mantle', 'Willie Mays'], priceImpact: '+3% to +7% over 30 days', timestamp: '2026-03-16T18:00:00Z', acknowledged: true },
    { id: 'sa-4', severity: 'low', title: 'PSA Turnaround Improvement', description: 'Reports of faster turnaround times on collector forums.', source: 'Reddit + Forums', sentimentShift: 8, affectedPlayers: [], priceImpact: 'Neutral - slight positive', timestamp: '2026-03-16T14:30:00Z', acknowledged: true },
    { id: 'sa-5', severity: 'high', title: 'Trade Deadline Fallout', description: 'Star players traded. Cards of relocated players seeing volatility.', source: 'Twitter/X', sentimentShift: -19, affectedPlayers: ['Various NBA players'], priceImpact: '-5% to +10% depending on destination', timestamp: '2026-03-16T12:00:00Z', acknowledged: false },
  ];
}
