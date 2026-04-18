// Influencer Decay Curve Service
// Tracks diminishing impact of influencer calls over time

export interface InfluencerCall {
  id: string;
  influencerName: string;
  platform: string;
  followerCount: number;
  cardName: string;
  callType: "buy" | "sell" | "hold" | "avoid";
  callDate: string;
  priceAtCall: number;
  currentPrice: number;
  peakImpactPrice: number;
  peakImpactDay: number;
  halfLifeDays: number;
  currentDecayPercent: number;
  totalViews: number;
  engagementRate: number;
}

export interface DecayProfile {
  id: string;
  influencerName: string;
  avgHalfLife: number;
  avgPeakImpact: number;
  avgDecayRate: number;
  totalCalls: number;
  successRate: number;
  category: string;
  trustScore: number;
  decayCurve: { day: number; impactPercent: number }[];
}

export interface ImpactMeasurement {
  id: string;
  callId: string;
  daysSinceCall: number;
  priceChange: number;
  volumeChange: number;
  sentimentShift: number;
  remainingImpact: number;
  searchInterest: number;
}

export interface DecayHistory {
  id: string;
  influencerName: string;
  month: string;
  callsMade: number;
  avgImpactDuration: number;
  avgPriceImpact: number;
  credibilityTrend: number;
}

const mockInfluencerCalls: InfluencerCall[] = [
  { id: "ic1", influencerName: "CardCollector Mike", platform: "YouTube", followerCount: 485000, cardName: "2023 Prizm Wembanyama Silver", callType: "buy", callDate: "2026-03-15", priceAtCall: 520, currentPrice: 680, peakImpactPrice: 780, peakImpactDay: 3, halfLifeDays: 8, currentDecayPercent: 85, totalViews: 342000, engagementRate: 6.8 },
  { id: "ic2", influencerName: "Sports Card Dad", platform: "YouTube", followerCount: 312000, cardName: "2020 Prizm Herbert Silver PSA 10", callType: "buy", callDate: "2026-02-28", priceAtCall: 95, currentPrice: 82, peakImpactPrice: 125, peakImpactDay: 2, halfLifeDays: 5, currentDecayPercent: 95, totalViews: 189000, engagementRate: 5.2 },
  { id: "ic3", influencerName: "The Hobby Guru", platform: "Twitter/X", followerCount: 178000, cardName: "2019 Prizm Zion Silver PSA 10", callType: "sell", callDate: "2026-04-01", priceAtCall: 310, currentPrice: 280, peakImpactPrice: 265, peakImpactDay: 4, halfLifeDays: 6, currentDecayPercent: 72, totalViews: 95000, engagementRate: 4.1 },
  { id: "ic4", influencerName: "Gem Mint 10", platform: "Instagram", followerCount: 267000, cardName: "2018 Topps Chrome Ohtani RC", callType: "buy", callDate: "2026-03-20", priceAtCall: 480, currentPrice: 580, peakImpactPrice: 620, peakImpactDay: 5, halfLifeDays: 12, currentDecayPercent: 65, totalViews: 156000, engagementRate: 7.3 },
  { id: "ic5", influencerName: "Rip and Ship Joe", platform: "TikTok", followerCount: 890000, cardName: "2024 Prizm Draft Picks Case", callType: "buy", callDate: "2026-04-05", priceAtCall: 1800, currentPrice: 1650, peakImpactPrice: 2100, peakImpactDay: 1, halfLifeDays: 3, currentDecayPercent: 90, totalViews: 2100000, engagementRate: 9.2 },
  { id: "ic6", influencerName: "Vintage Card Kings", platform: "YouTube", followerCount: 145000, cardName: "1986 Fleer Jordan PSA 8", callType: "buy", callDate: "2026-01-10", priceAtCall: 8500, currentPrice: 9200, peakImpactPrice: 9800, peakImpactDay: 7, halfLifeDays: 21, currentDecayPercent: 92, totalViews: 78000, engagementRate: 4.5 },
  { id: "ic7", influencerName: "Pack Rip Pros", platform: "YouTube", followerCount: 523000, cardName: "2025 Topps Series 1 Hobby Box", callType: "buy", callDate: "2026-03-01", priceAtCall: 180, currentPrice: 145, peakImpactPrice: 210, peakImpactDay: 2, halfLifeDays: 4, currentDecayPercent: 98, totalViews: 412000, engagementRate: 8.1 },
  { id: "ic8", influencerName: "Baller Card Investments", platform: "Twitter/X", followerCount: 92000, cardName: "2022 Prizm Paolo Banchero Silver", callType: "sell", callDate: "2026-04-08", priceAtCall: 145, currentPrice: 120, peakImpactPrice: 110, peakImpactDay: 3, halfLifeDays: 7, currentDecayPercent: 55, totalViews: 45000, engagementRate: 3.8 },
  { id: "ic9", influencerName: "CardCollector Mike", platform: "YouTube", followerCount: 485000, cardName: "2021 Bowman Chrome Marcelo Mayer 1st", callType: "buy", callDate: "2026-02-15", priceAtCall: 35, currentPrice: 42, peakImpactPrice: 55, peakImpactDay: 4, halfLifeDays: 9, currentDecayPercent: 88, totalViews: 267000, engagementRate: 5.9 },
  { id: "ic10", influencerName: "The Break Room", platform: "Twitch", followerCount: 156000, cardName: "2024 National Treasures NFL Case", callType: "buy", callDate: "2026-03-25", priceAtCall: 12500, currentPrice: 11200, peakImpactPrice: 14200, peakImpactDay: 2, halfLifeDays: 5, currentDecayPercent: 82, totalViews: 89000, engagementRate: 11.2 },
  { id: "ic11", influencerName: "Hobby Hotline", platform: "Podcast", followerCount: 68000, cardName: "2020 Prizm Burrow Silver PSA 10", callType: "buy", callDate: "2026-04-02", priceAtCall: 420, currentPrice: 450, peakImpactPrice: 495, peakImpactDay: 6, halfLifeDays: 14, currentDecayPercent: 48, totalViews: 34000, engagementRate: 3.2 },
  { id: "ic12", influencerName: "Sports Card Dad", platform: "YouTube", followerCount: 312000, cardName: "2023 Topps Chrome Corbin Carroll RC", callType: "sell", callDate: "2026-03-10", priceAtCall: 28, currentPrice: 22, peakImpactPrice: 20, peakImpactDay: 5, halfLifeDays: 8, currentDecayPercent: 78, totalViews: 145000, engagementRate: 4.8 },
  { id: "ic13", influencerName: "Gem Mint 10", platform: "Instagram", followerCount: 267000, cardName: "2018 Prizm Luka Doncic Silver PSA 10", callType: "hold", callDate: "2026-04-10", priceAtCall: 4200, currentPrice: 4200, peakImpactPrice: 4350, peakImpactDay: 2, halfLifeDays: 6, currentDecayPercent: 42, totalViews: 198000, engagementRate: 6.1 },
  { id: "ic14", influencerName: "Flip King", platform: "TikTok", followerCount: 1200000, cardName: "2024 Prizm Caleb Williams Silver", callType: "buy", callDate: "2026-04-12", priceAtCall: 85, currentPrice: 92, peakImpactPrice: 110, peakImpactDay: 1, halfLifeDays: 2, currentDecayPercent: 78, totalViews: 3400000, engagementRate: 12.5 },
  { id: "ic15", influencerName: "The Hobby Guru", platform: "Twitter/X", followerCount: 178000, cardName: "2011 Topps Update Trout RC PSA 10", callType: "buy", callDate: "2026-03-28", priceAtCall: 3100, currentPrice: 3200, peakImpactPrice: 3450, peakImpactDay: 5, halfLifeDays: 15, currentDecayPercent: 58, totalViews: 82000, engagementRate: 4.6 }
];

