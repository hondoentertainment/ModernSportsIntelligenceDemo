// Social Proof Quantifier Service
// Measures social proof pressure on buying decisions

export interface SocialProofSignal {
  id: string;
  signalType: "influencer_mention" | "forum_hype" | "auction_frenzy" | "social_media_trend" | "group_buy" | "celebrity_sighting" | "news_coverage" | "community_poll";
  source: string;
  cardName: string;
  playerName: string;
  pressureScore: number;
  reach: number;
  timestamp: string;
  duration: string;
  status: "active" | "fading" | "expired";
}

export interface ProofPressure {
  id: string;
  cardName: string;
  totalPressure: number;
  signalCount: number;
  dominantSignal: string;
  priceImpact: number;
  buyerSurge: number;
  fakeSignalRisk: number;
  recommendation: "buy" | "wait" | "avoid";
}

export interface BuyingInfluence {
  id: string;
  category: string;
  avgPressure: number;
  conversionRate: number;
  avgPremiumPaid: number;
  regretRate: number;
  timeToRegret: number;
  sampleSize: number;
}

export interface ProofHistory {
  id: string;
  cardName: string;
  peakPressure: number;
  peakDate: string;
  priceAtPeak: number;
  priceNow: number;
  outcome: "profitable" | "break_even" | "loss";
  lessonsLearned: string;
}

