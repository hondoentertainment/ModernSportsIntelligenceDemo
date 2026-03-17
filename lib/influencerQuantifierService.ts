export interface InfluencerImpact {
  id: string;
  name: string;
  platform: string;
  followers: number;
  avgPriceImpact: number;
  impactDuration: string;
  recentPosts: number;
  trustScore: number;
}

const mockInfluencers: InfluencerImpact[] = [
  { id: "inf-001", name: "CardBreaksDaily", platform: "YouTube", followers: 892000, avgPriceImpact: 18.4, impactDuration: "48h", recentPosts: 12, trustScore: 87 },
  { id: "inf-002", name: "WaxRippers", platform: "TikTok", followers: 1240000, avgPriceImpact: 24.1, impactDuration: "24h", recentPosts: 34, trustScore: 72 },
  { id: "inf-003", name: "TheHobbyInsider", platform: "Twitter", followers: 345000, avgPriceImpact: 9.7, impactDuration: "72h", recentPosts: 8, trustScore: 94 },
  { id: "inf-004", name: "GradedGemMint", platform: "Instagram", followers: 567000, avgPriceImpact: 12.3, impactDuration: "36h", recentPosts: 15, trustScore: 81 },
  { id: "inf-005", name: "SportsCardRadio", platform: "YouTube", followers: 421000, avgPriceImpact: 7.8, impactDuration: "96h", recentPosts: 4, trustScore: 91 },
  { id: "inf-006", name: "FlipKingCards", platform: "TikTok", followers: 2100000, avgPriceImpact: 31.6, impactDuration: "12h", recentPosts: 48, trustScore: 58 },
];

export function getInfluencers(): InfluencerImpact[] {
  return mockInfluencers;
}

export function getTopImpact(): InfluencerImpact {
  return mockInfluencers.reduce((max, inf) => inf.avgPriceImpact > max.avgPriceImpact ? inf : max);
}

const influencerQuantifierService = { getInfluencers, getTopImpact };
export default influencerQuantifierService;