const mockDecayProfiles: DecayProfile[] = [
  { id: "dp1", influencerName: "CardCollector Mike", avgHalfLife: 8.5, avgPeakImpact: 18.5, avgDecayRate: 8.2, totalCalls: 142, successRate: 62, category: "YouTube Creator", trustScore: 74, decayCurve: [{ day: 0, impactPercent: 100 }, { day: 2, impactPercent: 85 }, { day: 5, impactPercent: 60 }, { day: 8, impactPercent: 50 }, { day: 12, impactPercent: 30 }, { day: 18, impactPercent: 15 }, { day: 25, impactPercent: 5 }] },
  { id: "dp2", influencerName: "Flip King", avgHalfLife: 2.1, avgPeakImpact: 32.0, avgDecayRate: 33.0, totalCalls: 310, successRate: 38, category: "TikTok Creator", trustScore: 42, decayCurve: [{ day: 0, impactPercent: 100 }, { day: 1, impactPercent: 70 }, { day: 2, impactPercent: 50 }, { day: 3, impactPercent: 25 }, { day: 5, impactPercent: 10 }, { day: 7, impactPercent: 3 }] },
  { id: "dp3", influencerName: "Vintage Card Kings", avgHalfLife: 21.0, avgPeakImpact: 8.2, avgDecayRate: 3.3, totalCalls: 48, successRate: 78, category: "YouTube Creator", trustScore: 88, decayCurve: [{ day: 0, impactPercent: 100 }, { day: 7, impactPercent: 82 }, { day: 14, impactPercent: 65 }, { day: 21, impactPercent: 50 }, { day: 30, impactPercent: 35 }, { day: 45, impactPercent: 18 }, { day: 60, impactPercent: 8 }] },
  { id: "dp4", influencerName: "Hobby Hotline", avgHalfLife: 14.0, avgPeakImpact: 6.5, avgDecayRate: 5.0, totalCalls: 85, successRate: 71, category: "Podcast", trustScore: 81, decayCurve: [{ day: 0, impactPercent: 100 }, { day: 5, impactPercent: 78 }, { day: 10, impactPercent: 58 }, { day: 14, impactPercent: 50 }, { day: 20, impactPercent: 32 }, { day: 30, impactPercent: 15 }] },
  { id: "dp5", influencerName: "Rip and Ship Joe", avgHalfLife: 3.0, avgPeakImpact: 28.0, avgDecayRate: 23.0, totalCalls: 520, successRate: 35, category: "TikTok Creator", trustScore: 38, decayCurve: [{ day: 0, impactPercent: 100 }, { day: 1, impactPercent: 78 }, { day: 3, impactPercent: 50 }, { day: 5, impactPercent: 28 }, { day: 7, impactPercent: 12 }, { day: 10, impactPercent: 4 }] }
];