const mockSignals: SocialProofSignal[] = [
  { id: "sp1", signalType: "influencer_mention", source: "CardCollector Mike - YouTube", cardName: "2023 Prizm Wembanyama Silver", playerName: "Victor Wembanyama", pressureScore: 82, reach: 342000, timestamp: "2026-04-15T14:30:00Z", duration: "3 days", status: "active" },
  { id: "sp2", signalType: "auction_frenzy", source: "eBay Trending", cardName: "1986 Fleer Jordan #57", playerName: "Michael Jordan", pressureScore: 91, reach: 890000, timestamp: "2026-04-14T09:00:00Z", duration: "5 days", status: "active" },
  { id: "sp3", signalType: "social_media_trend", source: "Twitter/X Trending", cardName: "2024 Prizm Caleb Williams Silver", playerName: "Caleb Williams", pressureScore: 76, reach: 1200000, timestamp: "2026-04-16T11:15:00Z", duration: "1 day", status: "active" },
  { id: "sp4", signalType: "forum_hype", source: "Blowout Forums", cardName: "2025 Bowman Chrome 1st Autos", playerName: "Various Prospects", pressureScore: 68, reach: 45000, timestamp: "2026-04-13T16:45:00Z", duration: "7 days", status: "active" },
  { id: "sp5", signalType: "group_buy", source: "Discord Breaks Community", cardName: "2024 National Treasures NBA Case", playerName: "Multiple", pressureScore: 73, reach: 12000, timestamp: "2026-04-15T20:00:00Z", duration: "2 days", status: "active" },
  { id: "sp6", signalType: "celebrity_sighting", source: "Instagram Story", cardName: "2003 Topps Chrome LeBron RC", playerName: "LeBron James", pressureScore: 88, reach: 5600000, timestamp: "2026-04-12T18:30:00Z", duration: "2 days", status: "fading" },
  { id: "sp7", signalType: "news_coverage", source: "ESPN Feature", cardName: "2018 Prizm Luka Doncic Silver", playerName: "Luka Doncic", pressureScore: 79, reach: 3200000, timestamp: "2026-04-11T08:00:00Z", duration: "4 days", status: "fading" },
  { id: "sp8", signalType: "community_poll", source: "Reddit r/sportscards", cardName: "2020 Prizm Burrow Silver PSA 10", playerName: "Joe Burrow", pressureScore: 55, reach: 180000, timestamp: "2026-04-14T12:00:00Z", duration: "3 days", status: "active" },
  { id: "sp9", signalType: "influencer_mention", source: "Gem Mint 10 - Instagram", cardName: "2018 Topps Chrome Ohtani RC", playerName: "Shohei Ohtani", pressureScore: 71, reach: 198000, timestamp: "2026-04-10T15:00:00Z", duration: "5 days", status: "fading" },
  { id: "sp10", signalType: "auction_frenzy", source: "Heritage Auctions", cardName: "1952 Topps Mantle #311", playerName: "Mickey Mantle", pressureScore: 95, reach: 420000, timestamp: "2026-04-08T10:00:00Z", duration: "10 days", status: "fading" },
  { id: "sp11", signalType: "social_media_trend", source: "TikTok Viral", cardName: "Pokemon Base Set Charizard", playerName: "N/A", pressureScore: 89, reach: 8900000, timestamp: "2026-04-07T22:00:00Z", duration: "3 days", status: "expired" },
  { id: "sp12", signalType: "group_buy", source: "Facebook Hobby Group", cardName: "2025 Topps Series 1 Case", playerName: "Multiple", pressureScore: 62, reach: 8500, timestamp: "2026-04-16T09:30:00Z", duration: "1 day", status: "active" },
  { id: "sp13", signalType: "forum_hype", source: "Sports Card Forum", cardName: "2022 Prizm Paolo Banchero Silver", playerName: "Paolo Banchero", pressureScore: 48, reach: 32000, timestamp: "2026-04-09T14:00:00Z", duration: "4 days", status: "expired" },
  { id: "sp14", signalType: "news_coverage", source: "Bloomberg Article", cardName: "Sports Cards as Alternative Investment", playerName: "Market Wide", pressureScore: 85, reach: 4500000, timestamp: "2026-04-13T07:00:00Z", duration: "7 days", status: "active" },
  { id: "sp15", signalType: "celebrity_sighting", source: "Drake Instagram", cardName: "2019 Prizm Ja Morant Silver", playerName: "Ja Morant", pressureScore: 92, reach: 12000000, timestamp: "2026-04-06T21:00:00Z", duration: "2 days", status: "expired" },
  { id: "sp16", signalType: "influencer_mention", source: "Flip King - TikTok", cardName: "2024 Prizm Draft Picks Hobby Box", playerName: "Various Rookies", pressureScore: 77, reach: 3400000, timestamp: "2026-04-15T16:00:00Z", duration: "1 day", status: "active" },
  { id: "sp17", signalType: "community_poll", source: "Hobby Facebook Groups", cardName: "2020 Prizm Anthony Edwards Silver", playerName: "Anthony Edwards", pressureScore: 64, reach: 95000, timestamp: "2026-04-14T10:30:00Z", duration: "5 days", status: "active" },
  { id: "sp18", signalType: "auction_frenzy", source: "Goldin Auctions", cardName: "2009 National Treasures Curry RPA", playerName: "Stephen Curry", pressureScore: 87, reach: 650000, timestamp: "2026-04-16T14:00:00Z", duration: "3 days", status: "active" }
];

const mockPressures: ProofPressure[] = [
  { id: "pp1", cardName: "1986 Fleer Jordan #57", totalPressure: 91, signalCount: 4, dominantSignal: "auction_frenzy", priceImpact: 12.5, buyerSurge: 340, fakeSignalRisk: 8, recommendation: "wait" },
  { id: "pp2", cardName: "2023 Prizm Wembanyama Silver", totalPressure: 82, signalCount: 3, dominantSignal: "influencer_mention", priceImpact: 8.2, buyerSurge: 220, fakeSignalRisk: 22, recommendation: "wait" },
  { id: "pp3", cardName: "2024 Prizm Caleb Williams Silver", totalPressure: 76, signalCount: 2, dominantSignal: "social_media_trend", priceImpact: 15.8, buyerSurge: 580, fakeSignalRisk: 45, recommendation: "avoid" },
  { id: "pp4", cardName: "2018 Topps Chrome Ohtani RC", totalPressure: 71, signalCount: 2, dominantSignal: "influencer_mention", priceImpact: 5.4, buyerSurge: 120, fakeSignalRisk: 12, recommendation: "buy" },
  { id: "pp5", cardName: "2020 Prizm Burrow Silver PSA 10", totalPressure: 55, signalCount: 1, dominantSignal: "community_poll", priceImpact: 3.1, buyerSurge: 45, fakeSignalRisk: 5, recommendation: "buy" }
];

const mockInfluences: BuyingInfluence[] = [
  { id: "bi1", category: "Influencer Mentions", avgPressure: 76, conversionRate: 34, avgPremiumPaid: 18, regretRate: 42, timeToRegret: 14, sampleSize: 2400 },
  { id: "bi2", category: "Auction Frenzies", avgPressure: 88, conversionRate: 28, avgPremiumPaid: 25, regretRate: 55, timeToRegret: 7, sampleSize: 1800 },
  { id: "bi3", category: "Social Media Trends", avgPressure: 81, conversionRate: 45, avgPremiumPaid: 32, regretRate: 62, timeToRegret: 5, sampleSize: 5200 },
  { id: "bi4", category: "Forum Hype", avgPressure: 58, conversionRate: 22, avgPremiumPaid: 12, regretRate: 28, timeToRegret: 21, sampleSize: 950 },
  { id: "bi5", category: "Group Buys", avgPressure: 67, conversionRate: 52, avgPremiumPaid: 8, regretRate: 18, timeToRegret: 30, sampleSize: 3100 },
  { id: "bi6", category: "Celebrity Sightings", avgPressure: 90, conversionRate: 38, avgPremiumPaid: 42, regretRate: 71, timeToRegret: 3, sampleSize: 4500 },
  { id: "bi7", category: "News Coverage", avgPressure: 82, conversionRate: 31, avgPremiumPaid: 22, regretRate: 48, timeToRegret: 10, sampleSize: 2800 }
];

const mockHistory: ProofHistory[] = [
  { id: "ph1", cardName: "2021 Prizm Trevor Lawrence Silver PSA 10", peakPressure: 94, peakDate: "2021-04-29", priceAtPeak: 850, priceNow: 95, outcome: "loss", lessonsLearned: "NFL draft hype creates extreme FOMO - wait for actual performance" },
  { id: "ph2", cardName: "2019 Prizm Ja Morant Silver PSA 10", peakPressure: 88, peakDate: "2022-01-15", priceAtPeak: 1200, priceNow: 380, outcome: "loss", lessonsLearned: "Social media viral moments inflate prices temporarily" },
  { id: "ph3", cardName: "2018 Topps Chrome Ohtani RC PSA 10", peakPressure: 72, peakDate: "2023-07-01", priceAtPeak: 320, priceNow: 580, outcome: "profitable", lessonsLearned: "Sustained performance validates social proof signals" },
  { id: "ph4", cardName: "1986 Fleer Jordan #57 PSA 10", peakPressure: 96, peakDate: "2021-02-01", priceAtPeak: 738000, priceNow: 420000, outcome: "loss", lessonsLearned: "Even blue chip cards get overheated by social proof pressure" }
];

export function getSocialProofSignals(): SocialProofSignal[] {
  return mockSignals;
}

export function getProofPressures(): ProofPressure[] {
  return mockPressures;
}

export function getBuyingInfluences(): BuyingInfluence[] {
  return mockInfluences;
}

export function getProofHistory(): ProofHistory[] {
  return mockHistory;
}

export function getSocialProofStats() {
  const activeSignals = mockSignals.filter(s => s.status === "active").length;
  const avgPressure = Math.round(mockSignals.reduce((s, sig) => s + sig.pressureScore, 0) / mockSignals.length);
  const totalReach = mockSignals.reduce((s, sig) => s + sig.reach, 0);
  const highRiskCount = mockPressures.filter(p => p.fakeSignalRisk > 30).length;
  const avgRegret = Math.round(mockInfluences.reduce((s, i) => s + i.regretRate, 0) / mockInfluences.length);
  return { activeSignals, avgPressure, totalReach, highRiskCount, avgRegret, totalSignals: mockSignals.length };
}