const mockImpactMeasurements: ImpactMeasurement[] = [
  { id: "im1", callId: "ic1", daysSinceCall: 34, priceChange: 30.8, volumeChange: 145, sentimentShift: 25, remainingImpact: 15, searchInterest: 220 },
  { id: "im2", callId: "ic5", daysSinceCall: 13, priceChange: -8.3, volumeChange: 380, sentimentShift: 42, remainingImpact: 10, searchInterest: 890 },
  { id: "im3", callId: "ic4", daysSinceCall: 29, priceChange: 20.8, volumeChange: 95, sentimentShift: 18, remainingImpact: 35, searchInterest: 125 },
  { id: "im4", callId: "ic14", daysSinceCall: 6, priceChange: 8.2, volumeChange: 520, sentimentShift: 55, remainingImpact: 22, searchInterest: 1450 },
  { id: "im5", callId: "ic11", daysSinceCall: 16, priceChange: 7.1, volumeChange: 45, sentimentShift: 12, remainingImpact: 52, searchInterest: 38 }
];

const mockDecayHistory: DecayHistory[] = [
  { id: "dh1", influencerName: "CardCollector Mike", month: "2026-01", callsMade: 12, avgImpactDuration: 9.2, avgPriceImpact: 15.5, credibilityTrend: 2.1 },
  { id: "dh2", influencerName: "CardCollector Mike", month: "2026-02", callsMade: 14, avgImpactDuration: 8.8, avgPriceImpact: 14.2, credibilityTrend: -0.8 },
  { id: "dh3", influencerName: "CardCollector Mike", month: "2026-03", callsMade: 11, avgImpactDuration: 8.5, avgPriceImpact: 12.8, credibilityTrend: -1.5 },
  { id: "dh4", influencerName: "Flip King", month: "2026-01", callsMade: 45, avgImpactDuration: 2.5, avgPriceImpact: 35.0, credibilityTrend: -5.2 },
  { id: "dh5", influencerName: "Flip King", month: "2026-02", callsMade: 52, avgImpactDuration: 2.2, avgPriceImpact: 30.0, credibilityTrend: -8.1 },
  { id: "dh6", influencerName: "Flip King", month: "2026-03", callsMade: 48, avgImpactDuration: 1.8, avgPriceImpact: 25.0, credibilityTrend: -12.3 },
  { id: "dh7", influencerName: "Vintage Card Kings", month: "2026-01", callsMade: 4, avgImpactDuration: 22.0, avgPriceImpact: 8.5, credibilityTrend: 1.2 },
  { id: "dh8", influencerName: "Vintage Card Kings", month: "2026-02", callsMade: 3, avgImpactDuration: 21.5, avgPriceImpact: 8.8, credibilityTrend: 0.8 },
  { id: "dh9", influencerName: "Vintage Card Kings", month: "2026-03", callsMade: 5, avgImpactDuration: 20.8, avgPriceImpact: 9.1, credibilityTrend: 1.5 }
];

export function getInfluencerCalls(): InfluencerCall[] {
  return mockInfluencerCalls;
}

export function getDecayProfiles(): DecayProfile[] {
  return mockDecayProfiles;
}

export function getImpactMeasurements(): ImpactMeasurement[] {
  return mockImpactMeasurements;
}

export function getDecayHistory(): DecayHistory[] {
  return mockDecayHistory;
}

export function getInfluencerStats() {
  const totalCalls = mockInfluencerCalls.length;
  const avgHalfLife = parseFloat((mockInfluencerCalls.reduce((s, c) => s + c.halfLifeDays, 0) / totalCalls).toFixed(1));
  const avgDecay = Math.round(mockInfluencerCalls.reduce((s, c) => s + c.currentDecayPercent, 0) / totalCalls);
  const totalViews = mockInfluencerCalls.reduce((s, c) => s + c.totalViews, 0);
  const avgEngagement = parseFloat((mockInfluencerCalls.reduce((s, c) => s + c.engagementRate, 0) / totalCalls).toFixed(1));
  return { totalCalls, avgHalfLife, avgDecay, totalViews, avgEngagement, profileCount: mockDecayProfiles.length };
}
